const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Socket.io connection
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined`);
  });

  socket.on('sendMessage', (data) => {
    const { receiverId, message } = data;
    io.to(`user_${receiverId}`).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection with automatic in-memory fallback
const { seedData } = require('./seed');

async function startServer() {
  let connected = false;
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && process.env.USE_MEMORY_DB !== 'true') {
    try {
      console.log(`Connecting to MongoDB at ${mongoUri}...`);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
      console.log('✅ Connected to MongoDB');
      connected = true;
    } catch (err) {
      console.warn(`⚠️ Local MongoDB connection failed (${err.message}). Falling back to in-memory database...`);
    }
  }

  if (!connected) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      console.log('⚡ Starting in-memory MongoDB instance for development...');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ In-memory MongoDB connected at ${memoryUri}`);
    } catch (err) {
      console.error('❌ Failed to start in-memory MongoDB:', err);
      process.exit(1);
    }
  }

  // Ensure default services and test users are seeded
  try {
    await seedData(false);
  } catch (seedErr) {
    console.warn('⚠️ Seeding notice:', seedErr.message);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();

module.exports = { app, io };
