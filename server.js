const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let messageHistory = [];

app.get('/', (req, res) => {
  // send chat.ps1 file as response string
  res = res.sendFile(__dirname + '/chat.ps1');
});

wss.on('connection', (ws, req) => {
  const clientId = decodeURI(req.url.substring(1));
  console.log(`Client connected with ID: ${clientId}`);

  // Send message history to the new client
  messageHistory.forEach(message => {
    ws.send(message);
  });

  ws.on('message', (message) => {
    console.log(`Received message from ${clientId}: ${message}`);
    let parsedMessage = JSON.parse(message);
    let formattedMessage = `${parsedMessage.ClientID}: ${parsedMessage.Payload}`;
    
    // Add message to history
    messageHistory.push(formattedMessage);
    
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(formattedMessage);
      }
    });
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
