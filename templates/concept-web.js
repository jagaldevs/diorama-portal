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
An interactive concept web where a central topic sits in the middle and connected ideas radiate outward. Lines connect related nodes. Clicking any node reveals a detail panel with explanation. Nodes can be dragged to rearrange. Clean, bright, engaging style for Year 7–9 students.

TECHNICAL REQUIREMENTS:
- Pure HTML + CSS + vanilla JavaScript only (no external libraries except Google Fonts)
- Central node positioned at 50%/50% of the container
- Surrounding nodes positioned in a circle around the centre using:
  left = 50% + R*cos(angle), top = 50% + R*sin(angle) where R = 36vmin
  angle = (i / total) * 2 * Math.PI
  Transform: translate(-50%, -50%)
- SVG drawn BEHIND the nodes (position: absolute, inset: 0, width: 100%, height: 100%, z-index: 0)
- SVG lines connect the central node to each surrounding node — update line positions after drag
- Nodes are draggable: mousedown/mousemove/mouseup on each node div updates its left/top; after drag, redraw all SVG lines
- Each surrounding node: rounded card with icon (unicode emoji), label, short tagline
- Central node: larger card, topic title, subtitle
- Clicking any node: slides open a right panel with full description + key connections
- Smooth CSS transitions for all hover/click interactions
- Colour scheme: bright, light background (#f8f6ff or white), vibrant node colours from a 6-colour palette
- Works at any iframe size (use vw/vh units for radii, flexbox for panels)
- Google Fonts: Outfit (sans-serif) — inline @import
- iframe-safe: no frame-busting, fully responsive

NODE COLOURS — use this palette, one colour per surrounding node (cycle if more than 6):
  #a78bfa (purple), #34d399 (green), #fb923c (orange), #60a5fa (blue), #f472b6 (pink), #facc15 (yellow)

CONTENT — extract from source only:
- 1 CENTRAL NODE: { icon (unicode emoji), title (topic name), subtitle (1 sentence) }
- 5–8 SURROUNDING NODES: { id, icon (unicode emoji), label (2–4 words), tagline (short phrase), description (3–4 sentences explaining this idea and its connections), connections: [list of 1–2 other node labels it links to] }
- 1 KEY FACTS sidebar: 4–5 bullet facts from the source

UI:
- Intro screen: large unicode icon for the topic, title, subtitle, "Explore" button
- Main view: the concept web fills the screen (position: relative container, overflow: hidden)
- Central node always visible, surrounding nodes arranged in circle
- Clicking a node: slides open a 380px right panel with full description, connections list, key facts
- Top bar: topic title + "Concept Web" label
- Left sidebar toggle (collapsed by default): key facts list
- Google Fonts: Outfit — inline @import
- iframe-safe: no frame-busting, responsive
- Light colour palette — white/very light purple background, vibrant node colours

OUTPUT: Return a complete single HTML file starting with <!DOCTYPE html>. No truncation. No markdown fences.`;
};
