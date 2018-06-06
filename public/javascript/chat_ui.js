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

function createMessageEl(message, toSelf) {
  let el = document.createElement('div');
  el.innerText = (toSelf) ? sanitize(`Me: ${message.text}`) : sanitize(message.text);
  return el;
}

function appendMessage(message, type, toSelf) {
  const msgElement = createMessageEl(message, toSelf);
  if(type) msgElement.className = `${type}-message`;
  ui.messages.appendChild(msgElement);
  ui.messageInput.value = '';
  ui.messages.scrollTop = ui.messages.scrollHeight;
}

function info(text) {
  appendMessage({text}, 'info', false );
}

function warn(text) {
  appendMessage({text}, 'warn', false );
}



$(document).ready( () => {
  const chatApp = new Chat(socket);
  

  socket.on('message', (message) => {
    appendMessage(message);
  })

  socket.on('server:info', (message) => {
    info(message.text);
  })

  ui.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const textValue = ui.messageInput.value;
    if(textValue.length > 1) {
      const message = {
        room: 'Lobby',
        text: textValue
      };
      appendMessage(message, 'user', true);
      chatApp.sendMessage(message);
    } else {
      warn('Your message should have at least 2 characters');
    }
    return false;
  })
});