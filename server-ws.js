const WebSocket = require('ws');

let wss;
const clientsIdentity = {}; // Objeto para armazenar conexões WebSocket por e-mail

function broadcast(jsonObject) {
  if (!this.clients) return;
  this.clients.forEach(client => {
    if (client !== wss && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(jsonObject));
    }
  });
}

function onError(ws, err) {
  console.error(`onError: ${err.message}`);
}

function onMessage(ws, data) {
  console.log(`onMessage: ${data}`);
  ws.send(`recebido!`);
}

function onConnection(ws, req, client) {
  ws.on('message', data => onMessage(ws, data));
  ws.on('error', error => onError(ws, error));
  ws.on('close', () => {
    console.log(`Client disconnected: ${client.email}`);
    // Remove a conexão do objeto quando o cliente desconectar
    delete clientsIdentity[client.email];
  });
  console.log(`onConnection with client: ${client.email}`);

  // Armazenar a conexão WebSocket associada ao e-mail do cliente
  clientsIdentity[client.email] = ws;
}

function authenticate(request, callback) {
  //logical auth
  if (true) {
    const client = { email: 'teste@email.com' };
    return callback(null, client);
  }
}

// Função para enviar uma mensagem para um cliente específicos
function sendToClient(email, message) {
  const client = clientsIdentity[email];
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  } else {
    console.log(`Client ${email} is not connected`);
  }
}

module.exports = (server) => {
  wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', onConnection);
  wss.on('close', () => {
    console.log('Client disconnected');
  });
  wss.broadcast = broadcast;

  server.on('upgrade', function upgrade(request, socket, head) {
    socket.on('error', (err) => {
      console.error(`Socket error: ${err.message}`);
      socket.destroy();
    });

    authenticate(request, function next(err, client) {
      if (err || !client) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      socket.removeListener('error', (err) => {
        console.error(`Socket error: ${err.message}`);
        socket.destroy();
      });

      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request, client);
      });
    });
  });

  console.log(`App Web wss Server is running!`);
  return { wss, sendToClient };
}