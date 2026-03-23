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
- Use ONLY MeshLambertMaterial or MeshStandardMaterial — NO custom ShaderMaterial or GLSL shaders
- Choose a colour palette of 4–6 hex colours appropriate to the topic (e.g. earthy tones for history, blues/greens for geography)
- roughBox(w,h,d,color): BoxGeometry with per-vertex random displacement (±0.08) + computeVertexNormals(), returns Mesh with MeshLambertMaterial({color})
- Renderer: antialias, PCFSoftShadowMap, sRGBEncoding
- 4 lights: AmbientLight(0xffffff,0.5), HemisphereLight(sky,ground,0.6), DirectionalLight with shadow mapSize 1024, one PointLight for atmosphere
- FogExp2 density 0.012, background colour set on renderer
- Simple flat ground plane using MeshLambertMaterial
- Camera: spherical orbit — YOU MUST IMPLEMENT THIS EXACTLY using the following code:

  let theta = 0.4, phi = 1.0, radius = 18, isDragging = false, lastX = 0, lastY = 0;
  renderer.domElement.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    theta -= (e.clientX - lastX) * 0.01;
    phi = Math.max(0.25, Math.min(Math.PI / 2.1, phi + (e.clientY - lastY) * 0.01));
    lastX = e.clientX; lastY = e.clientY;
  });
  renderer.domElement.addEventListener('wheel', e => { radius = Math.max(6, Math.min(40, radius + e.deltaY * 0.02)); });
  renderer.domElement.addEventListener('touchstart', e => { isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; });
  renderer.domElement.addEventListener('touchend', () => isDragging = false);
  renderer.domElement.addEventListener('touchmove', e => {
    if (!isDragging) return;
    theta -= (e.touches[0].clientX - lastX) * 0.01;
    phi = Math.max(0.25, Math.min(Math.PI / 2.1, phi + (e.touches[0].clientY - lastY) * 0.01));
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
  });
  // In animate loop, update camera with:
  // camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.cos(theta));
  // camera.lookAt(0, 1, 0);
- HTML marker divs repositioned every frame via Vector3.project(camera)

CRITICAL (Three.js r128):
- NEVER use ShaderMaterial, RawShaderMaterial, or any GLSL — use MeshLambertMaterial only
- NEVER Object.assign on mesh.position — always .position.set(x,y,z)
- NEVER add Math.random() to a hex colour — use palette arrays defined at the top
- NO CapsuleGeometry — use CylinderGeometry + SphereGeometry for rounded shapes
- Every mesh.position MUST be set with .set(x,y,z) after creation

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
