const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Import chatbot routes
const chatbotRoutes = require('./routes/chatbot');
app.use('/api', chatbotRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/features', (req, res) => {
  res.sendFile(path.join(__dirname, 'features.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SoulSync server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SoulSync server running on http://localhost:${PORT}`);
  console.log(`💜 Mental health support available 24/7`);
});

module.exports = app;
