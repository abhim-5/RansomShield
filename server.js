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
app.use(helmet());                      // Sets security-related HTTP headers
app.use(cors());                        // Enables CORS
app.use(express.json({ limit: '10mb' })); // Parses JSON bodies (limit for large AI inputs)
app.use(express.urlencoded({ extended: true }));

// 📜 Logging HTTP requests to logs/access.log
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// 🌐 Serve Frontend UI
app.use(express.static(path.join(__dirname, 'public')));

// 🔌 API Routes
app.use('/api/scan', scanRoute);

// 🏠 Landing Page Route (fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
