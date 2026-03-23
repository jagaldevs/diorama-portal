const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const officeParser = require('officeparser');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');
const os = require('os');

const scenePrompt = require('./templates/scene');
const timelinePrompt = require('./templates/timeline');
const processPrompt = require('./templates/process');

const app = express();
const PORT = 3000;

// ---- Config ----
const ADMIN_KEY = process.env.ADMIN_KEY || 'changeme123';  // set ADMIN_KEY env var in production
const DEFAULT_DAILY_LIMIT = 1;
const USAGE_FILE = path.join(__dirname, 'usage.json');

// ---- Usage tracking (stored in usage.json) ----
function loadUsage() {
  try {
    if (fs.existsSync(USAGE_FILE)) return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
  } catch (e) {}
  return { users: {} };
}

function saveUsage(data) {
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
}

function getToday() {
  return new Date().toISOString().slice(0, 10); // "2026-03-23"
}

function checkAndConsume(ip) {
  const data = loadUsage();
  const today = getToday();
  const user = data.users[ip] || { count: 0, date: today, bonus: 0 };

  // Reset count if it's a new day
  if (user.date !== today) {
    user.count = 0;
    user.date = today;
    user.bonus = user.bonus || 0;
  }

  const limit = DEFAULT_DAILY_LIMIT + (user.bonus || 0);

  if (user.count >= limit) {
    return { allowed: false, used: user.count, limit };
  }

  user.count += 1;
  data.users[ip] = user;
  saveUsage(data);
  return { allowed: true, used: user.count, limit };
}

function getIP(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}

// ---- Supported file types ----
const ACCEPTED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/msword': 'doc',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.ms-excel': 'xls',
};

const EXT_MAP = { 'pdf':'pdf', 'doc':'doc', 'docx':'docx', 'ppt':'ppt', 'pptx':'pptx', 'xls':'xls', 'xlsx':'xlsx' };

function getFileType(mimetype, originalname) {
  if (ACCEPTED_TYPES[mimetype]) return ACCEPTED_TYPES[mimetype];
  const ext = originalname.split('.').pop().toLowerCase();
  return EXT_MAP[ext] || null;
}

// ---- Text extraction ----
async function extractText(buffer, fileType) {
  if (fileType === 'pdf') {
    const data = await pdfParse(buffer);
    return data.text.trim();
  }
  // For office formats, officeparser needs a file path
  const tmpPath = path.join(os.tmpdir(), `upload_${Date.now()}.${fileType}`);
  fs.writeFileSync(tmpPath, buffer);
  try {
    const text = await officeParser.parseOffice(tmpPath);
    if (!text || text.trim().length < 10) {
      throw new Error('Could not extract text. If this is an older .ppt or .xls file, try saving it as .pptx or .xlsx first.');
    }
    return text.trim();
  } finally {
    fs.unlink(tmpPath, () => {});
  }
}

// ---- Multer ----
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (getFileType(file.mimetype, file.originalname)) cb(null, true);
    else cb(new Error('Unsupported file type. Please upload a PDF, Word, PowerPoint, or Excel file.'));
  }
});

const client = new Anthropic();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ---- Admin routes ----

// View all usage: GET /admin/usage?key=yourpassword
app.get('/admin/usage', (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  const data = loadUsage();
  const today = getToday();
  const summary = Object.entries(data.users).map(([ip, u]) => ({
    ip,
    today: u.date === today ? u.count : 0,
    bonus: u.bonus || 0,
    limit: DEFAULT_DAILY_LIMIT + (u.bonus || 0),
    lastSeen: u.date
  }));
  res.json({ today, defaultLimit: DEFAULT_DAILY_LIMIT, users: summary });
});

// Grant bonus credits: POST /admin/grant?key=yourpassword  body: { ip, bonus }
app.post('/admin/grant', (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  const { ip, bonus } = req.body;
  if (!ip || bonus === undefined) return res.status(400).json({ error: 'ip and bonus required' });
  const data = loadUsage();
  if (!data.users[ip]) data.users[ip] = { count: 0, date: getToday(), bonus: 0 };
  data.users[ip].bonus = parseInt(bonus, 10);
  saveUsage(data);
  res.json({ ok: true, ip, bonus: data.users[ip].bonus });
});

// Reset a user's count: POST /admin/reset?key=yourpassword  body: { ip }
app.post('/admin/reset', (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'ip required' });
  const data = loadUsage();
  if (data.users[ip]) { data.users[ip].count = 0; data.users[ip].date = getToday(); }
  saveUsage(data);
  res.json({ ok: true, ip });
});

