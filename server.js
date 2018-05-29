const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

// modules 
const chatServer = require('./lib/chat_server.js');
//
const cache = {}; // static files caching for faster site load



const server = http.createServer( (req, res) => {
  let filePath = null;
  if(req.url === '/') {
    filePath = `public/index.html`;
  } else {
    filePath = `public${req.url}`;
  }
  let absPath = `./${filePath}`;
  console.log(absPath);
  serveStatic(res, cache, absPath);
}).listen(3000, () => console.log('listening on port 3000!'));

// ChatServer communication
chatServer.listen(server);


function serveStatic(response, cache, pathToFile) {
  // sprawdzenie czy plik jest juz w cache
  if (cache[pathToFile]) {
    sendFile(response, pathToFile, cache[pathToFile]);
  } else {
    // sprawdzam czy zadany plik istnieje -> fs.constants.F_OK = warunek ist. pliku
    fs.access(pathToFile, fs.constants.F_OK, (err) => {
      if(err) {
        console.log(`File ${pathToFile} does not exist`);
        return send404resp(response);
      }
      fs.readFile(pathToFile, (err, data) => {
        if (err) return send404resp(response);
        cache[pathToFile] = data; 
        sendFile(response, pathToFile, data);
      });
    })
  }
  
}

// 404 response 
function send404resp(response) {
  response.writeHead(404, { 'content-type': 'text/plain'});
  response.write('404 ERROR - static file not found');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {
    'content-type': mime.getType(path.basename(filePath))
  });
  response.end(fileContents);
}



// prosty serwer plików statycznych gotowy 
// zainicjowane repozytorium git (nie ma jeszcze remote)
// dodać do gitignore katologi i pliki, których mają byc ignorowane (node_modules)
// usunąc logowanie dev
