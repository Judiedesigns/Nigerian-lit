// Nigerian Lit Archive — Book Recommendation Handler
// Deploy this as a Google Apps Script Web App to collect recommendations.
//
// Setup:
// 1. Go to https://script.google.com and create a new project
// 2. Paste this entire file into the editor
// 3. Click Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the Web app URL
// 5. In NigerianLit.jsx, replace YOUR_SCRIPT_URL_HERE with that URL

const NOTIFY_EMAIL = "juddblck2@gmail.com";
const SHEET_NAME   = "Book Recommendations";

function getOrCreateSheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty("SPREADSHEET_ID");
  let ss;

  if (ssId) {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch (e) {
      ssId = null;
    }
  }

  if (!ssId) {
    ss = SpreadsheetApp.create("Nigerian Lit — Book Recommendations");
    props.setProperty("SPREADSHEET_ID", ss.getId());
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Type", "Name", "Book Title", "Author", "Why They Recommend It", "Source URL", "Issue"]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    sheet.appendRow([
      new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
      data.type      || "suggest",
      data.name      || "",
      data.bookTitle || "",
      data.author    || "",
      data.why       || "",
      data.sourceUrl || "",
      data.issue     || "",
    ]);

    const isReport = data.type === "report";
    MailApp.sendEmail({
      to:      NOTIFY_EMAIL,
      subject: `${isReport ? "🔗 Broken link report" : "📚 New recommendation"}: "${data.bookTitle || "unknown"}"`,
      body: [
        `${isReport ? "Someone reported a link/source issue" : "Someone recommended a book"} on the Nigerian Lit Archive!\n`,
        `Type:      ${data.type || "suggest"}`,
        `Name:      ${data.name}`,
        `Book:      ${data.bookTitle}`,
        `Author:    ${data.author}`,
        `Why:       ${data.why}`,
        `Source:    ${data.sourceUrl}`,
        `Issue:     ${data.issue}`,
        `\nTimestamp: ${new Date().toLocaleString()}`,
      ].join("\n"),
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.bookTitle) {
    try {
      const sheet = getOrCreateSheet();
      sheet.appendRow([
        new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
        e.parameter.type      || "suggest",
        e.parameter.name      || "",
        e.parameter.bookTitle || "",
        e.parameter.author    || "",
        e.parameter.why       || "",
        e.parameter.sourceUrl || "",
        e.parameter.issue     || "",
      ]);

      try {
        const isReport = e.parameter.type === "report";
        MailApp.sendEmail({
          to:      NOTIFY_EMAIL,
          subject: `${isReport ? "🔗 Broken link report" : "📚 New recommendation"}: "${e.parameter.bookTitle}"`,
          body: [
            `${isReport ? "Someone reported a link/source issue" : "Someone recommended a book"} on the Nigerian Lit Archive!\n`,
            `Type:      ${e.parameter.type || "suggest"}`,
            `Name:      ${e.parameter.name}`,
            `Book:      ${e.parameter.bookTitle}`,
            `Author:    ${e.parameter.author}`,
            `Why:       ${e.parameter.why}`,
            `Source:    ${e.parameter.sourceUrl}`,
            `Issue:     ${e.parameter.issue}`,
            `\nTimestamp: ${new Date().toLocaleString()}`,
          ].join("\n"),
        });
      } catch (_) {}

      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput("Nigerian Lit — recommendation endpoint is live.");
}
