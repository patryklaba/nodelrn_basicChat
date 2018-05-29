const socketio = require('socket.io');

let guestNumber = 1;
const nickNames = {};
const namesUsed = [];
const currentRoom = {};

exports.listen = function(server) {
  let io = socketio.listen(server);

  io.on('connection', (socket) => {
    guestNumber = assignGuestName(socket);
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