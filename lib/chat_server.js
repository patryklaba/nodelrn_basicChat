const socketio = require('socket.io');

let guestNumber = 1;
const nickNames = {};
const namesUsed = [];
const currentRoom = {};
const defaultRoom = "Lobby";

exports.listen = function(server) {
  let io = socketio.listen(server);

  io.on('connection', (socket) => {
    guestNumber = assignGuestName(socket);
    joinRoom(socket, defaultRoom);
  });
};



function assignGuestName(socket) {
  const name = "Guest" + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameResult', { success: true, name: name });
  namesUsed.push(name);
  console.log(`### ${name} joined`);
  return guestNumber + 1;
}

function joinRoom(socket, roomName) {
  socket.join(roomName);
  currentRoom[socket.id] = roomName;
  
  // inform client about joining the room
  socket.emit('joinResult', { room: roomName });

  // inform whole room about new user joining
  socket.broadcast.to(roomName).emit('newUser', {
    msg: `${nickNames[socket.id]} joined the room ${roomName}`
  })
}