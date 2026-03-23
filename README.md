# Diorama Portal

A teacher-facing portal that transforms PDF lesson materials into interactive 3D educational resources for embedding in Canvas LMS.

## How it works

1. Teacher uploads a PDF (textbook pages, lesson notes, handouts)
2. AI detects the content type (timeline, process, or 3D scene)
3. Teacher confirms the format and generates
4. Downloads a single HTML file ready to embed via iframe in Canvas

## Formats

- **History Timeline** — events on a 3D track, camera flies between them
- **Animated Process** — step-by-step animated diagram (water cycle, photosynthesis, etc.)
- **3D Scene** — interactive environment (culture, society, geography)

## Setup

```bash
npm install
export ANTHROPIC_API_KEY=your-key-here
export ADMIN_KEY=your-admin-password
node server.js
```

Open `http://localhost:3000`

## Admin panel

View usage and manage credits at:
```
http://localhost:3000/admin?key=your-admin-password
```

## Stack

- Node.js + Express
- Anthropic Claude API (claude-haiku-4-5)
- Three.js r128 (in generated output)
- No database — usage tracked in usage.json
