const socket = io();
const ui = {
  messages: document.querySelector('#messages'),
  form: document.querySelector('#send-form'),
  messageInput: document.querySelector('#send-message'),
  sendBtn: document.querySelector('#send-button')
};

function sanitize(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
}

function createMessageEl(message, type) {
  let el = document.createElement('div');
  if(type) el.className = `${type}-message`;
  el.innerText = (!type) ? sanitize(message.text) : sanitize(`Me: ${message.text}`);
  return el;
}

function appendMessage(message, type) {
  const msgElement = createMessageEl(message, type);
  ui.messages.appendChild(msgElement);
  ui.messageInput.value = '';
  ui.messages.scrollTop = ui.messages.scrollHeight;
}

function info(text) {
  appendMessage({text}, 'info');
}



$(document).ready( () => {
  const chatApp = new Chat(socket);
  

  socket.on('message', (message) => {
    appendMessage(message);
  })

  ui.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const textValue = ui.messageInput.value;
    if(textValue.length > 1) {
      const message = {};
      message["text"] = textValue;
      message["room"] = "Lobby";
      socket.emit('message', message);
      appendMessage(message, 'user');
    } else {
      info('your message should have at least 2 characters', 'info');
    }
    return false;
  })
});