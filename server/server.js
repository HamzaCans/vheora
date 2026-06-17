require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { getDb } = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const messageRoutes = require('./routes/messages');
const logRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');

app.use(compression());

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://www.googletagmanager.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  }
}));

app.use(cors());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika bekleyin.' }
});

app.use('/api/', apiLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

function sanitize(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/<[^>]*>/g, '').trim();
  }
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = sanitize(obj[key]);
      }
    }
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && !req._sanitized) {
    sanitize(req.body);
    req._sanitized = true;
  }
  if (req.query && typeof req.query === 'object') {
    sanitize(req.query);
  }
  next();
});

const cacheTime = 7 * 24 * 60 * 60;
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: cacheTime * 1000,
  immutable: true
}));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin'), {
  maxAge: 0,
  etag: true
}));
app.use('/', express.static(path.join(__dirname, '..'), {
  maxAge: cacheTime * 1000,
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', messageRoutes);
app.use('/api', logRoutes);

app.get('/admin', (req, res) => {
  res.redirect('/admin/');
});

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'sw.js'));
});

app.get('*.html', (req, res, next) => {
  const filePath = path.join(__dirname, '..', req.path);
  if (!require('fs').existsSync(filePath)) {
    res.status(404).sendFile(path.join(__dirname, '..', '404.html'));
  } else {
    next();
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Geçersiz JSON verisi' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Çok büyük veri gönderildi' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Dosya boyutu 5MB\'dan büyük olamaz' });
  }
  if (err.message && err.message.includes('Sadece')) {
    return res.status(400).json({ error: err.message });
  }
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ error: 'Bir hata oluştu' });
});

async function start() {
  await getDb();
  app.listen(PORT, () => {
    console.log(`[VHEORA] Server running on http://localhost:${PORT}`);
  });
}

start();
