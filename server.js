// server.js
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    const clients = io.sockets.adapter.rooms.get(room);
    const numClients = clients ? clients.size : 0;

    if (numClients === 0) {
      socket.join(room);
      socket.emit('created', room);
    } else if (numClients === 1) {
      socket.join(room);
      socket.emit('joined', room);
      io.to(room).emit('ready');
    } else {
      socket.emit('full', room);
    }
  });

  socket.on('offer', (data) => socket.to(data.room).emit('offer', data.sdp));
  socket.on('answer', (data) => socket.to(data.room).emit('answer', data.sdp));
  socket.on('candidate', (data) => socket.to(data.room).emit('candidate', data.candidate));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
