"""Temporary baseline probe: crawl the target URLs, print engine/count/samples. No DB writes."""
import io, sys, json, time

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from careerhut.mass_crawler import MassCrawler

URLS = [
    "https://zapier.com/jobs#job-openings",
    "https://www.pinterestcareers.com/jobs/",
    "https://crowdstrike.wd5.myworkdayjobs.com/crowdstrikecareers",
    "https://www.mongodb.com/company/careers/see-jobs",
    "https://about.gitlab.com/jobs/all-jobs/",
    "https://www.docker.com/career-openings/",
    "https://wikimediafoundation.org/jobs/#section-1",
    "https://www.okta.com/company/careers/job-listing/",
    "https://www.postman.com/company/careers/open-positions/",
    "https://remote.com/openings",
    "https://www.lifeatspotify.com/jobs",
    "https://www.coinbase.com/careers/positions?country=NG&currency=NGN&mobile=false&japan_bespoke_content=false&logged_in=false&null=",
    "https://www.deel.com/careers/",
]

mass = MassCrawler(max_workers=1, use_browser=True)
out = []
for url in URLS:
    t0 = time.time()
    res = mass.crawl_company(url, max_jobs=1000)
    jobs = res.get("jobs") or []
    titles = [j.title for j in jobs]
    desc_lens = [len(j.description or "") for j in jobs]
    rec = {
        "url": url,
        "engine": res.get("engine"),
        "count": len(jobs),
        "status": res.get("status"),
        "error": res.get("error"),
        "duration": round(time.time() - t0, 1),
        "empty_desc": sum(1 for d in desc_lens if d < 200),
        "sample_titles": titles[:6],
    }
    out.append(rec)
    print(json.dumps(rec, ensure_ascii=False), flush=True)

print("\nDONE")
