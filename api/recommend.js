const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzaB4_-RyljURd0jzFyRB-XbDO397UQjyI97l62DWog22LUxNXrnnEczl0XbR66vmro/exec";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, bookTitle, author, why } = req.body;
    if (!bookTitle) return res.status(400).json({ success: false, error: "Missing bookTitle" });

    const params = new URLSearchParams({
      name:      name      || "",
      bookTitle: bookTitle || "",
      author:    author    || "",
      why:       why       || "",
    });

    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`, {
      method:   "GET",
      redirect: "follow",
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, error: text };
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
