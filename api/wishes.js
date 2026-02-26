const { Redis } = require('@upstash/redis');

const REDIS_KEY = 'bee-tools-hub:wishes';

async function getWishes(redis) {
  const raw = await redis.get(REDIS_KEY);
  if (raw === null || raw === undefined) return [];
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function setWishes(redis, list) {
  await redis.set(REDIS_KEY, JSON.stringify(list));
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
    return res.status(500).json({ error: '未設定 Redis' });
  }

  const redis = new Redis({ url, token });

  if (req.method === 'GET') {
    const wishes = await getWishes(redis);
    const password = req.query?.password;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (password && adminPassword && password === adminPassword) {
      return res.json({ list: wishes, pendingCount: wishes.filter(function (w) { return w.status === 'pending'; }).length });
    }
    const pendingCount = wishes.filter(function (w) { return w.status === 'pending'; }).length;
    return res.json({ pendingCount });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const action = body.action;

    if (action === 'list') {
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword || body.password !== adminPassword) {
        return res.status(403).json({ error: '密碼錯誤' });
      }
      const wishes = await getWishes(redis);
      return res.json({
        list: wishes,
        pendingCount: wishes.filter(function (w) { return w.status === 'pending'; }).length
      });
    }

    if (action === 'updateStatus') {
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword || body.password !== adminPassword) {
        return res.status(403).json({ error: '密碼錯誤' });
      }
      const id = body.id;
      const status = body.status;
      if (!id || !status) return res.status(400).json({ error: '請提供 id 與 status' });
      const allowed = ['pending', 'processing', 'done'];
      if (allowed.indexOf(status) === -1) return res.status(400).json({ error: 'status 須為 pending / processing / done' });
      const wishes = await getWishes(redis);
      const idx = wishes.findIndex(function (w) { return w.id === id; });
      if (idx === -1) return res.status(404).json({ error: '找不到該許願' });
      wishes[idx].status = status;
      await setWishes(redis, wishes);
      return res.status(200).json(wishes[idx]);
    }

    if (action === 'submit' || (!action && body.content != null)) {
      const content = String(body.content || '').trim();
      if (!content) return res.status(400).json({ error: '請填寫許願內容' });
      const wishes = await getWishes(redis);
      const newWish = {
        id: 'wish-' + Date.now(),
        content: content,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      wishes.push(newWish);
      await setWishes(redis, wishes);
      return res.status(201).json(newWish);
    }

    return res.status(400).json({ error: '請提供 content 或 action' });
  }
};
