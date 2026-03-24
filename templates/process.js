// Template: Animated Process / Cycle (science, geography processes)
module.exports = function processPrompt(filename, sourceText) {
  return `Create a single-file interactive animated process diagram (HTML + CSS + vanilla JS only — NO Three.js needed).

SOURCE MATERIAL (from "${filename}"):
---
${sourceText.slice(0, 35000)}
---

RULES:
- Source ALL content exclusively from the above material. Do not invent facts.
- Extract the key process, cycle, or sequence of steps from the source.

CONCEPT:
An animated diagram showing a process or cycle (e.g. water cycle, photosynthesis, rock cycle, digestion). Steps are arranged in a circle or linear flow. Animated arrows and particles show direction of flow. Clicking a step reveals a detail panel. Clean, bright, engaging style for Year 7–9 students.

TECHNICAL REQUIREMENTS:
- Pure HTML + CSS + vanilla JavaScript only (no external libraries except Google Fonts)
- Steps arranged in a CIRCLE using absolute positioning — place each step card using: left = 50% + R*cos(angle), top = 50% + R*sin(angle) where R = 38vmin and angle = (i / total) * 2 * Math.PI - Math.PI/2. Transform: translate(-50%, -50%).
- Draw SVG arrows between consecutive steps as curved paths
- Each step: rounded card (min 120px wide) with icon (unicode emoji), label, click to expand detail
- Cards must NOT overlap — the circular layout guarantees this if you follow the formula above
- Smooth CSS transitions for all interactions
- Colour scheme: bright, clean, accessible — avoid dark backgrounds for science content
- Works at any iframe size (use vw/vh units, flexbox/grid)

CONTENT — extract from source only:
- 4–7 STEPS or STAGES: { id, icon (unicode emoji), title, shortLabel, description (2–3 sentences), keyTerms[2] }
- 1 KEY FACTS sidebar: 4–6 bullet facts from the source
- Vocabulary: 3–4 terms with definitions

UI:
- Intro screen: large unicode icon for the topic, title, subtitle, "Start" button
- Main view: the animated diagram fills most of the screen
- Clicking a step: slides open a right panel with full description + key terms
- Bottom bar: step number buttons (1, 2, 3...) for direct navigation
- Left sidebar toggle: key facts list
- Google Fonts: Outfit (sans-serif) — inline @import
- iframe-safe: no frame-busting, fully responsive
- Bright colour palette — use a 5-colour accent system, one per step

OUTPUT: Return a complete single HTML file starting with <!DOCTYPE html>. No truncation. No markdown fences.`;
};
