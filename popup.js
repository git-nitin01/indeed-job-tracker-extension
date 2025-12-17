// popup.js

let allJobs = [];

const els = {
  status: document.getElementById("status"),
  counts: document.getElementById("counts"),
  rows: document.getElementById("rows"),
  q: document.getElementById("q"),
  fromDate: document.getElementById("fromDate"),
  toDate: document.getElementById("toDate"),
  refreshBtn: document.getElementById("refreshBtn"),
  resetBtn: document.getElementById("rf")
};

init();

async function init() {
  els.refreshBtn.addEventListener("click", refresh);
  els.q.addEventListener("input", render);
  els.fromDate.addEventListener("change", render);
  els.toDate.addEventListener("change", render);
  els.resetBtn.addEventListener("click", reset);

  // Load cache first
  const cached = await sendMsg({ type: "GET_CACHED_JOBS" });
  if (cached?.ok && cached.data) {
    allJobs = normalizeIndeedPayload(cached.data.raw);
    els.status.textContent = `Cached: ${fmtDT(cached.data.fetchedAt)}`;
    render();
  } else {
    els.status.textContent = "No cache yet. Click Refresh.";
  }
}

async function refresh() {
  els.status.textContent = "Refreshing…";
  const resp = await sendMsg({ type: "REFRESH_JOBS" });
  if (!resp.ok) {
    els.status.textContent = `Refresh failed: ${resp.error}`;
    return;
  }
  allJobs = normalizeIndeedPayload(resp.data.raw);
  els.status.textContent = `Fetched: ${fmtDT(resp.data.fetchedAt)}`;
  render();
}

function render() {
  const q = (els.q.value || "").toLowerCase().trim();
  const from = els.fromDate.value ? new Date(els.fromDate.value) : null;
  const to = els.toDate.value ? new Date(els.toDate.value) : null;

  const filtered = allJobs.filter((j) => {
    const text = `${j.company} ${j.role}`.toLowerCase();
    if (q && !text.includes(q)) return false

    const d = j.dateEpoch ? new Date(j.dateEpoch) : null;
    
    if(from && to && d) {
      const start = new Date(from)
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() + 1)
      const end = new Date(to)
      end.setHours(23, 59, 59, 999)
      end.setDate(end.getDate() + 1)
      console.log({d, start, end})
      if(d >= start && d <= end) return true
      else return false
    }
    return true
  });

  els.counts.textContent = `Showing ${filtered.length} / ${allJobs.length}`;

  els.rows.innerHTML = filtered
    .sort((a, b) => b.dateEpoch - a.dateEpoch)
    .map(rowHtml)
    .join("");
}

function rowHtml(j) {
  const manage = j.manageUrl
    ? `<a href="${j.manageUrl}" target="_blank" rel="noreferrer">Open</a>`
    : "-";

  return `
    <tr>
      <td>${j.applyDay}</td>
      <td>${j.applyTime}</td>
      <td>${escapeHtml(j.company || "-")}</td>
      <td>${escapeHtml(j.role || "-")}</td>
      <td>${manage}</td>
    </tr>
  `;
}

function reset() {
  els.q.value = null
  els.fromDate.value = null
  els.toDate.value = null
  render()
}

function normalizeIndeedPayload(raw) {
  const items = raw?.body?.appStatusJobs || []

  const getApplyDate = (applyEpoch) => {
    let applyDate = new Date(applyEpoch)
    return {
      day: applyDate.toDateString(),
      time: applyDate.toLocaleTimeString()
    }
  }

  return items.map((it) => {
    let applyInfo = getApplyDate(it?.applyTime)
    return {
      company: it?.company?.name || "",
      role: it?.jobTitle || "",
      applyDay: applyInfo.day,
      applyTime: applyInfo.time,
      dateEpoch: it?.applyTime,
      manageUrl: `https://myjobs.indeed.com/application-details?applyId=${it?.encryptedIaAppId}`,
    };
  });
}

function toISO(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function fmtDT(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function sendMsg(message) {
  return new Promise((resolve) => chrome.runtime.sendMessage(message, resolve));
}
