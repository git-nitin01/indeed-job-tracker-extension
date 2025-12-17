// background.js

const CACHE_KEY = "indeed_applied_jobs_cache_v1";

const INDEED_APPLIED_JOBS_API_URL = `https://myjobs.indeed.com/api/v1/appStatusJobs?type=POST_APPLY`;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "REFRESH_JOBS") {
    refreshJobs()
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true; // keep channel open for async response
  }

  if (msg.type === "GET_CACHED_JOBS") {
    chrome.storage.local.get([CACHE_KEY], (res) => {
      sendResponse({ ok: true, data: res[CACHE_KEY] || null });
    });
    return true;
  }
});

async function refreshJobs() {
  const res = await fetch(INDEED_APPLIED_JOBS_API_URL, {
    method: "GET",
    credentials: "include",
    headers: {
      "Accept": "application/json"
    }
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  const payload = {
    fetchedAt: new Date().toISOString(),
    raw: json
  };

  await chrome.storage.local.set({ [CACHE_KEY]: payload });
  return payload;
}