// Simple admin UI: GET /admin?key=yourpassword
app.get('/admin', (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).send('Unauthorized');
  const data = loadUsage();
  const today = getToday();
  const rows = Object.entries(data.users).map(([ip, u]) => {
    const used = u.date === today ? u.count : 0;
    const limit = DEFAULT_DAILY_LIMIT + (u.bonus || 0);
    return `<tr>
      <td>${ip}</td>
      <td>${used} / ${limit}</td>
      <td>${u.bonus || 0}</td>
      <td>${u.date}</td>
      <td>
        <button onclick="grant('${ip}')">Add credits</button>
        <button onclick="reset('${ip}')">Reset today</button>
      </td>
    </tr>`;
  }).join('');

  res.send(`<!DOCTYPE html><html><head><title>Diorama Admin</title>
  <style>
    body{font-family:sans-serif;padding:32px;background:#0d1117;color:#e6edf3;}
    h1{margin-bottom:24px;} table{border-collapse:collapse;width:100%;}
    th,td{padding:10px 14px;border:1px solid #30363d;text-align:left;}
    th{background:#161b22;} button{margin-right:6px;padding:4px 10px;cursor:pointer;
    background:#21262d;color:#58a6ff;border:1px solid #30363d;border-radius:4px;}
    .info{color:#8b949e;font-size:13px;margin-bottom:20px;}
  </style></head><body>
  <h1>&#127757; Diorama Portal — Admin</h1>
  <div class="info">Today: ${today} &nbsp;|&nbsp; Default daily limit: ${DEFAULT_DAILY_LIMIT}</div>
  <table>
    <tr><th>IP</th><th>Used today</th><th>Bonus credits</th><th>Last seen</th><th>Actions</th></tr>
    ${rows || '<tr><td colspan="5" style="color:#8b949e">No users yet</td></tr>'}
  </table>
  <script>
    const KEY = new URLSearchParams(location.search).get('key');
    async function grant(ip) {
      const bonus = prompt('Set total bonus credits for ' + ip + ' (added on top of daily limit):');
      if (bonus === null) return;
      await fetch('/admin/grant?key=' + KEY, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ip,bonus:parseInt(bonus)})});
      location.reload();
    }
    async function reset(ip) {
      await fetch('/admin/reset?key=' + KEY, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ip})});
      location.reload();
    }
  </script>
  </body></html>`);
});

// ---- Text store (between classify and generate) ----
const textStore = {};

// ---- Classify endpoint ----
app.post('/api/classify', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' });

    // Check rate limit before even extracting
    const ip = getIP(req);
    const check = checkAndConsume(ip);
    if (!check.allowed) {
      return res.status(429).json({
        error: `You've used your ${check.limit} generation${check.limit > 1 ? 's' : ''} for today. Check back tomorrow, or contact the administrator for more credits.`
      });
    }

    const fileType = getFileType(req.file.mimetype, req.file.originalname);
    const sourceText = await extractText(req.file.buffer, fileType);

    if (!sourceText || sourceText.length < 50) {
      return res.status(400).json({ error: 'Could not extract text from this PDF. Is it a scanned image?' });
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Analyse this educational text and respond with JSON only — no explanation, no markdown.

TEXT (first 3000 chars):
${sourceText.slice(0, 3000)}

Respond with exactly this JSON structure:
{
  "format": "timeline" | "process" | "scene",
  "topic": "short topic name (max 6 words)",
  "subject": "History" | "Science" | "Geography" | "Society" | "Other",
  "reason": "one sentence explaining the format choice"
}

Rules:
- "timeline": historical events, dates, chronological sequences, dynasties, wars, periods
- "process": scientific cycles, biological processes, how something works, steps in a system
- "scene": culture, society, daily life, a specific place or civilisation, geography of a place`
      }]
    });

    const raw = response.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Classification failed' });

    const classification = JSON.parse(jsonMatch[0]);
    const textId = Date.now().toString();
    textStore[textId] = { text: sourceText, filename: req.file.originalname };

    res.json({ ...classification, textId, charCount: sourceText.length, usedToday: check.used, limit: check.limit });

  } catch (err) {
    console.error('Classify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Generate endpoint (SSE) ----
app.get('/api/generate', async (req, res) => {
  const { textId, format } = req.query;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const stored = textStore[textId];
    if (!stored) {
      send('error', { message: 'Session expired. Please upload your PDF again.' });
      return res.end();
    }

    const { text, filename } = stored;

    const templateFn = format === 'timeline' ? timelinePrompt
      : format === 'process' ? processPrompt
      : scenePrompt;

    const prompt = templateFn(filename, text);
    send('status', { message: 'Generating your interactive resource...' });

    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 64000,
      messages: [{ role: 'user', content: prompt }]
    });

    let fullOutput = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        fullOutput += chunk;
        send('chunk', { text: chunk });
      }
    }

    delete textStore[textId];
    const html = extractHTML(fullOutput);
    send('complete', { html, chars: html.length });
    res.end();

  } catch (err) {
    console.error('Generate error:', err);
    send('error', { message: err.message || 'Generation failed.' });
    res.end();
  }
});

function extractHTML(raw) {
  const fenceMatch = raw.match(/```html\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const genericFence = raw.match(/```\s*([\s\S]*?)```/);
  if (genericFence) return genericFence[1].trim();
  const trimmed = raw.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) return trimmed;
  const idx = raw.indexOf('<!DOCTYPE');
  if (idx !== -1) return raw.slice(idx).trim();
  const idx2 = raw.indexOf('<html');
  if (idx2 !== -1) return raw.slice(idx2).trim();
  return raw.trim();
}

app.listen(PORT, () => {
  console.log(`Diorama Portal → http://localhost:${PORT}`);
  console.log(`Admin panel  → http://localhost:${PORT}/admin?key=${ADMIN_KEY}`);
});
