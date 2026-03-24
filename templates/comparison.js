// Template: Comparison (side-by-side analysis across key categories)
module.exports = function comparisonPrompt(filename, sourceText) {
  return `Create a single-file interactive comparison resource (HTML + CSS + vanilla JS only — no external libraries except Google Fonts).

SOURCE MATERIAL (from "${filename}"):
---
${sourceText.slice(0, 35000)}
---

RULES:
- Source ALL content exclusively from the above material. Do not invent facts.
- Extract 2–4 distinct subjects and compare them across meaningful categories.

CONCEPT:
A clean, interactive comparison table/grid where 2–4 subjects are compared across 5–8 categories. Each cell can be clicked to expand full detail. A summary verdict at the bottom highlights key differences. Bright, engaging style for Year 7–9 students.

TECHNICAL REQUIREMENTS:
- Pure HTML + CSS + vanilla JavaScript only (no external libraries except Google Fonts)
- Main layout: CSS grid with subjects as columns, categories as rows
- Sticky first column (category labels) and sticky header row (subject names)
- Each comparison cell: shows a short summary (1–2 sentences) + a colour-coded rating icon (✅ strength, ⚠️ mixed, ❌ weakness, or ➖ neutral) based on context
- Clicking a cell: opens a bottom-sheet or right panel with full detail for that subject/category pair
- Subjects displayed with: icon (unicode emoji), name, brief descriptor (1 sentence)
- Categories displayed with: icon (unicode emoji), label, 1-line description of what's being compared
- Mobile-friendly: on small screens, allow horizontal scroll on the grid
- Colour scheme: bright, white/light background, each subject has its own accent colour
- Smooth CSS transitions for all interactions
- Works at any iframe size (use flexible units, no fixed pixel widths that overflow)
- Google Fonts: Outfit (sans-serif) — inline @import
- iframe-safe: no frame-busting, fully responsive

SUBJECT COLOURS — assign one colour per subject from this palette:
  #a78bfa (purple), #34d399 (green), #fb923c (orange), #60a5fa (blue)

CONTENT — extract from source only:
- 2–4 SUBJECTS: { icon (unicode emoji), name, descriptor (1 sentence), colour (from palette above) }
- 5–8 CATEGORIES: { icon (unicode emoji), label (2–4 words), description (what aspect is being compared) }
- For each SUBJECT × CATEGORY cell: { summary (1–2 sentences), rating: "strength"|"mixed"|"weakness"|"neutral", detail (3–5 sentences of full explanation) }
- 1 OVERALL VERDICT: 3–5 sentences summarising the key similarities and differences
- 1 KEY FACTS sidebar: 4–5 bullet facts from the source

UI:
- Intro screen: large unicode icon (e.g. ⚖️), title, subtitle, "Compare" button
- Main view: sticky header row with subject cards, sticky category column, comparison grid fills the rest
- Each cell: coloured border-left matching subject colour, short summary text, rating icon
- Clicking a cell: slides in a detail panel (right side, 400px) with full explanation, highlighting which subject/category
- Bottom bar: "Overall verdict" section — collapsed by default, click to expand
- Left sidebar toggle: key facts list
- Google Fonts: Outfit — inline @import
- iframe-safe: no frame-busting, responsive
- Light background (#f8f9ff or white), subject accent colours for headers and cell borders

OUTPUT: Return a complete single HTML file starting with <!DOCTYPE html>. No truncation. No markdown fences.`;
};
