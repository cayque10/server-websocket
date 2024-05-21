const express = require("express");
const app = express();
const WebSocketServer = require("./server-ws")

//Rotas
app.get("/websocket", (req, res) => {
  res.send({ success: true })
});

const server = app.listen(3001, "127.0.0.1", () => {
  console.log("Server started");
});

const wss = WebSocketServer(server);

setInterval(() => {
  // Enviar uma mensagem para um cliente específico
  const email = 'teste@email.com';
  const message = { type: 'status', content: 'Your order has been shipped' };
  wss.sendToClient(email, message);

  wss.wss.broadcast({ n: Math.random() })
}, 1000)


