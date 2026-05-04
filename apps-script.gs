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
    sheet.appendRow(["Timestamp", "Name", "Book Title", "Author", "Why They Recommend It"]);
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
      data.name      || "",
      data.bookTitle || "",
      data.author    || "",
      data.why       || "",
    ]);

    MailApp.sendEmail({
      to:      NOTIFY_EMAIL,
      subject: `📚 New recommendation: "${data.bookTitle || "unknown"}"`,
      body: [
        "Someone recommended a book on the Nigerian Lit Archive!\n",
        `Name:      ${data.name}`,
        `Book:      ${data.bookTitle}`,
        `Author:    ${data.author}`,
        `Why:       ${data.why}`,
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

function doGet() {
  return ContentService.createTextOutput("Nigerian Lit — recommendation endpoint is live.");
}
