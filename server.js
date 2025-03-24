const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io Connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.user.userId);

  // Join a chat room
  socket.on('join room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.userId} joined room ${roomId}`);
  });

  // Handle new messages
  socket.on('send message', async (data) => {
    try {
      const { roomId, message } = data;
      
      // Emit message to room
      io.to(roomId).emit('message', message);
      console.log(`Message sent to room ${roomId}`);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle user presence
  socket.on('userStatus', (status) => {
    io.emit('userStatusUpdate', status);
  });

  // Handle typing status
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('typing', {
      userId: socket.user.userId,
      username: socket.user.username,
      avatar: socket.user.avatar
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.user.userId);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 