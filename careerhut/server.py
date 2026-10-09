"""
Careerhut Server - Robust HTTP & REST API Server for Direct Company Job Fetching & Dashboard
Includes support for single/batch crawling, application pipeline tracker, bookmarks, and direct exports.
"""

import os
import gzip
import json
import sqlite3
import time
import threading
import urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple

from .models import ScrapeRequest, ScrapeResult, JobListing
from .crawler import CareerCrawler
from .storage import JobStorage
from .mass_crawler import MassCrawler
from .sources import SEED_COMPANIES, parse_url_list

STATIC_DIR = Path(__file__).parent / "static"
storage = JobStorage()
crawler = CareerCrawler(storage=storage)

# --- Mass fetch background job state --------------------------------------
_mass_lock = threading.Lock()
_mass_state: Dict[str, Any] = {
    "running": False,
    "completed": 0,
    "total": 0,
    "jobs_found": 0,
    "jobs_saved": 0,
    "current_company": None,
    "current_engine": None,
    "engine_breakdown": {},
    "errors": [],
    "started_at": None,
    "finished_at": None,
    "summary": None,
}


# The dashboard's older builds send max_jobs: 100 / 50, which silently truncated
# large boards (CrowdStrike publishes 351 roles, MongoDB 392). The cap only ever
# trims, so a client-supplied value below the floor is raised to it.
MIN_JOBS_PER_COMPANY = 500


def _resolve_max_jobs(requested: Any) -> int:
    try:
        value = int(requested or MIN_JOBS_PER_COMPANY)
    except (TypeError, ValueError):
        value = MIN_JOBS_PER_COMPANY
    return max(value, MIN_JOBS_PER_COMPANY)


def _reset_mass_state(total: int):
    with _mass_lock:
        _mass_state.update({
            "running": True,
            "completed": 0,
            "total": total,
            "jobs_found": 0,
            "jobs_saved": 0,
            "current_company": None,
            "current_engine": None,
            "engine_breakdown": {},
            "errors": [],
            "started_at": time.time(),
            "finished_at": None,
            "summary": None,
        })


def _run_mass_fetch(companies: List[Any], max_jobs: int, workers: int):
    try:
        mass = MassCrawler(storage=storage, max_workers=workers, use_browser=False)

        def on_progress(p: Dict[str, Any]):
            with _mass_lock:
                _mass_state["completed"] = p.get("completed", 0)
                _mass_state["current_company"] = p.get("company")
                _mass_state["current_engine"] = p.get("engine")
                if p.get("jobs_count"):
                    engine = p.get("engine") or "unknown"
                    _mass_state["engine_breakdown"][engine] = (
                        _mass_state["engine_breakdown"].get(engine, 0) + p["jobs_count"]
                    )

        summary = mass.run(companies=companies, max_jobs_per_company=max_jobs, on_progress=on_progress)
        with _mass_lock:
            _mass_state["jobs_found"] = summary.get("jobs_found", 0)
            _mass_state["jobs_saved"] = summary.get("jobs_saved", 0)
            _mass_state["errors"] = summary.get("errors", [])
            _mass_state["summary"] = {
                "companies_total": summary.get("companies_total"),
                "companies_processed": summary.get("companies_processed"),
                "duration_seconds": summary.get("duration_seconds"),
            }
    except Exception as exc:  # pragma: no cover - defensive
        with _mass_lock:
            _mass_state["errors"] = [{"company": None, "error": str(exc)}]
    finally:
        with _mass_lock:
            _mass_state["running"] = False
            _mass_state["finished_at"] = time.time()


# --- List read cache ------------------------------------------------------
# A full /api/jobs load pages through every row, and every row carries its
# full description: building that list costs a multi-second full-table read
# (~10s per 2,000 rows on a loaded machine) plus ~10-17 MB of JSON per page,
# so one dashboard load re-pays that cost six times - easily slow enough for
# a page request to die and silently fall back to the embedded 709-row demo
# dataset. Build the snapshot once in the background instead, serve every
# page (plus stats/companies) from memory, and refresh whenever the row
# count moves so roles written by a crawl still show up within seconds.
_CACHE_TTL = 30.0
_JOBS_KEY = "jobs:all"
_STATS_KEY = "stats"
_COMPANIES_KEY = "companies"
_cache_lock = threading.Lock()
_cache_entries: Dict[str, Tuple[float, Any]] = {}
_cache_builds: Dict[str, bool] = {}


def _start_build(key: str, builder) -> bool:
    """Kick off one background rebuild for a key (False if one is running)."""
    with _cache_lock:
        if _cache_builds.get(key):
            return False
        _cache_builds[key] = True

    def _run():
        try:
            value = builder()
            with _cache_lock:
                _cache_entries[key] = (time.time(), value)
        except Exception:
            pass  # the next tick retries; meanwhile the stale copy still serves
        finally:
            with _cache_lock:
                _cache_builds[key] = False

    threading.Thread(target=_run, daemon=True, name=f"warm-{key}").start()
    return True


