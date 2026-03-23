# GA4 + Google Tag Gateway Demo Site

A live demo site for showing clients the measurable difference between standard GA4 tracking and GA4 running through a Google Tag Gateway (server-side GTM). Built to be cloneable — swap in your own GA4 ID and gateway domain in under a minute.

**Live site:** [anil1589-stack.github.io/GTG-demo](https://anil1589-stack.github.io/GTG-demo)

---

## What This Is

This project is a single-page demo site that:

- Fires real GA4 events (page views, button clicks, form interactions, CTA clicks)
- Routes those hits through a **Google Tag Gateway** (server-side GTM) on a first-party domain
- Displays a live event log so you can see tags firing in real time
- Includes a **Configure panel** to swap in any GA4 Measurement ID or gateway domain without touching code

It's designed as a sales and demo tool — load it in a client meeting to show, concretely, how server-side tagging recovers data that ad blockers and private browsing modes would otherwise suppress.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Hosting | GitHub Pages |
| DNS / Edge | Cloudflare (proxying the gateway subdomain) |
| Tag script delivery | Cloudflare Workers (serves `gtag.js` from first-party domain) |
| Server-side GTM | Google Cloud Run (hosts the GTM server container) |
| Analytics | Google Analytics 4 (GA4) |
| Lead capture backend | Google Apps Script → Google Sheets |

### How the data flows

```
Browser
  └── loads gtag.js from gtm.gtg-demo.com (Cloudflare Worker)
  └── fires events → gtm.gtg-demo.com/g/collect (Cloudflare → Cloud Run)
        └── Server-side GTM container
              └── forwards to GA4
```

Traffic never touches `googletagmanager.com` directly, so it is not blocked by most ad blockers or browser privacy filters.

---

## Using the Demo Site with a Client

The most effective demo is a side-by-side comparison in a private browsing window.

### Step-by-step walkthrough

1. **Open the demo site in a normal browser tab.**
   - Watch the Live Tag Events bar — you'll see `page_view`, `cta_click`, `step_click`, and other events fire as you interact with the page.
   - Open the browser's Network tab and filter by `collect` — hits go to `gtm.gtg-demo.com`, not Google's servers.

2. **Open the same URL in a Private / Incognito window with an ad blocker enabled.**
   - Common ad blockers (uBlock Origin, Brave Shields, etc.) block requests to `www.googletagmanager.com` and `google-analytics.com` by default.
   - Because this site loads `gtag.js` from `gtm.gtg-demo.com` — a first-party domain — the script loads and events fire even with blockers active.

3. **Compare GA4 Realtime in both scenarios.**
   - Without a gateway, a blocked session produces zero data in GA4.
   - With the gateway, the session appears normally in GA4 Realtime because the hit is processed server-side.

4. **Point out the Live Tag Events panel** as a visual confirmation that the tag is running, even in private mode.

This comparison makes the value of server-side tagging immediately tangible for clients.

---

## Clone and Set Up Your Own Version

### Prerequisites

- A GA4 property with a Measurement ID (`G-XXXXXXXXXX`)
- Optionally: a Google Tag Gateway (server-side GTM container) deployed on your own domain

### 1. Fork or clone the repo

```bash
git clone https://github.com/anil1589-stack/GTG-demo.git
cd GTG-demo
```

### 2. Update the GA4 Measurement ID in `index.html`

Find and replace `G-GXPDYS22V8` with your own Measurement ID in the two places it appears in the `<head>`:

```html
<script async src="https://gtm.yourdomain.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 3. (Optional) Point to your own Google Tag Gateway

Replace `gtm.gtg-demo.com` with your gateway domain in the script `src`, and uncomment `transport_url` in the `gtag('config', ...)` call:

```html
<script async src="https://gtm.yourdomain.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  gtag('config', 'G-XXXXXXXXXX', {
    transport_url: 'https://gtm.yourdomain.com',
    first_party_collection: true
  });
</script>
```

### 4. Deploy to GitHub Pages

Push to your `main` branch and enable GitHub Pages in your repo settings:
**Settings → Pages → Source: Deploy from branch → `main` / root**

### 5. Use the Configure button (no code required)

The site includes a built-in **Configure** panel (⚙ button in the top banner). You can use this to set a custom GA4 Measurement ID, gateway domain, and Apps Script endpoint at runtime — without editing any code. Settings are stored in `localStorage` and applied on reload.

This is useful for live demos where you want to switch between configurations on the fly.

---

## GA4 Events Fired

| Event | Trigger |
|---|---|
| `page_view` | On load (automatic via `gtag('config', ...)`) |
| `select_content` | CTA button clicks |
| `tutorial_begin` | Clicking a "How it works" step |
| `select_item` | Clicking a feature card |
| `form_start` | First interaction with each form field |
| `generate_lead` | Successful form submission |

All events are visible in GA4 → DebugView (`debug_mode: true` is set in `index.html` — remove for production).

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Main demo page — GA4 tag, UI, Configure panel |
| `style.css` | Page styles |
| `app.js` | Event tracking logic, Configure panel behaviour |
| `apps-script.gs` | Google Apps Script for capturing lead form submissions to Sheets |

---

## License

MIT — free to use, fork, and adapt for your own demos or client work.
