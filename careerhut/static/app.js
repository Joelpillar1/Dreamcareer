/**
 * Careerhut - Job Dashboard & Application Pipeline Engine
 */

let allJobs = [];
let currentView = "grid"; // "grid", "table", "kanban"
let currentFilter = {
  keyword: "",
  company: "",
  workplace: "",
  location: "",
  hasEmail: false,
  onlyBookmarked: false,
  sortBy: "newest"
};

const EMAIL_TEMPLATES = {
  followup: {
    title: "Application Follow-up",
    subject: "Application Follow-up: {title} - {company}",
    body: `Hi {company} Hiring Team,\n\nI hope this email finds you well.\n\nI recently reviewed the {title} opening on your official career portal ({job_url}) and wanted to follow up directly. My background closely aligns with your team's focus, and I am very interested in contributing to {company}.\n\nI have attached my resume for your review and would love to connect for a brief conversation regarding how I can add immediate value.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]\n[Your Phone / Portfolio]`
  },
  pitch: {
    title: "Direct Recruiter Pitch",
    subject: "Inquiry: {title} Role at {company} - [Your Name]",
    body: `Hello {company} Talent Team,\n\nI noticed the {title} opening listed on your careers page. Having followed {company}'s recent growth, I wanted to reach out directly to express my enthusiasm for this role.\n\nWith experience in [Your Core Skill / Tech Stack], I have previously delivered [mention 1 strong achievement or project]. I believe my experience makes me a strong fit for your team.\n\nWould you be open to a 10-minute chat this week?\n\nBest,\n[Your Name]\n[Your LinkedIn/GitHub]`
  },
  informational: {
    title: "Informational / Team Inquiry",
    subject: "Exploring {title} opportunities at {company}",
    body: `Hi there,\n\nI'm reaching out regarding the {title} position at {company}.\n\nI admire what {company} is building and would love to learn more about the team culture and priorities for this role. If you are the right person to speak with or can point me to the hiring manager for this team, I would greatly appreciate it.\n\nThanks so much!\n\nBest regards,\n[Your Name]`
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  loadStats();
  loadCompanies();
  loadJobs();
});

