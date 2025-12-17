# 📌 Job Tracker – Chrome Extension

A lightweight Chrome extension that helps you **track, search, and analyze your applied jobs on Indeed** — all locally, using your existing Indeed session.

Built to solve a common problem: **Indeed doesn’t provide good filtering, search, or date-based analytics for applied jobs.**

## Screenshots

![App Screenshot](https://github.com/user-attachments/assets/022456a2-545c-4fdb-953a-41d0e248b879)

---

## ✨ Features

- 🔍 Search applied jobs by **company name or role**
- 📅 Filter jobs by **date range**
- 📊 See **how many jobs you applied** between selected dates
- 🔗 Open job application pages directly using **application IDs**
- ⚡ Fast & local — uses your existing Indeed login, all data is cached, API calls only when refreshed.
- 🔐 Privacy-first — **no data leaves your browser**

---

## 🧠 How It Works

- Uses Indeed’s internal applied-jobs API from your **logged-in browser session**
- Fetches data securely using a **Chrome service worker**
- Caches results using `chrome.storage.local`
- Renders a clean, searchable UI in the extension popup

> ⚠️ This extension is intended for **personal and educational use only**.  
> It does **not** automate job applications or bypass authentication.

---

## 🛠 Tech Stack

- JavaScript (ES6+)
- Chrome Extensions API (Manifest V3)
- HTML / CSS
- Chrome Storage API

---

## 📂 Project Structure

```text
job-tracker-extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── popup.css
└── icons/
    └── 1024.png
