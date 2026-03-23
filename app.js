/* ================================================================
   Demo site – GA4 + Google Tag Gateway
   All GA4 events fire via window.gtag(). In production, remove
   the debug_mode flag from index.html and the console.logs here.
================================================================ */

// ── Config (loaded from localStorage or defaults) ──────────────
const CONFIG_KEY = 'ga4demo_config';

function loadConfig() {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {}; }
  catch { return {}; }
}

function applyConfig() {
  const cfg = {
    measurementId: document.getElementById('cfg-measurement-id').value.trim(),
    gatewayUrl:    document.getElementById('cfg-gateway-url').value.trim(),
    appsScriptUrl: document.getElementById('cfg-apps-script-url').value.trim(),
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  location.reload();
}

function toggleConfig() {
  const panel = document.getElementById('config-panel');
  const cfg   = loadConfig();
  if (panel.style.display === 'none') {
    document.getElementById('cfg-measurement-id').value = cfg.measurementId || '';
    document.getElementById('cfg-gateway-url').value    = cfg.gatewayUrl    || '';
    document.getElementById('cfg-apps-script-url').value= cfg.appsScriptUrl || '';
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

// ── Initialise on load ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const cfg    = loadConfig();
  const demo   = window._ga4demo || {};

  // GA4 Measurement ID in banner
  const idEl = document.getElementById('banner-measurement-id');
  if (idEl) idEl.textContent = demo.measurementId || 'G-GXPDYS22V8';

  // gtag.js source indicator
  const tagSourceEl = document.getElementById('tag-source-status');
  if (tagSourceEl) {
    const origin = demo.scriptOrigin || 'https://www.googletagmanager.com';
    try {
      tagSourceEl.textContent = new URL(origin).hostname;
    } catch (e) {
      tagSourceEl.textContent = origin;
    }
    tagSourceEl.className = demo.gatewayUrl ? 'status-on' : 'status-off';
  }

  // Google Tag Gateway status indicator
  const statusEl = document.getElementById('gateway-status');
  if (statusEl) {
    if (cfg.gatewayUrl) {
      statusEl.textContent = cfg.gatewayUrl;
      statusEl.className   = 'status-on';
    } else {
      statusEl.textContent = 'Not configured';
      statusEl.className   = 'status-off';
    }
  }

  // Log the page_view pill (already shown statically; add a dynamic one)
  logEvent('page_view', '#3c4043', '#9aa0a6');
});

// ── GA4 event helper ────────────────────────────────────────────
function ga4Event(eventName, params = {}) {
  const cfg = loadConfig();

  // Build gtag params — if a gateway is configured, pass transport_url
  const gtagParams = { ...params };
  if (cfg.gatewayUrl) {
    gtagParams.transport_url = cfg.gatewayUrl;
  }

  if (typeof gtag === 'function') {
    gtag('event', eventName, gtagParams);
    console.log('[GA4 Event]', eventName, gtagParams);
  } else {
    console.warn('gtag not available — event not sent:', eventName, gtagParams);
  }

  logEvent(eventName, '#174ea6', '#a8c7fa');
  showToast(`GA4: ${eventName}`);
}

// ── Event log pill ──────────────────────────────────────────────
function logEvent(label, bg, color) {
  const list = document.getElementById('event-log-list');
  const pill = document.createElement('span');
  pill.className   = 'event-pill new';
  pill.textContent = label;
  pill.style.background = bg;
  pill.style.color      = color;
  list.appendChild(pill);
  list.scrollLeft = list.scrollWidth;          // auto-scroll right
}

// ── Toast notification ──────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  clearTimeout(toastTimer);

  const el = document.createElement('div');
  el.className   = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  toastTimer = setTimeout(() => el.remove(), 2500);
}

// ── CTA click tracking ──────────────────────────────────────────
function trackCta(label) {
  ga4Event('select_content', {
    content_type: 'cta_button',
    content_id:   label,
  });
}

// ── Step click tracking ─────────────────────────────────────────
function trackStep(step) {
  ga4Event('tutorial_begin', {
    step_number: step,
    step_name:   `how_it_works_step_${step}`,
  });
}

// ── Card click tracking ─────────────────────────────────────────
function trackCard(cardId) {
  ga4Event('select_item', {
    item_list_id:   'features',
    item_list_name: 'Feature Cards',
    items: [{ item_id: cardId }],
  });
}

// ── Form field engagement ───────────────────────────────────────
const _touchedFields = new Set();
function trackFormField(fieldName) {
  if (_touchedFields.has(fieldName)) return;   // fire once per field
  _touchedFields.add(fieldName);
  ga4Event('form_start', {
    form_id:    'lead_form',
    field_name: fieldName,
  });
}

// ── Lead form submission ────────────────────────────────────────
async function submitLead(event) {
  event.preventDefault();

  const email   = document.getElementById('email').value.trim();
  const name    = document.getElementById('name').value.trim();
  const company = document.getElementById('company').value.trim();
  const btn     = document.getElementById('submit-btn');
  const cfg     = loadConfig();

  // 1. Fire GA4 generate_lead event FIRST (always, even if backend fails)
  ga4Event('generate_lead', {
    form_id:      'lead_form',
    currency:     'USD',
    value:        0,
    email_domain: email.split('@')[1] || 'unknown',
  });

  // 2. Send to Google Apps Script (Google Sheets backend)
  if (!cfg.appsScriptUrl) {
    showConfigWarning();
    showSuccess();          // still demo the success state
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Submitting…';

  try {
    // Apps Script requires no-cors for cross-origin POSTs from a plain HTML page
    await fetch(cfg.appsScriptUrl, {
      method: 'POST',
      mode:   'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, company, timestamp: new Date().toISOString() }),
    });

    showSuccess();
    logEvent('generate_lead ✓', '#0d652d', '#81c995');

  } catch (err) {
    console.error('Apps Script error:', err);
    btn.disabled    = false;
    btn.textContent = 'Request Access →';
    showToast('Submission failed — check the Apps Script URL in ⚙ Configure');
  }
}

function showSuccess() {
  document.getElementById('lead-form-el').style.display = 'none';
  document.getElementById('form-success').style.display  = 'block';
}

function showConfigWarning() {
  showToast('⚠ No Apps Script URL set — open ⚙ Configure to add it. (GA4 event still fired)');
}
