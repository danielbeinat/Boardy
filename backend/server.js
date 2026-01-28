const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/board');
const userRoutes = require('./routes/user');

const app = express();

// Trust proxy if behind one (useful for rate limiting)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Only apply rate limiting in production or with higher limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 requests in dev
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
const connectDB = async () => {
  try {
    console.log('Intentando conectar a MongoDB...');
    // Log the URI (masking password) for debugging
    const maskedUri = process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');
    console.log('URI:', maskedUri);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conexión exitosa a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    if (error.message.includes('authentication failed') || error.code === 8000) {
      console.log('⚠️ Error de autenticación. Reintentando en 5 segundos...');
      setTimeout(connectDB, 5000);
    } else {
      console.log('⚠️ Error no recuperable. Revisa la configuración.');
    }
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
