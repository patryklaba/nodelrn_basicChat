const Chat = function(socket) {
  this.socket = socket;
}

Chat.prototype.sendMessage = function({room, text}) {
  this.socket.emit('message', {
    room,
    text
  });
}

Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom: room
  });
};

Chat.prototype.changeName = function(newName) {
  this.socket.emit('client:ChangeNick', newName);
}

Chat.prototype.processCmd = function(cmd) {
  const words = cmd.split(' ');
  const command = words[0].slice(1).toLowerCase();
  let message = false;
  switch(command) {
    case 'join':
      words.shift();
      const room = words.join(' ');
      this.changeRoom(room);
      break;
    case 'nick':
      words.shift();
      const name = words.join(' ');
      this.changeName(name);
      break;
    default: 
      message: 'Unknown command';
      break;
  }
  return message;
};