def _cached(key: str, builder):
    """Serve a snapshot without ever making a request wait for a rebuild.

    Fresh entry -> returned as-is.  Expired -> the stale copy is returned too
    while a single background rebuild runs (stale beats a stalled request, and
    a stalled request is what dropped the dashboard onto its 709-row fallback).
    Only a genuinely cold cache waits, and the warmer thread fills that in at
    startup so the first page load never pays the ~10-30s build.
    """
    with _cache_lock:
        entry = _cache_entries.get(key)

    if entry is None:
        deadline = time.time() + 90.0
        while time.time() < deadline:
            _start_build(key, builder)     # no-op while a build is in flight
            time.sleep(0.25)
            with _cache_lock:
                entry = _cache_entries.get(key)
            if entry is not None:
                return entry[1]
        raise RuntimeError("cache build timed out")

    if time.time() - entry[0] < _CACHE_TTL:
        return entry[1]

    _start_build(key, builder)             # refresh behind the scenes
    return entry[1]                        # stale now, fresh next time


def _build_all_jobs() -> List[Dict[str, Any]]:
    # "No cap" limit with the same ORDER BY the paged query uses, so a
    # rows[offset:offset+limit] slice matches what SQLite would have returned.
    return [j.dict() for j in storage.get_jobs(limit=100000, offset=0)]


def _row_count() -> int:
    """Cheap change signal for the refresher - COUNT(*) runs in ~0.05s."""
    try:
        conn = sqlite3.connect(storage.db_path, timeout=5.0)
        try:
            return int(conn.execute("SELECT COUNT(*) FROM jobs").fetchone()[0])
        finally:
            conn.close()
    except Exception:
        return -1


def _cache_refresher():
    # Daemon loop: warm the snapshot before the first page load, then keep
    # it in step with the database. Rebuilding only on a row-count change
    # (plus a staleness cap for in-place updates) keeps this cheap at idle.
    _start_build(_JOBS_KEY, _build_all_jobs)   # warm before the first request
    _start_build(_STATS_KEY, storage.get_stats)
    while True:
        time.sleep(5)
        try:
            with _cache_lock:
                job_entry = _cache_entries.get(_JOBS_KEY)
                stats_entry = _cache_entries.get(_STATS_KEY)
            now = time.time()
            rows = job_entry[1] if job_entry else None
            job_age = (now - job_entry[0]) if job_entry else 1e9
            stats_age = (now - stats_entry[0]) if stats_entry else 1e9
            count = _row_count()
            if rows is None or job_age > 180.0 or (count >= 0 and len(rows) != count):
                _start_build(_JOBS_KEY, _build_all_jobs)
                stats_age = 1e9  # totals moved together with the rows
            if stats_age > _CACHE_TTL:
                _start_build(_STATS_KEY, storage.get_stats)
        except Exception:
            continue  # never let one bad read kill the warmer


threading.Thread(target=_cache_refresher, daemon=True).start()


class CareerhutRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        if path == "/api/jobs":
            company = params.get("company", [None])[0]
            q = params.get("q", [None])[0]
            location = params.get("location", [None])[0]
            workplace_type = params.get("workplace_type", [None])[0]
            app_status = params.get("app_status", [None])[0]
            only_bookmarked = params.get("only_bookmarked", ["false"])[0].lower() == "true"
            limit = int(params.get("limit", [5000])[0])
            offset = max(0, int(params.get("offset", [0])[0]))

            # Filtered queries go straight to SQLite; the unfiltered feed the
            # dashboard pages through is served from the shared snapshot.
            has_filters = bool(
                company or q or location or app_status or only_bookmarked
                or (workplace_type and workplace_type.lower() != "all")
            )
            if has_filters:
                jobs = storage.get_jobs(
                    company=company,
                    search_query=q,
                    location=location,
                    workplace_type=workplace_type,
                    app_status=app_status,
                    only_bookmarked=only_bookmarked,
                    limit=limit,
                    offset=offset
                )
                self._send_json([j.dict() for j in jobs])
            else:
                rows = _cached(_JOBS_KEY, _build_all_jobs)
                self._send_json(rows[offset:offset + limit] if limit > 0 else [])

        elif path == "/api/companies":
            self._send_json(_cached(_COMPANIES_KEY, storage.get_companies))

        elif path == "/api/stats":
            self._send_json(_cached(_STATS_KEY, storage.get_stats))

        elif path == "/api/mass-fetch/status":
            with _mass_lock:
                snapshot = dict(_mass_state)
            self._send_json(snapshot)

        elif path == "/api/mass-fetch/presets":
            self._send_json({"seed_count": len(SEED_COMPANIES), "companies": SEED_COMPANIES})

        elif path == "/api/export/csv":
            csv_data = storage.export_csv()
            self.send_response(200)
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Disposition", "attachment; filename=careerhut_jobs.csv")
            self.end_headers()
            self.wfile.write(csv_data.encode("utf-8"))

        elif path == "/api/export/json":
            jobs = [j.dict() for j in storage.get_jobs(limit=10000)]
            self._send_json(jobs)

        elif path in ["", "/", "/index.html"]:
            index_path = STATIC_DIR / "index.html"
            if index_path.exists():
                with open(index_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "Index file not found")
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body.decode("utf-8")) if body else {}
        except Exception:
            data = {}

        if path == "/api/fetch":
            try:
                company_url = data.get("company_url")
                # Default high enough to keep every opening on a large board
                # (CrowdStrike publishes 350+ roles).
                max_jobs = _resolve_max_jobs(data.get("max_jobs"))

                if not company_url:
                    self._send_json({"status": "error", "error_message": "company_url is required"}, status=400)
                    return

                result = crawler.crawl_sync(
                    company_url, max_jobs=max_jobs, use_browser=use_browser, async_enrich=True
                )
                self._send_json(result.dict())
            except Exception as e:
                self._send_json({"status": "error", "error_message": str(e)}, status=500)

        elif path == "/api/mass-fetch":
            try:
                if _mass_state.get("running"):
                    self._send_json({"status": "already_running"}, status=409)
                    return

                urls = data.get("urls")
                if isinstance(urls, str):
                    companies = parse_url_list(urls)
                elif isinstance(urls, list) and urls:
                    companies = parse_url_list("\n".join(str(u) for u in urls))
                else:
                    companies = list(SEED_COMPANIES)

                limit = int(data.get("limit", 0) or 0)
                if limit > 0:
                    companies = companies[:limit]

                max_jobs = _resolve_max_jobs(data.get("max_jobs"))
                workers = int(data.get("workers", 10))

                if not companies:
                    self._send_json({"status": "error", "error_message": "No companies to crawl"}, status=400)
                    return

                _reset_mass_state(len(companies))
                thread = threading.Thread(
                    target=_run_mass_fetch,
                    args=(companies, max_jobs, workers),
                    daemon=True,
                )
                thread.start()
                self._send_json({"status": "started", "companies": len(companies)})
            except Exception as e:
                self._send_json({"status": "error", "error_message": str(e)}, status=500)

        elif path == "/api/batch-fetch":
            try:
                urls = data.get("urls", [])
                max_jobs = _resolve_max_jobs(data.get("max_jobs"))
                results = []
                for u in urls:
                    u_clean = u.strip()
                    if u_clean:
                        res = crawler.crawl_sync(u_clean, max_jobs=max_jobs, use_browser=True, async_enrich=True)
                        results.append(res.dict())
                self._send_json({"status": "success", "results": results})
            except Exception as e:
                self._send_json({"status": "error", "error_message": str(e)}, status=500)

        elif path.startswith("/api/jobs/") and path.endswith("/status"):
            # e.g. /api/jobs/{job_id}/status
            parts = path.strip("/").split("/")
            if len(parts) == 4 and parts[1] == "jobs" and parts[3] == "status":
                job_id = parts[2]
                status_val = data.get("status")
                notes_val = data.get("notes")
                is_bm = data.get("is_bookmarked")
                
                success = storage.update_job_status(job_id, status=status_val, notes=notes_val, is_bookmarked=is_bm)
                self._send_json({"status": "success" if success else "error"})
                return
            self.send_error(400, "Invalid status endpoint")
        else:
            self.send_error(404, "Endpoint not found")

    def _send_json(self, data: Any, status: int = 200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        # The jobs payload is tens of MB of mostly-repetitive text; gzip cuts
        # the dashboard's initial load from ~50 MB to a few MB.
        accepts_gzip = "gzip" in (self.headers.get("Accept-Encoding", "") or "").lower()
        if accepts_gzip and len(body) > 4096:
            body = gzip.compress(body, compresslevel=6)
            compressed = True
        else:
            compressed = False
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Vary", "Accept-Encoding")
        if compressed:
            self.send_header("Content-Encoding", "gzip")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        pass


def run_server(host: str = "127.0.0.1", port: int = 8000):
    server_address = (host, port)
    # Threading: the dashboard fetches every jobs page concurrently, so a
    # single-threaded server would queue them and stall the initial load.
    httpd = ThreadingHTTPServer(server_address, CareerhutRequestHandler)
    httpd.daemon_threads = True
    print(f"🚀 Careerhut Server active at http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
