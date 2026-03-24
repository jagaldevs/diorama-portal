// Template: Concept Web (themes, causes/effects, character connections, key ideas)
module.exports = function conceptWebPrompt(filename, sourceText) {
  return `Create a single-file interactive concept web (HTML + CSS + vanilla JS only — no external libraries except Google Fonts).

SOURCE MATERIAL (from "${filename}"):
---
${sourceText.slice(0, 35000)}
---

RULES:
- Source ALL content exclusively from the above material. Do not invent facts.
- Extract the central concept and surrounding ideas, themes, or connections from the source.

CONCEPT:
An interactive concept web where a central topic sits in the middle and connected ideas radiate outward. Lines connect the centre to each node. Clicking any node reveals a detail panel. Clean, bright style on a WHITE background for Year 7–9 students.

LAYOUT — follow this EXACTLY:
- The web canvas: position: relative, width: 100%, height: 100%, background: #ffffff, overflow: hidden
- Central node: position: absolute, left: 50%, top: 50%, transform: translate(-50%,-50%), z-index: 2
  Width: 160px, min-height: 80px, border-radius: 16px
- Surrounding nodes: position: absolute, width: 130px, min-height: 70px, border-radius: 14px, z-index: 2
  Place using: left = 50% + R*cos(angle)  top = 50% + R*sin(angle)
  Where R = 30vmin (NOT 36 — this keeps nodes on-screen)
  angle = (i / total) * 2 * Math.PI - Math.PI/2  (start at top, go clockwise)
  Transform: translate(-50%, -50%)
- The radius 30vmin keeps all nodes well within a typical iframe — do NOT use a larger radius
- Node text must NOT overflow: use overflow: hidden, text-overflow: ellipsis only on tagline (1 line), label wraps freely
- SVG layer: position: absolute, inset: 0, width: 100%, height: 100%, z-index: 1, pointer-events: none
  Draw one line from centre (50%, 50%) to each surrounding node's centre position
  Use stroke="#cbd5e1" stroke-width="2" (solid, not dashed) — light grey lines on white background
- Nodes are draggable: mousedown → track mousemove on window → mouseup; update left/top of node div, then redraw SVG lines
  Use getBoundingClientRect() to find line endpoints, NOT hardcoded positions

BACKGROUND AND COLOURS — CRITICAL:
- Page background: #f1f5f9 (light grey-blue)
- Canvas (web area) background: #ffffff (white)
- Top bar background: #ffffff, border-bottom: 1px solid #e2e8f0
- Detail panel background: #ffffff, border-left: 1px solid #e2e8f0
- ALL text on white/light backgrounds: use dark colours (#1e293b, #475569) — NO white text on white
- Node cards: coloured background from palette, white text ON the coloured card is fine
- NEVER use a dark page background. Background is always white or light grey.

NODE COLOURS — assign one per surrounding node (cycle if more than 6):
  #7c3aed (violet), #059669 (emerald), #ea580c (orange), #2563eb (blue), #db2777 (pink), #ca8a04 (amber)
  Central node: background #1e293b (dark slate), text #ffffff

CONTENT — extract from source only:
- 1 CENTRAL NODE: { icon (unicode emoji), title (topic name, max 4 words), subtitle (1 short sentence) }
- 5–8 SURROUNDING NODES: { id, icon (unicode emoji), label (2–4 words), tagline (max 5 words), description (3–4 sentences explaining this concept and its connections to others) }
- 1 KEY FACTS: 4–5 short bullet facts from the source

UI:
- Intro screen: white background, large unicode icon, topic title, subtitle, "Explore" button (dark bg, white text)
- Main view: top bar (topic title left, "Concept Web" pill right) + canvas fills remaining height + detail panel slides in from right
- Clicking a node: slides open a 360px right panel with: node title, full description, connections list
- Panel close button (×) top-right of panel
- Bottom-left corner: small "⋮ Facts" toggle button — clicking slides up a facts overlay (white bg, list of bullets)
- Google Fonts: Outfit — inline @import at top of <style>
- iframe-safe: no frame-busting, responsive

OUTPUT: Return a complete single HTML file starting with <!DOCTYPE html>. No truncation. No markdown fences.`;
};
