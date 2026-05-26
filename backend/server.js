const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const app = express();

// ── Trust Proxy — required for Render/Heroku/any reverse proxy ───────────────
app.set('trust proxy', 1);

// ── Connect Database ──────────────────────────────────────────────────────────
connectDB();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(mongoSanitize());
app.use(compression());

// ── CORS — allows localhost dev + Vercel production ───────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    // No origin = mobile app, Postman, curl — allow
    if (!origin) return callback(null, true);

    const allowed = [
      // Local development
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5500',
      'http://localhost:5501',
      'http://127.0.0.1:5500',
      'http://127.0.0.1:5501',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      // Production — from environment variable
      process.env.CLIENT_URL,
      // Common Vercel patterns — add your actual domain here
      process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : null,
    ].filter(Boolean);

    if (allowed.includes(origin)) return callback(null, true);

    // Allow any localhost port (development)
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Allow any Vercel deployment (*.vercel.app)
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow any Render deployment (*.onrender.com)
    if (/^https:\/\/.*\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight for all routes
app.options('*', cors());

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logger ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ── Static Files (uploads) ────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health Check ── (before API routes for fast ping) ────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AstroVeda API is running',
    version: '1.0.0',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/testimonials',  require('./routes/testimonials'));
app.use('/api/rashi',         require('./routes/rashi'));
app.use('/api/achievements',  require('./routes/achievements'));
app.use('/api/feedback',      require('./routes/feedback'));
app.use('/api/dashboard',     require('./routes/dashboard'));

// ── 404 for unknown API routes ────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AstroVeda API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