function initEventListeners() {
  // Single Fetch Form
  const fetchForm = document.getElementById("fetchForm");
  fetchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const urlInput = document.getElementById("companyUrlInput");
    const browserToggle = document.getElementById("browserToggle");
    const btnFetch = document.getElementById("btnFetch");
    const btnText = btnFetch.querySelector(".btn-text");
    const spinner = btnFetch.querySelector(".spinner");

    const url = urlInput.value.trim();
    if (!url) return;

    btnFetch.disabled = true;
    btnText.textContent = "Crawling...";
    spinner.style.display = "block";
    updateLiveStatus("fetching", `Crawling ${url}...`);

    try {
      const response = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_url: url,
          max_jobs: 100,
          use_browser: browserToggle.checked
        })
      });

      const result = await response.json();
      if (response.ok && result.status !== "error") {
        updateLiveStatus("success", `Fetched ${result.jobs_count} jobs from ${result.company_name}`);
        urlInput.value = "";
        await loadStats();
        await loadCompanies();
        await loadJobs();
      } else {
        updateLiveStatus("error", result.error_message || "Failed to fetch jobs.");
        alert(`Error: ${result.error_message || "Could not extract jobs from this URL."}`);
      }
    } catch (err) {
      updateLiveStatus("error", "Network error while crawling.");
      console.error(err);
    } finally {
      btnFetch.disabled = false;
      btnText.textContent = "Crawl & Fetch";
      spinner.style.display = "none";
    }
  });

  // Preset Quick Buttons
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("companyUrlInput").value = btn.dataset.url;
      document.getElementById("fetchForm").requestSubmit();
    });
  });

  // View Switcher Buttons
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentView = btn.dataset.view;
      renderActiveView();
    });
  });

  // Bookmarked Filter Pill Button
  const btnFilterBookmarked = document.getElementById("btnFilterBookmarked");
  btnFilterBookmarked.addEventListener("click", () => {
    currentFilter.onlyBookmarked = !currentFilter.onlyBookmarked;
    btnFilterBookmarked.classList.toggle("active", currentFilter.onlyBookmarked);
    renderActiveView();
  });

  // Filters
  document.getElementById("filterKeyword").addEventListener("input", (e) => {
    currentFilter.keyword = e.target.value.toLowerCase();
    renderActiveView();
  });

  document.getElementById("filterCompany").addEventListener("change", (e) => {
    currentFilter.company = e.target.value;
    renderActiveView();
  });

  document.getElementById("filterLocation").addEventListener("input", (e) => {
    currentFilter.location = e.target.value.toLowerCase();
    renderActiveView();
  });

  document.getElementById("filterHasEmail").addEventListener("change", (e) => {
    currentFilter.hasEmail = e.target.checked;
    renderActiveView();
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    currentFilter.sortBy = e.target.value;
    renderActiveView();
  });

  // Workplace Pills
  document.querySelectorAll("#filterWorkplace .pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#filterWorkplace .pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter.workplace = btn.dataset.val;
      renderActiveView();
    });
  });

  // Reset Filters
  document.getElementById("btnResetFilters").addEventListener("click", () => {
    document.getElementById("filterKeyword").value = "";
    document.getElementById("filterCompany").value = "";
    document.getElementById("filterLocation").value = "";
    document.getElementById("filterHasEmail").checked = false;
    document.getElementById("btnFilterBookmarked").classList.remove("active");
    document.querySelectorAll("#filterWorkplace .pill-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('#filterWorkplace .pill-btn[data-val=""]').classList.add("active");

    currentFilter = {
      keyword: "",
      company: "",
      workplace: "",
      location: "",
      hasEmail: false,
      onlyBookmarked: false,
      sortBy: "newest"
    };
    renderActiveView();
  });

  // Batch Modal
  document.getElementById("btnOpenBatch").addEventListener("click", openBatchModal);
  document.getElementById("btnCloseBatch").addEventListener("click", closeBatchModal);
  document.getElementById("btnStartBatch").addEventListener("click", handleBatchCrawl);

  // Detail Modal Close
  document.getElementById("btnCloseDetail").addEventListener("click", closeDetailModal);
  document.getElementById("jobDetailModal").addEventListener("click", (e) => {
    if (e.target.id === "jobDetailModal") closeDetailModal();
  });
}

async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();
    document.getElementById("metricTotalJobs").textContent = data.total_jobs || 0;
    document.getElementById("metricTotalCompanies").textContent = data.total_companies || 0;
    document.getElementById("metricTotalEmails").textContent = data.total_with_emails || 0;
    document.getElementById("metricRemoteCount").textContent = data.workplace_breakdown?.Remote || 0;
    document.getElementById("bookmarkCount").textContent = data.bookmarked_count || 0;
  } catch (e) {
    console.error("Failed to load stats:", e);
  }
}

async function loadCompanies() {
  try {
    const res = await fetch("/api/companies");
    const companies = await res.json();
    const select = document.getElementById("filterCompany");
    select.innerHTML = '<option value="">All Companies</option>';
    companies.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.company;
      opt.textContent = `${c.company} (${c.job_count})`;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("Failed to load companies:", e);
  }
}

async function loadJobs() {
  try {
    const res = await fetch("/api/jobs?limit=500");
    allJobs = await res.json();
    renderActiveView();
  } catch (e) {
    console.error("Failed to load jobs:", e);
  }
}

function getFilteredAndSortedJobs() {
  let filtered = allJobs.filter(job => {
    const matchKeyword = !currentFilter.keyword || 
      job.title.toLowerCase().includes(currentFilter.keyword) ||
      (job.description && job.description.toLowerCase().includes(currentFilter.keyword)) ||
      (job.department && job.department.toLowerCase().includes(currentFilter.keyword)) ||
      (job.contact_email && job.contact_email.toLowerCase().includes(currentFilter.keyword));

    const matchCompany = !currentFilter.company || job.company === currentFilter.company;
    const matchLocation = !currentFilter.location || job.location.toLowerCase().includes(currentFilter.location);
    const matchWorkplace = !currentFilter.workplace || job.workplace_type === currentFilter.workplace;
    const matchEmail = !currentFilter.hasEmail || (job.contact_email && job.contact_email.length > 0);
    const matchBookmark = !currentFilter.onlyBookmarked || job.is_bookmarked;

    return matchKeyword && matchCompany && matchLocation && matchWorkplace && matchEmail && matchBookmark;
  });

  // Sorting
  if (currentFilter.sortBy === "company") {
    filtered.sort((a, b) => a.company.localeCompare(b.company));
  } else if (currentFilter.sortBy === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Newest
    filtered.sort((a, b) => new Date(b.discovered_at) - new Date(a.discovered_at));
  }

  return filtered;
}

