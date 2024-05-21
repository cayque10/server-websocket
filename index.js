const express = require("express");
const app = express();
const WebSocketServer = require("./server-ws")

//Rotas
app.get("/", (req, res) => {
  res.send({ message: "Welcome to websocket server!" })
});
app.get("/websocket", (req, res) => {
  res.send({ success: true })
});

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
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


