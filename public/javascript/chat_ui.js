const socket = io();


function sanitize(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
}

function createMessageEl(message) {
  let el = document.createElement('div');
  el.innerText = sanitize(message.text);
  return el;
}



$(document).ready( () => {
  const chatApp = new Chat(socket);
  const ui = {
    messages: document.querySelector('#messages'),
    form: document.querySelector('#send-form'),
    messageInput: document.querySelector('#send-message'),
    sendBtn: document.querySelector('#send-button')
  };

  socket.on('message', (message) => {
    ui.messages.appendChild(createMessageEl(message));
    ui.messageInput.value = '';
  })

  ui.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = {};
    message["text"] = ui.messageInput.value;
    message["room"] = "Lobby";
    socket.emit('message', message);
    return false;
  })
});