function renderActiveView() {
  const filtered = getFilteredAndSortedJobs();
  document.getElementById("resultsCount").textContent = filtered.length;

  document.getElementById("viewGrid").style.display = currentView === "grid" ? "block" : "none";
  document.getElementById("viewTable").style.display = currentView === "table" ? "block" : "none";
  document.getElementById("viewKanban").style.display = currentView === "kanban" ? "block" : "none";

  if (currentView === "grid") {
    renderGridView(filtered);
  } else if (currentView === "table") {
    renderTableView(filtered);
  } else if (currentView === "kanban") {
    renderKanbanView(filtered);
  }
}

function renderGridView(jobs) {
  const container = document.getElementById("jobsGrid");
  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No Matching Positions Found</h3>
        <p>Try adjusting your search criteria or crawl a new company career portal above.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = jobs.map(job => `
    <div class="job-card" onclick="openJobDetail('${job.id}')">
      <div>
        <div class="job-card-top">
          <span class="job-company-pill">${escapeHtml(job.company)}</span>
          <div class="job-badge-group">
            <span class="${job.workplace_type.toLowerCase() === 'remote' ? 'badge-remote' : 'badge-generic'}">
              ${escapeHtml(job.workplace_type)}
            </span>
            <button class="star-btn ${job.is_bookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark(event, '${job.id}')" title="Bookmark role">
              ${job.is_bookmarked ? '⭐' : '☆'}
            </button>
          </div>
        </div>

        <h3 class="card-title">${escapeHtml(job.title)}</h3>

        <div class="card-meta">
          <span>📍 ${escapeHtml(job.location)}</span>
          <span>📁 ${escapeHtml(job.department || 'General')}</span>
        </div>

        ${job.contact_email ? `
          <div class="email-chip" title="Direct recruiter/follow-up email">
            <span>✉️</span>
            <span>${escapeHtml(job.contact_email)}</span>
          </div>
        ` : ''}
      </div>

      <div class="card-footer">
        <span class="card-salary">${job.salary_range ? escapeHtml(job.salary_range) : 'Salary not disclosed'}</span>
        <div style="display: flex; gap: 8px; align-items: center;">
          ${job.contact_email ? `
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="openOutreachStudio(event, '${job.id}')">
              ✉️ Follow-Up
            </button>
          ` : ''}
          <a href="${escapeHtml(job.job_url)}" target="_blank" class="btn-link" onclick="event.stopPropagation()">View &rarr;</a>
        </div>
      </div>
    </div>
  `).join("");
}

function renderTableView(jobs) {
  const tbody = document.getElementById("jobsTableBody");
  if (jobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px;">No matching jobs found.</td></tr>`;
    return;
  }

  tbody.innerHTML = jobs.map(job => `
    <tr onclick="openJobDetail('${job.id}')" style="cursor: pointer;">
      <td onclick="toggleBookmark(event, '${job.id}')" style="text-align: center;">
        ${job.is_bookmarked ? '⭐' : '☆'}
      </td>
      <td style="font-weight: 700; color: #fff;">${escapeHtml(job.title)}</td>
      <td style="color: var(--accent-cyan); font-weight: 600;">${escapeHtml(job.company)}</td>
      <td>${escapeHtml(job.department || 'General')}</td>
      <td>${escapeHtml(job.location)}</td>
      <td>
        <span class="${job.workplace_type.toLowerCase() === 'remote' ? 'badge-remote' : 'badge-generic'}">
          ${escapeHtml(job.workplace_type)}
        </span>
      </td>
      <td style="color: #38bdf8; font-size: 0.82rem;">
        ${job.contact_email ? escapeHtml(job.contact_email) : '<span style="color: #64748b;">N/A</span>'}
      </td>
      <td>
        <select class="status-select" onclick="event.stopPropagation()" onchange="changeJobStatus('${job.id}', this.value)" style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); color: #fff; border-radius: 4px; padding: 4px 8px; font-size: 0.78rem;">
          <option value="Discovered" ${job.app_status === 'Discovered' ? 'selected' : ''}>Discovered</option>
          <option value="Saved" ${job.app_status === 'Saved' ? 'selected' : ''}>Saved</option>
          <option value="Applied" ${job.app_status === 'Applied' ? 'selected' : ''}>Applied</option>
          <option value="Interviewing" ${job.app_status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
          <option value="Offered" ${job.app_status === 'Offered' ? 'selected' : ''}>Offered</option>
        </select>
      </td>
      <td>
        <a href="${escapeHtml(job.apply_url || job.job_url)}" target="_blank" class="btn-link" onclick="event.stopPropagation()">Apply &rarr;</a>
      </td>
    </tr>
  `).join("");
}

