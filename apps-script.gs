/**
 * Google Apps Script — Lead Capture Backend
 * ==========================================
 * This script receives form submissions from the demo website and
 * appends each lead as a new row in a Google Sheet.
 *
 * SETUP INSTRUCTIONS
 * ------------------
 * 1. Open Google Sheets at https://sheets.google.com and create a new sheet.
 *    Name the first four columns:  Timestamp | Email | Name | Company
 *
 * 2. In the sheet, go to  Extensions → Apps Script
 *
 * 3. Delete any existing code and paste the entire contents of this file.
 *
 * 4. Save the project (Ctrl/Cmd + S).
 *
 * 5. Click  Deploy → New Deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone   ← required so the website can POST without auth
 *    - Click Deploy and authorise the permissions.
 *
 * 6. Copy the Web App URL (looks like https://script.google.com/macros/s/AKfy.../exec)
 *
 * 7. Open the demo site, click ⚙ Configure, and paste the URL into
 *    "Google Apps Script Endpoint", then click Apply & Reload.
 *
 * IMPORTANT: Every time you edit this script you must create a NEW deployment
 * (Deploy → New Deployment) — editing an existing deployment does NOT update
 * the live URL's code.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

// If you want to hard-code the Sheet ID instead of using the container-bound
// sheet, replace SPREADSHEET_ID with your sheet's ID (the long string in the URL).
// Leave as null to use the sheet this script is bound to.
var SPREADSHEET_ID = null;

// Sheet (tab) name to write leads into. Change if your tab has a different name.
var SHEET_NAME = 'Leads';

// ── Main entry points ─────────────────────────────────────────────────────────

/**
 * Handle POST requests from the demo website.
 * The website sends JSON: { email, name, company, timestamp }
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    appendLead(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests — useful for testing the endpoint is live.
 * Visit the deployment URL in your browser; you should see {"status":"ok"}.
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Lead capture endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Append a lead row to the Google Sheet.
 * Creates the "Leads" tab (with a header row) if it does not exist yet.
 */
function appendLead(data) {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName(SHEET_NAME);

  // Auto-create the tab with headers if it is missing
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Email', 'Name', 'Company']);

    // Style the header row
    var headerRange = sheet.getRange(1, 1, 1, 4);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  // Append the lead
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.email     || '',
    data.name      || '',
    data.company   || '',
  ]);

  Logger.log('Lead appended: ' + data.email);
}

// ── Optional: email notification ─────────────────────────────────────────────
// Uncomment the block below to receive an email for every new lead.
//
// function notifyNewLead(data) {
//   var recipient = Session.getActiveUser().getEmail(); // or hard-code your address
//   var subject   = 'New Lead: ' + data.email;
//   var body      = 'Name: ' + data.name + '\n'
//                 + 'Email: ' + data.email + '\n'
//                 + 'Company: ' + data.company + '\n'
//                 + 'Time: ' + data.timestamp;
//   MailApp.sendEmail(recipient, subject, body);
// }
