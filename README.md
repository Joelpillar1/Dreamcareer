# 🏢 Careerhut — Direct Company Career Page Job Dashboard

**Careerhut** is a full-stack engine and **React 18** web application designed specifically to crawl, extract, and monitor open positions **directly from official company career pages** (e.g., `company.com/careers`, `stripe.com/jobs`, `openai.com/careers`) — bypassing all third-party job boards and aggregators.

---

## 🌟 Key Features

1. **100% Direct Employer Sources:**
   * Discovers and crawls official company career portals (`/careers`, `/jobs`, `/open-roles`, `/join-us`).
   * Extracts verified postings directly from company domains.
2. **Verified Follow-Up & Recruiter Email Discovery:**
   * Automatically scans for hiring inboxes (`careers@`, `jobs@`, `recruiting@`, `talent@`, `hiring@`, `team@`).
   * Ranks and attaches verified follow-up contacts to each job card.
3. **Interactive React 18 Job Dashboard:**
   * **Card Grid View**: Responsive glassmorphic cards with salary tags, workplace badges, and direct apply links.
   * **Compact Table View**: High-density interactive data table.
   * **Kanban Pipeline Board**: Visual application lifecycle tracker across 5 stages:
     `Discovered` ➔ `Saved & Researching` ➔ `Applied` ➔ `Interviewing` ➔ `Offered 🎉`
4. **Follow-Up Email Outreach Studio:**
   * Built-in template generator (*Application Follow-up*, *Direct Recruiter Pitch*, *Informational Inquiry*).
   * 1-Click "Open in Mail Client" with pre-filled subject and body.
5. **Batch Career Portal Crawler:**
   * Paste multiple company URLs to crawl in parallel with live animated progress.
6. **Multi-Engine Fetching:**
   * **Schema.org / JSON-LD Extractor**: Extracts official `JobPosting` metadata.
   * **Embedded State Parser**: Detects and parses Next.js, Nuxt, and React hydration state.
   * **Agent Reach / Jina Reader Integration**: High-resilience parsing that bypasses bot protection.
   * **Headless Browser (Playwright)**: Handles client-side rendered SPAs.

---

## 🚀 Running Careerhut

### Option A: Complete Full-Stack App (Python + React Bundle)
```bash
python main.py
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser.

---

### Option B: React Frontend Development (with Vite Hot Reload)
1. Start the Python backend:
   ```bash
   python main.py
   ```
2. In a separate terminal, start the Vite React dev server:
   ```bash
   npm run dev
   ```
3. Open **[http://localhost:5173](http://localhost:5173)**. (All `/api` requests are automatically proxied to the backend).

4. Rebuild the production React bundle at any time:
   ```bash
   npm run build
   ```

---

## 💻 CLI Commands

**Fetch jobs from a company career page:**
```bash
python main.py fetch "https://stripe.com/jobs"
python main.py fetch "https://openai.com/careers" --limit 25
```

**List & filter saved positions:**
```bash
python main.py list --type Remote
python main.py list --company Stripe --query "Engineer"
```

**Export saved jobs:**
```bash
python main.py export --format=csv --output=jobs.csv
python main.py export --format=json --output=jobs.json
```

---

## 📁 Project Structure

```
Careerhut/
├── src/                     # React 18 Frontend
│   ├── components/
│   │   ├── Navbar.jsx           # Brand, live status, batch crawl trigger, export
│   │   ├── HeroCrawler.jsx      # Company URL input, SPA toggle, presets
│   │   ├── MetricsRibbon.jsx    # Stats counter cards
│   │   ├── ViewToolbar.jsx      # View switcher (Grid, Table, Kanban) & Bookmarks
│   │   ├── SidebarFilters.jsx   # Keyword search, company, workplace, email filter
│   │   ├── JobCard.jsx          # Glassmorphic job card with email & star bookmark
│   │   ├── JobGridView.jsx      # Responsive card grid
│   │   ├── JobTableView.jsx     # Compact data table
│   │   ├── KanbanBoard.jsx      # 5-column application pipeline board
│   │   ├── JobDetailModal.jsx   # Job detail inspector + Outreach Studio
│   │   └── BatchCrawlModal.jsx  # Multi-URL batch crawler modal
│   ├── App.jsx              # Master application controller & state
│   ├── main.jsx             # React entrypoint
│   └── index.css            # Modern glassmorphism & typography design system
├── careerhut/               # Python Backend & Engine
│   ├── crawler.py           # Multi-engine career page crawler
│   ├── extractor.py         # Schema.org, DOM, and email extractor
│   ├── storage.py           # SQLite persistence, indexing, and CSV/JSON export
│   ├── server.py            # HTTP & REST API server
│   ├── cli.py               # Rich terminal CLI
│   └── static/              # Compiled React production bundle
├── main.py                  # Main entrypoint
├── package.json             # React & Vite dependencies
├── vite.config.js           # Vite config + API proxy
└── requirements.txt         # Python dependencies
```
