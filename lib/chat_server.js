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
    joinRoom(io, socket, defaultRoom);
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

function joinRoom(io, socket, roomName) {
  socket.join(roomName);
  currentRoom[socket.id] = roomName;
  
  // inform client about joining the room
  socket.emit('notifyUser:joinRoom', { joinRoomMsg: `You have just joined ${currentRoom[socket.id]} room` });

  // inform whole room about new user joining
  socket.broadcast.to(roomName).emit('notifyRoom:newUser', {
    newUserMsg: `${nickNames[socket.id]} joined the room ${roomName}`
  })

  // print number of users in a current room 
  const usersInRoom = io.clients( (err, clients) => {
    if (err) return console.log(`An error occured: ${err}`);
    let infoMsg = `${clients.length} users in this room. You and:`;
    clients.forEach(client => {
      if(client != socket.id) {
        infoMsg += ` [${nickNames[client]}]`
      } else if ( client === socket.id && clients.length === 1) {
        infoMsg = `Currently you are the only person in this room`;
      }
    });
    // room info for new user
    socket.emit('notifyUser:roomInfo', {roomInfoMsg: infoMsg});
  })
}