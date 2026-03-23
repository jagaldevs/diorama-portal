// Template: 3D Scene (culture, society, geography)
module.exports = function scenePrompt(filename, sourceText) {
  return `Create a single-file interactive 3D educational diorama (HTML + Three.js r128).

SOURCE MATERIAL (from "${filename}"):
---
${sourceText.slice(0, 35000)}
---

RULES:
- Source ALL content exclusively from the above material. Do not invent facts.
- Infer the topic, time period, and appropriate 3D scene from the content.

TECHNICAL REQUIREMENTS:
- Three.js r128 CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- Shared vertex shader passing: vUv, vPos, vNorm, vWorldPos, vWorldNorm
- 3 custom GLSL fragment shaders for primary surfaces (stone, wood, earth, fabric etc — choose for topic)
  - Each includes 3D hash-permutation noise + fBm (5 octaves)
  - Hardcode lightDir vec3 in each shader (ShaderMaterial does not receive scene lights)
- roughBox(w,h,d,mat): BoxGeometry with per-vertex random displacement + computeVertexNormals()
- Renderer: antialias, PCFSoftShadowMap, ACESFilmicToneMapping, exposure 1.3, sRGBEncoding
- 8 lights: ambient, hemisphere, directional key (shadow 2048), fill, overhead, 3 point lights
- FogExp2 density 0.009, sky SphereGeometry(180,64,32) BackSide vertex-coloured
- Camera: spherical orbit, phi clamped [0.25, PI/2.1], mouse + touch + scroll wheel
- 2 particle systems (~1000 total): atmospheric + ground layer
- HTML marker divs repositioned every frame via Vector3.project(camera)

CRITICAL (Three.js r128):
- NEVER Object.assign on mesh.position — always .position.set(x,y,z)
- NEVER add Math.random() to a hex colour — use palette arrays
- NO CapsuleGeometry — use cylinder + sphere caps

CONTENT — extract from source only:
- 5 INFO_POINTS: { id, title, subtitle, curriculumCode, subjects[], position{x,y,z}, paragraphs[2], thinkAbout, stats[3], vocabulary[3] }
- 1 SIDEBAR array (timeline or key facts list)

UI:
- Intro screen: unicode icon, title, subtitle, "Enter" button, staggered fade-in
- HUD top: title + subject pills + sidebar toggle
- HUD bottom: numbered tab buttons (one per INFO_POINT)
- Right panel (440px slide-out): curriculum badge, paragraphs, activity box, stats, vocabulary
- Left sidebar (360px slide-out): sidebar array
- Google Fonts: Crimson Pro + Outfit (inline @import)
- iframe-safe: no frame-busting, responsive to container size

OUTPUT: Return a complete single HTML file starting with <!DOCTYPE html>. No truncation. No markdown fences.`;
};
