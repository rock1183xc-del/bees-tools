const { Redis } = require('@upstash/redis');

const REDIS_KEY = 'bee-tools-hub:tools';
const DEFAULT_TOOLS = [
  { id: 'sample-1', name: '範例工具一', url: 'https://example.com', description: '這是第一筆範例工具，管理者可新增更多。', icon: '' },
  { id: 'sample-2', name: '範例工具二', url: 'https://example.org', description: '點擊卡片即可開啟連結。', icon: '' }
];

async function getTools(redis) {
  const raw = await redis.get(REDIS_KEY);
  if (raw === null || raw === undefined) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

async function setTools(redis, tools) {
  await redis.set(REDIS_KEY, JSON.stringify(tools));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: '未設定 Redis（請在 Vercel 連結 Upstash Redis）' });
  }

  const redis = new Redis({ url, token });

  if (req.method === 'GET') {
    let tools = await getTools(redis);
    if (!tools || !Array.isArray(tools)) {
      tools = [...DEFAULT_TOOLS];
      await setTools(redis, tools);
    }
    return res.json(tools);
  }

  if (req.method === 'POST') {
    const password = req.body?.password;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return res.status(500).json({ error: '伺服器未設定管理者密碼' });
    }
    if (password !== adminPassword) {
      return res.status(403).json({ error: '密碼錯誤' });
    }

    const action = req.body?.action;

    if (action === 'verify') {
      return res.status(200).json({ ok: true });
    }

    if (action === 'delete') {
      const id = req.body?.id;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: '請提供要刪除的工具 id' });
      }
      let tools = await getTools(redis);
      if (!tools || !Array.isArray(tools)) tools = [...DEFAULT_TOOLS];
      const before = tools.length;
      tools = tools.filter(function (t) { return t.id !== id; });
      if (tools.length === before) {
        return res.status(404).json({ error: '找不到該工具' });
      }
      await setTools(redis, tools);
      return res.status(200).json({ ok: true });
    }

    if (action === 'update') {
      const id = req.body?.id;
      const tool = req.body?.tool;
      if (!id || typeof id !== 'string' || !tool || !tool.name || !tool.url) {
        return res.status(400).json({ error: '請提供要更新的工具 id 與內容' });
      }
      let tools = await getTools(redis);
      if (!tools || !Array.isArray(tools)) tools = [...DEFAULT_TOOLS];
      const idx = tools.findIndex(function (t) { return t.id === id; });
      if (idx === -1) return res.status(404).json({ error: '找不到該工具' });
      tools[idx] = {
        id: tools[idx].id,
        name: String(tool.name).trim(),
        url: String(tool.url).trim(),
        description: (tool.description && String(tool.description).trim()) || '',
        icon: (tool.icon && String(tool.icon).trim()) || '',
        type: (tool.type === 'plugin' ? 'plugin' : 'link')
      };
      await setTools(redis, tools);
      return res.status(200).json(tools[idx]);
    }

    const tool = req.body?.tool;
    if (!tool || !tool.name || !tool.url) {
      return res.status(400).json({ error: '請提供工具名稱與網址' });
    }

    let tools = await getTools(redis);
    if (!tools || !Array.isArray(tools)) tools = [...DEFAULT_TOOLS];

    const newTool = {
      id: 'tool-' + Date.now(),
      name: String(tool.name).trim(),
      url: String(tool.url).trim(),
      description: (tool.description && String(tool.description).trim()) || '',
      icon: (tool.icon && String(tool.icon).trim()) || '',
      type: (tool.type === 'plugin' ? 'plugin' : 'link')
    };
    tools.push(newTool);
    await setTools(redis, tools);

    return res.status(201).json(newTool);
  }
};