function renderKanbanView(jobs) {
  const columns = {
    Discovered: document.getElementById("colDiscovered"),
    Saved: document.getElementById("colSaved"),
    Applied: document.getElementById("colApplied"),
    Interviewing: document.getElementById("colInterviewing"),
    Offered: document.getElementById("colOffered")
  };

  const counts = { Discovered: 0, Saved: 0, Applied: 0, Interviewing: 0, Offered: 0 };
  Object.values(columns).forEach(col => col.innerHTML = "");

  jobs.forEach(job => {
    const status = job.app_status || "Discovered";
    if (columns[status]) {
      counts[status]++;
      columns[status].innerHTML += `
        <div class="kanban-card" onclick="openJobDetail('${job.id}')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan);">${escapeHtml(job.company)}</span>
            <button class="star-btn ${job.is_bookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark(event, '${job.id}')">
              ${job.is_bookmarked ? '⭐' : '☆'}
            </button>
          </div>
          <div style="font-size: 0.95rem; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 8px;">
            ${escapeHtml(job.title)}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">
            📍 ${escapeHtml(job.location)}
          </div>
          ${job.contact_email ? `
            <div style="font-size: 0.75rem; color: #38bdf8; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ✉️ ${escapeHtml(job.contact_email)}
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
            <select onclick="event.stopPropagation()" onchange="changeJobStatus('${job.id}', this.value)" style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); color: #fff; border-radius: 4px; padding: 2px 6px; font-size: 0.72rem;">
              <option value="Discovered" ${status === 'Discovered' ? 'selected' : ''}>Discovered</option>
              <option value="Saved" ${status === 'Saved' ? 'selected' : ''}>Saved</option>
              <option value="Applied" ${status === 'Applied' ? 'selected' : ''}>Applied</option>
              <option value="Interviewing" ${status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
              <option value="Offered" ${status === 'Offered' ? 'selected' : ''}>Offered</option>
            </select>
            <a href="${escapeHtml(job.job_url)}" target="_blank" class="btn-link" style="font-size: 0.75rem;" onclick="event.stopPropagation()">Link &rarr;</a>
          </div>
        </div>
      `;
    }
  });

  document.getElementById("countDiscovered").textContent = counts.Discovered;
  document.getElementById("countSaved").textContent = counts.Saved;
  document.getElementById("countApplied").textContent = counts.Applied;
  document.getElementById("countInterviewing").textContent = counts.Interviewing;
  document.getElementById("countOffered").textContent = counts.Offered;
}

async function toggleBookmark(e, jobId) {
  e.stopPropagation();
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  job.is_bookmarked = !job.is_bookmarked;
  renderActiveView();

  try {
    await fetch(`/api/jobs/${jobId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_bookmarked: job.is_bookmarked })
    });
    loadStats();
  } catch (err) {
    console.error("Failed to update bookmark:", err);
  }
}

