# Real-time Chat Application

A full-stack real-time chat application built with Node.js, Express, MongoDB, Socket.io, and React.

## Features

- User authentication (register/login)
- Real-time messaging
- Private and group chat rooms
- File sharing
- User presence indicators
- Message history
- Read receipts
- Modern UI with Material-UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone https://github.com/THARUN6367/chatroom.git
cd chat-app
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Messages
- GET /api/messages/:roomId - Get messages for a room
- POST /api/messages - Send a new message
- PUT /api/messages/:roomId/read - Mark messages as read

### Rooms
- GET /api/rooms - Get all rooms for a user
- POST /api/rooms - Create a new room
- GET /api/rooms/:roomId - Get room details
- PUT /api/rooms/:roomId - Update room
- POST /api/rooms/:roomId/participants - Add participants to room
- DELETE /api/rooms/:roomId/participants/:userId - Remove participant from room

### Users
- GET /api/users - Get all users
- GET /api/users/:userId - Get user profile
- PUT /api/users/profile - Update user profile
- PUT /api/users/status - Update user status

## Technologies Used

- Backend:
  - Node.js
  - Express
  - MongoDB with Mongoose
  - Socket.io
  - JWT for authentication

- Frontend:
  - React
  - Material-UI
  - Socket.io-client
  - Axios
  - React Router

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 
