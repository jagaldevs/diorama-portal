// Template: 3D Timeline (history, sequences of events)
module.exports = function timelinePrompt(filename, sourceText) {
  return `Create a single-file interactive 3D timeline experience (HTML + Three.js r128).

SOURCE MATERIAL (from "${filename}"):
---
${sourceText.slice(0, 35000)}
---

RULES:
- Source ALL content exclusively from the above material. Do not invent facts.
- Extract all key events, dates, and people from the source.

CONCEPT:
A 3D timeline where events float in space along a glowing track. The user clicks numbered buttons to fly the camera to each event. Each event has a floating card with details. Clean, dark space-like environment with subtle particles.

TECHNICAL REQUIREMENTS:
- Three.js r128 CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- Events arranged along a curved 3D path (use CatmullRomCurve3)
- Camera animates smoothly between event positions using lerp (0.05 per frame)
- Also allow free orbit between events — YOU MUST IMPLEMENT THIS EXACTLY:

  let theta = 0.4, phi = 1.0, radius = 22, isDragging = false, lastX = 0, lastY = 0;
  renderer.domElement.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    theta -= (e.clientX - lastX) * 0.01;
    phi = Math.max(0.25, Math.min(Math.PI / 2.1, phi + (e.clientY - lastY) * 0.01));
    lastX = e.clientX; lastY = e.clientY;
  });
  renderer.domElement.addEventListener('wheel', e => { radius = Math.max(8, Math.min(50, radius + e.deltaY * 0.02)); });
  renderer.domElement.addEventListener('touchstart', e => { isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; });
  renderer.domElement.addEventListener('touchend', () => isDragging = false);
  renderer.domElement.addEventListener('touchmove', e => {
    if (!isDragging) return;
    theta -= (e.touches[0].clientX - lastX) * 0.01;
    phi = Math.max(0.25, Math.min(Math.PI / 2.1, phi + (e.touches[0].clientY - lastY) * 0.01));
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
  });
- Each event: a glowing sphere node + floating HTML label card
- Environment: dark background (#0a0a1a), subtle star particle field (2000 points), thin glowing track line
- Simple vertex + fragment shaders for the track glow and event nodes
- No complex scene geometry needed — keep it clean and minimal
- HTML event cards positioned via Vector3.project(camera) each frame
- Cards show: year/date, title, 2-sentence description, key figure if any

CRITICAL (Three.js r128):
- NEVER Object.assign on mesh.position — always .position.set(x,y,z)
- NEVER add Math.random() to a hex colour — use palette arrays
- NO CapsuleGeometry

CONTENT — extract from source only:
- 5–8 EVENTS: { id, year, title, description (2 sentences), keyFigure, significance }
- Each event positioned along the curve at even intervals
- 1 sidebar: key facts or people list from the source

UI:
- Intro screen: unicode icon (e.g. ⏳ or 📜), topic title, subtitle, "Explore Timeline" button
- HUD top: topic title + subject pills
- HUD bottom: numbered buttons — one per event — clicking flies camera to that event
- Right panel (420px slide-out): event detail — year, full description, significance, key figure
- Left sidebar (340px): key facts or people from the period
- Colour scheme: deep navy/dark background, gold/amber accents for history feel
- Google Fonts: Crimson Pro + Outfit (inline @import)
- iframe-safe: no frame-busting, responsive

OUTPUT: Return a complete single HTML file starting with <!DOCTYPE html>. No truncation. No markdown fences.`;
};
