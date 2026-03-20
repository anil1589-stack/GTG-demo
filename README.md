# GA4 + Google Tag Gateway Demo Site

A self-contained demo showing GA4 tag installation, Google Tag Gateway (server-side tagging) configuration, and a lead capture form that stores submissions in Google Sheets via Apps Script.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main page with GA4 snippet and lead form |
| `style.css` | Styles |
| `app.js` | GA4 event tracking + form submission logic |
| `apps-script.gs` | Paste into Google Apps Script to create the Sheets backend |

## Quick Start

### 1. Open the site locally

Just open `index.html` in a browser — no build step needed.

### 2. Configure via the ⚙ button

Click **⚙ Configure** in the banner and fill in:

| Field | Where to find it |
|-------|-----------------|
| GA4 Measurement ID | GA4 → Admin → Data Streams → your web stream → Measurement ID |
| Google Tag Gateway Domain | Your server-side GTM container URL (Cloud Run / App Engine) |
| Google Apps Script Endpoint | See step 3 below |

Settings persist in `localStorage` so you don't have to re-enter them on reload.

### 3. Set up the Google Sheets backend

1. Create a new Google Sheet at https://sheets.google.com.
2. Go to **Extensions → Apps Script**.
3. Paste the contents of `apps-script.gs` and save.
4. Click **Deploy → New Deployment** → Web app → Execute as *Me* → Anyone can access.
5. Copy the deployment URL and paste it into ⚙ Configure → *Google Apps Script Endpoint*.

Every form submission will append a row:

| Timestamp | Email | Name | Company |
|-----------|-------|------|---------|

### 4. Configure Google Tag Gateway (optional)

To route hits through your own first-party domain:

1. Deploy a server-side GTM container (Cloud Run template or App Engine).
2. In **⚙ Configure**, enter your gateway domain (e.g., `https://gtm.yourdomain.com`).
3. The site will automatically set `transport_url` on every `gtag('config', ...)` and `gtag('event', ...)` call.

In `index.html`, the GA4 `<script src>` can also be updated to load the gtag library from your gateway domain instead of Google's CDN.

## GA4 Events Fired

| Event | Trigger |
|-------|---------|
| `page_view` | On load (automatic via `gtag('config', ...)`) |
| `select_content` | CTA button clicks |
| `tutorial_begin` | Clicking a "How it works" step |
| `select_item` | Clicking a feature card |
| `form_start` | First interaction with each form field |
| `generate_lead` | Successful form submission |

All events are visible in GA4 → DebugView (because `debug_mode: true` is set in `index.html` — remove for production).
