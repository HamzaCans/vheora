const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { getDb } = require('../db');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla hatalı giriş denemesi. 15 dakika bekleyin.' }
});

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

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    const token = generateToken(user.id);

    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const deviceInfo = parseDeviceInfo(ua);
    await db.run(
      'INSERT INTO admin_logs (user_id, username, action, ip_address, user_agent, device_info) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.username, 'login', ip, ua, deviceInfo]
    );

    res.json({ token, username: user.username, device_info: deviceInfo, ip_address: ip });
  } catch (err) {
    console.error('[Auth Error]', err);
    res.status(500).json({ error: 'Giriş sırasında hata oluştu' });
  }
});

module.exports = router;
