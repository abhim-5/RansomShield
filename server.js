// 🚨 RansomShield - AI-Powered Ransomware Detection Assistant

// server.js – Complete Express Setup with Logging, Security, Static Routing

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const scanRoute = require('./routes/scanRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ Middleware: Security, Logging, Body Parsers
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 📜 Logging HTTP requests to logs/access.log
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// 🔌 API Routes
app.use('/api/scan', scanRoute);

// Only serve frontend in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// 🔔 404 Route Handling
app.use((req, res, next) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// 🚨 Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 🚀 Start the Server
app.listen(PORT, () => {
  console.log(`\n✅ RansomShield AI backend live on http://localhost:${PORT}`);
  console.log('🔐 Listening for file uploads and AI scan requests...');
});
