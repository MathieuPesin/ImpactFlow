const path = require('path');
const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });

console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT || '3000 (default)');

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const uploadRoutes = require('./routes/upload');
const emissionsRoutes = require('./routes/emissions');
const exportsRoutes = require('./routes/exports');
const { initDatabase } = require('./utils/initDatabase');

const app = express();
const port = process.env.PORT || 3000;

// Configuration CORS détaillée
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8082', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Routes API
app.use('/api/upload', uploadRoutes);
app.use('/api/emissions', emissionsRoutes);
app.use('/api/exports', exportsRoutes);

// Route racine pour servir la page HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    services: {
      supabase: supabaseUrl ? 'configured' : 'not configured'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// Initialiser la base de données au démarrage
initDatabase().then(() => {
  console.log('Starting server...');
  console.log('Environment variables:');
  console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
  console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  console.log('- PORT:', process.env.PORT || 3000);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('CORS origins:', ['http://localhost:8080', 'http://localhost:8082', 'http://localhost:5173']);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