async function changeJobStatus(jobId, newStatus) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  job.app_status = newStatus;
  renderActiveView();

  try {
    await fetch(`/api/jobs/${jobId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (err) {
    console.error("Failed to update status:", err);
  }
}

function openJobDetail(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  const container = document.getElementById("jobDetailContainer");
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 18px;">
      <div>
        <span style="font-size: 0.9rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(job.company)}</span>
        <h2 style="font-size: 1.7rem; font-weight: 800; color: #fff; margin: 4px 0 10px;">${escapeHtml(job.title)}</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 14px; font-size: 0.85rem; color: var(--text-muted);">
          <span>📍 <strong>Location:</strong> ${escapeHtml(job.location)}</span>
          <span>🏢 <strong>Department:</strong> ${escapeHtml(job.department || 'General')}</span>
          <span>💼 <strong>Workplace:</strong> ${escapeHtml(job.workplace_type)} (${escapeHtml(job.employment_type)})</span>
        </div>
      </div>
      <div style="text-align: right;">
        <span class="${job.workplace_type.toLowerCase() === 'remote' ? 'badge-remote' : 'badge-generic'}" style="font-size: 0.8rem; padding: 4px 12px;">
          ${escapeHtml(job.workplace_type)}
        </span>
      </div>
    </div>

    ${job.salary_range ? `
      <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; color: #fbbf24; font-weight: 700; font-size: 0.95rem;">
        💰 Compensation: ${escapeHtml(job.salary_range)}
      </div>
    ` : ''}

    <!-- Follow-up Recruiter Studio Box -->
    ${job.contact_email ? `
      <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #38bdf8; letter-spacing: 0.05em;">Verified Follow-Up & Recruiter Email</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-top: 2px;">${escapeHtml(job.contact_email)}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="navigator.clipboard.writeText('${escapeHtml(job.contact_email)}'); this.textContent = 'Copied!';">
              📋 Copy Email
            </button>
          </div>
        </div>

        <div style="border-top: 1px solid rgba(56, 189, 248, 0.15); padding-top: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Select Outreach Template:</span>
            <div class="template-pills" style="display: flex; gap: 6px;">
              <button class="preset-btn" onclick="updateTemplatePreview('${job.id}', 'followup')">Follow-Up</button>
              <button class="preset-btn" onclick="updateTemplatePreview('${job.id}', 'pitch')">Direct Pitch</button>
              <button class="preset-btn" onclick="updateTemplatePreview('${job.id}', 'informational')">Informational</button>
            </div>
          </div>
          <div id="emailDraftPreview" style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; font-size: 0.85rem; color: #e2e8f0; white-space: pre-line; max-height: 140px; overflow-y: auto;">
            ${escapeHtml(EMAIL_TEMPLATES.followup.body.replace(/{title}/g, job.title).replace(/{company}/g, job.company).replace(/{job_url}/g, job.job_url))}
          </div>
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <a id="btnSendOutreach" href="mailto:${escapeHtml(job.contact_email)}?subject=${encodeURIComponent(EMAIL_TEMPLATES.followup.subject.replace(/{title}/g, job.title).replace(/{company}/g, job.company))}&body=${encodeURIComponent(EMAIL_TEMPLATES.followup.body.replace(/{title}/g, job.title).replace(/{company}/g, job.company).replace(/{job_url}/g, job.job_url))}" class="btn btn-primary" style="flex: 1; text-decoration: none; padding: 8px;">
              ✉️ Open in Mail Client
            </a>
          </div>
        </div>
      </div>
    ` : ''}

    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px;">Official Career Source</h4>
      <a href="${escapeHtml(job.career_page_url)}" target="_blank" style="color: var(--accent-cyan); word-break: break-all; font-size: 0.9rem;">${escapeHtml(job.career_page_url)}</a>
    </div>

    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--text-dim); margin-bottom: 10px;">Job Description & Details</h4>
      <div style="color: #cbd5e1; line-height: 1.7; font-size: 0.92rem; white-space: pre-line; max-height: 220px; overflow-y: auto; background: rgba(0,0,0,0.25); padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        ${escapeHtml(job.description || 'No direct description excerpt available from the career overview.')}
      </div>
    </div>

    <!-- Application Status & Notes Tracker -->
    <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 16px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-dim);">Application Stage:</label>
        <select onchange="changeJobStatus('${job.id}', this.value)" style="background: #1e293b; border: 1px solid var(--border-subtle); color: #fff; border-radius: 6px; padding: 6px 12px; font-size: 0.85rem;">
          <option value="Discovered" ${job.app_status === 'Discovered' ? 'selected' : ''}>Discovered</option>
          <option value="Saved" ${job.app_status === 'Saved' ? 'selected' : ''}>Saved & Researching</option>
          <option value="Applied" ${job.app_status === 'Applied' ? 'selected' : ''}>Applied</option>
          <option value="Interviewing" ${job.app_status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
          <option value="Offered" ${job.app_status === 'Offered' ? 'selected' : ''}>Offered 🎉</option>
        </select>
      </div>
      <div>
        <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-dim); display: block; margin-bottom: 6px;">Personal Notes:</label>
        <textarea id="jobNotesInput" rows="2" placeholder="Add interview dates, recruiter notes, or application checklist..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 8px; color: #fff; font-family: var(--font-main); font-size: 0.85rem;" onblur="saveJobNotes('${job.id}', this.value)">${escapeHtml(job.notes || '')}</textarea>
      </div>
    </div>

    <div style="display: flex; gap: 12px;">
      <a href="${escapeHtml(job.apply_url || job.job_url)}" target="_blank" class="btn btn-primary" style="flex: 2; text-decoration: none; padding: 12px; font-size: 0.95rem;">
        Apply Directly on Company Site &rarr;
      </a>
      <button class="btn btn-secondary" onclick="closeDetailModal()" style="flex: 1;">Close</button>
    </div>
  `;

  document.getElementById("jobDetailModal").style.display = "flex";
}

function updateTemplatePreview(jobId, templateKey) {
  const job = allJobs.find(j => j.id === jobId);
  const tpl = EMAIL_TEMPLATES[templateKey];
  if (!job || !tpl) return;

  const subject = tpl.subject.replace(/{title}/g, job.title).replace(/{company}/g, job.company);
  const body = tpl.body.replace(/{title}/g, job.title).replace(/{company}/g, job.company).replace(/{job_url}/g, job.job_url);

  document.getElementById("emailDraftPreview").textContent = body;
  document.getElementById("btnSendOutreach").href = `mailto:${job.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function saveJobNotes(jobId, notes) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;
  job.notes = notes;
  try {
    await fetch(`/api/jobs/${jobId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    });
  } catch (err) {
    console.error("Failed to save notes:", err);
  }
}

