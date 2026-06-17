const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function parseDeviceInfo(ua) {
  if (!ua) return 'Bilinmiyor';
  const info = [];
  if (/mobile|iphone|ipad|android/i.test(ua)) info.push('Mobil');
  else if (/tablet|ipad/i.test(ua)) info.push('Tablet');
  else info.push('Masaüstü');
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) info.push('Chrome');
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) info.push('Safari');
  else if (/firefox/i.test(ua)) info.push('Firefox');
  else if (/edge/i.test(ua)) info.push('Edge');
  else if (/opr/i.test(ua)) info.push('Opera');
  else info.push('Diğer');
  if (/windows/i.test(ua)) info.push('Windows');
  else if (/macintosh|mac os/i.test(ua)) info.push('macOS');
  else if (/linux/i.test(ua) && !/android/i.test(ua)) info.push('Linux');
  else if (/android/i.test(ua)) info.push('Android');
  else if (/iphone|ipad/i.test(ua)) info.push('iOS');
  return info.join(' · ');
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || '';
}

router.get('/admin/logs', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const logs = await db.all(
      'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    res.json(logs);
  } catch (err) {
    console.error('[Logs Error]', err);
    res.status(500).json({ error: 'Loglar yüklenirken hata oluştu' });
  }
});

router.get('/admin/visitor-logs', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const logs = await db.all(
      'SELECT * FROM visitor_logs ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    res.json(logs);
  } catch (err) {
    console.error('[Logs Error]', err);
    res.status(500).json({ error: 'Ziyaretçi logları yüklenirken hata oluştu' });
  }
});

router.post('/visit', async (req, res) => {
  try {
    const db = await getDb();
    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const deviceInfo = parseDeviceInfo(ua);
    const pageVisited = req.body?.page || req.headers['referer'] || '/';
    const referrer = req.body?.referrer || '';
    await db.run(
      'INSERT INTO visitor_logs (ip_address, user_agent, device_info, page_visited, referrer) VALUES (?, ?, ?, ?, ?)',
      [ip, ua, deviceInfo, pageVisited, referrer]
    );
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: true });
  }
});

module.exports = router;
