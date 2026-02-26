require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_PATH = path.join(__dirname, 'data', 'tools.json');
const WISHES_PATH = path.join(__dirname, 'data', 'wishes.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function readTools() {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeTools(tools) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(tools, null, 2), 'utf8');
}

function readWishes() {
  try {
    return JSON.parse(fs.readFileSync(WISHES_PATH, 'utf8'));
  } catch (err) {
    return [];
  }
}

function writeWishes(wishes) {
  fs.mkdirSync(path.dirname(WISHES_PATH), { recursive: true });
  fs.writeFileSync(WISHES_PATH, JSON.stringify(wishes, null, 2), 'utf8');
}

app.get('/api/tools', (req, res) => {
  res.json(readTools());
});

app.post('/api/tools', (req, res) => {
  const password = req.body.password;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return res.status(500).json({ error: '伺服器未設定管理者密碼' });
  if (password !== adminPassword) return res.status(403).json({ error: '密碼錯誤' });

  if (req.body.action === 'verify') {
    return res.status(200).json({ ok: true });
  }

  if (req.body.action === 'delete') {
    const id = req.body.id;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: '請提供要刪除的工具 id' });
    const original = readTools();
    const tools = original.filter(function (t) { return t.id !== id; });
    if (tools.length === original.length) return res.status(404).json({ error: '找不到該工具' });
    writeTools(tools);
    return res.status(200).json({ ok: true });
  }

  if (req.body.action === 'update') {
    const id = req.body.id;
    const tool = req.body.tool;
    if (!id || typeof id !== 'string' || !tool || !tool.name || !tool.url) return res.status(400).json({ error: '請提供要更新的工具 id 與內容' });
    const tools = readTools();
    const idx = tools.findIndex(function (t) { return t.id === id; });
    if (idx === -1) return res.status(404).json({ error: '找不到該工具' });
    tools[idx] = {
      id: tools[idx].id,
      name: String(tool.name).trim(),
      url: String(tool.url).trim(),
      description: (tool.description && String(tool.description).trim()) || '',
      cardColor: (tool.cardColor && String(tool.cardColor).trim()) ? String(tool.cardColor).trim() : '',
      icon: (tool.icon && String(tool.icon).trim()) || '',
      type: (tool.type === 'plugin' ? 'plugin' : 'link')
    };
    writeTools(tools);
    return res.status(200).json(tools[idx]);
  }

  const tool = req.body.tool;
  if (!tool || !tool.name || !tool.url) return res.status(400).json({ error: '請提供工具名稱與網址' });
  const tools = readTools();
  const newTool = {
    id: 'tool-' + Date.now(),
    name: String(tool.name).trim(),
    url: String(tool.url).trim(),
    description: (tool.description && String(tool.description).trim()) || '',
    cardColor: (tool.cardColor && String(tool.cardColor).trim()) ? String(tool.cardColor).trim() : '',
    icon: (tool.icon && String(tool.icon).trim()) || '',
    type: (tool.type === 'plugin' ? 'plugin' : 'link')
  };
  tools.push(newTool);
  writeTools(tools);
  res.status(201).json(newTool);
});

app.get('/api/wishes', (req, res) => {
  const wishes = readWishes();
  const pendingCount = wishes.filter(function (w) { return w.status === 'pending'; }).length;
  const password = req.query.password;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (password && adminPassword && password === adminPassword) {
    return res.json({ list: wishes, pendingCount });
  }
  res.json({ pendingCount });
});

app.post('/api/wishes', (req, res) => {
  const body = req.body || {};
  if (body.action === 'list') {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || body.password !== adminPassword) return res.status(403).json({ error: '密碼錯誤' });
    const wishes = readWishes();
    const pendingCount = wishes.filter(function (w) { return w.status === 'pending'; }).length;
    return res.json({ list: wishes, pendingCount });
  }
  if (body.action === 'updateStatus') {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || body.password !== adminPassword) return res.status(403).json({ error: '密碼錯誤' });
    const id = body.id;
    const status = body.status;
    if (!id || !status) return res.status(400).json({ error: '請提供 id 與 status' });
    const allowed = ['pending', 'processing', 'done'];
    if (allowed.indexOf(status) === -1) return res.status(400).json({ error: 'status 須為 pending / processing / done' });
    const wishes = readWishes();
    const idx = wishes.findIndex(function (w) { return w.id === id; });
    if (idx === -1) return res.status(404).json({ error: '找不到該許願' });
    wishes[idx].status = status;
    writeWishes(wishes);
    return res.status(200).json(wishes[idx]);
  }
  const content = String(body.content || '').trim();
  if (!content) return res.status(400).json({ error: '請填寫許願內容' });
  const wishes = readWishes();
  const newWish = {
    id: 'wish-' + Date.now(),
    content: content,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  wishes.push(newWish);
  writeWishes(wishes);
  res.status(201).json(newWish);
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return null;
}

app.listen(PORT, () => {
  console.log(`蜂群工具集錦 API 運行於 http://localhost:${PORT}`);
  const localIP = getLocalIP();
  if (localIP) console.log(`同網段夥伴可開： http://${localIP}:${PORT}`);
});
