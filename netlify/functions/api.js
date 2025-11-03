// Netlify Serverless Function - API Proxy
// This proxies requests to your backend API

const serverless = require('serverless-http');
const express = require('express');

// Import your backend app
// Note: You'll need to adapt your backend to work with serverless functions
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Netlify Functions API is running' });
});

// For a full backend integration, you would import your Express app:
// const backendApp = require('../../backend/src/server');
// module.exports.handler = serverless(backendApp);

// For now, this is a placeholder
module.exports.handler = serverless(app);