function closeDetailModal() {
  document.getElementById("jobDetailModal").style.display = "none";
}

function openOutreachStudio(e, jobId) {
  e.stopPropagation();
  openJobDetail(jobId);
}

// Batch Crawling
function openBatchModal() {
  document.getElementById("batchModal").style.display = "flex";
}
function closeBatchModal() {
  document.getElementById("batchModal").style.display = "none";
}

async function handleBatchCrawl() {
  const input = document.getElementById("batchUrlsInput");
  const rawUrls = input.value.split("\n").map(u => u.trim()).filter(u => u.length > 0);

  if (rawUrls.length === 0) {
    alert("Please enter at least one company career page URL.");
    return;
  }

  const btnStart = document.getElementById("btnStartBatch");
  const progressBox = document.getElementById("batchProgressBox");
  const progressLabel = document.getElementById("batchProgressLabel");

  btnStart.disabled = true;
  progressBox.style.display = "block";
  progressLabel.textContent = `Batch crawling ${rawUrls.length} company career portals...`;

  try {
    const res = await fetch("/api/batch-fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: rawUrls, max_jobs: 50 })
    });

    const data = await res.json();
    if (res.ok && data.status === "success") {
      closeBatchModal();
      await loadStats();
      await loadCompanies();
      await loadJobs();
      alert(`Batch Crawl Finished! Processed ${rawUrls.length} company portals.`);
    } else {
      alert("Error during batch crawl: " + (data.error_message || "Unknown error"));
    }
  } catch (err) {
    console.error(err);
    alert("Network error during batch crawl.");
  } finally {
    btnStart.disabled = false;
    progressBox.style.display = "none";
  }
}

function updateLiveStatus(state, msg) {
  const statusText = document.getElementById("statusText");
  const dot = document.querySelector(".pulse-dot");
  statusText.textContent = msg;

  if (state === "fetching") {
    dot.style.background = "#f59e0b";
    dot.style.boxShadow = "0 0 10px #f59e0b";
  } else if (state === "error") {
    dot.style.background = "#ef4444";
    dot.style.boxShadow = "0 0 10px #ef4444";
  } else {
    dot.style.background = "#10b981";
    dot.style.boxShadow = "0 0 10px #10b981";
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
