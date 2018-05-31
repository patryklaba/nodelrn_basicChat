const socketio = require('socket.io');

function DTO(action, success, msg) {
  this.actionName = action || null;
  this.success = success || null;
  this.message = msg || '';
}

exports.listen = function(server) {
  let io = socketio.listen(server);
  let guestNumber = 1;
  const nickNames = {};
  const namesUsed = [];
  const currentRoom = {};
  const defaultRoomName = "Lobby";
  const chatDto = { actionName: null, success: null, message: null };

  io.on('connection', (socket) => {
    guestNumber = assignGuestName(socket);
    joinRoom(socket, defaultRoomName);
    handleNickChange(socket);
    handleMessageBroadcasting(socket);
  });
  
  function handleMessageBroadcasting(socket) {
    socket.on('message', (message) => {
      socket.broadcast.to(message.room).emit('message',{ text: `${nickNames[socket.id]} sends a message: ${message.text}!`});
    });
  }

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
  
  function handleNickChange(socket) {
    //handle event triggered by a client 
    socket.on('client:ChangeNick', (newNick)=>{
      const {isValid, message } = verifyNick(newNick);
      if(isValid) {
        let prevName = changeName(socket, newNick);
        // if new name is valid inform whole room about user's name change
        socket.broadcast.to(currentRoom[socket.id].emit(
          'message', 
          { text: `User ${prevName} has a new name: ${newNick}` }
        ));
      }
      // send results of the name change attempt to the client
      const changeNameDto = new DTO('changeNick', isValid, message);
      socket.emit('event', changeNameDto);
      
    })
  }

  function getIndex(name) {
    return namesUsed.indexOf(name);
  }

  function changeName(socket, newNick) {
    let prevName = nickNames[socket.id];
    let index = getIndex(prevName);
    namesUsed[index] = newNick;
    nickNames[socket.id] = newNick;
    return prevName;
  }
  function verifyNick(nick) {
    let isValid = true;
    let message = 'Your name has been changed.';

    if(nick.toLowerCase().indexOf('guest') == 0) {
      isValid = false;
      message = 'Your new nick should not start with a word "guest".';
    }

    // check if nick is already taken 
    if(namesUsed.some( el => el.toLowerCase() === nick.toLowerCase()) ) {
      isValid = false;
      message = 'This name has already been taken. Choose another name.';
    }

    return { isValid, message };
  }
};



