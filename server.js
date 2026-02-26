require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data', 'tools.json');

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

app.get('/api/tools', (req, res) => {
  const tools = readTools();
  res.json(tools);
});

app.post('/api/tools', (req, res) => {
  const password = req.body.password;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: '伺服器未設定管理者密碼' });
  }
  if (password !== adminPassword) {
    return res.status(403).json({ error: '密碼錯誤' });
  }

  const tool = req.body.tool;
  if (!tool || !tool.name || !tool.url) {
    return res.status(400).json({ error: '請提供工具名稱與網址' });
  }

  const tools = readTools();
  const id = 'tool-' + Date.now();
  const newTool = {
    id,
    name: String(tool.name).trim(),
    url: String(tool.url).trim(),
    description: tool.description ? String(tool.description).trim() : '',
    icon: tool.icon ? String(tool.icon).trim() : ''
  };
  tools.push(newTool);
  writeTools(tools);

  res.status(201).json(newTool);
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

app.listen(PORT, () => {
  console.log(`蜂群工具集錦 API 運行於 http://localhost:${PORT}`);
  const localIP = getLocalIP();
  if (localIP) {
    console.log(`同網段夥伴可開： http://${localIP}:${PORT}`);
  }
});
