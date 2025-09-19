const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());
app.use(express.json());

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();
let messageId = 0;

// WebSocket connection handler
wss.on('connection', (ws) => {
  const clientId = Date.now().toString();
  console.log(`Client connected: ${clientId}`);
  
  // Store client
  clients.set(clientId, {
    ws: ws,
    name: 'Anonymous',
    type: 'patient' // or 'doctor'
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Connected to chat server',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'join') {
        // Update client info
        clients.set(clientId, {
          ...clients.get(clientId),
          name: message.name || 'Anonymous',
          type: message.userType || 'patient'
        });
        
        console.log(`${message.name} joined as ${message.userType}`);
        
        // Broadcast join message
        broadcastMessage({
          type: 'system',
          message: `${message.name} joined the chat`,
          timestamp: new Date().toISOString()
        }, clientId);
        
      } else if (message.type === 'chat') {
        const client = clients.get(clientId);
        const chatMessage = {
          id: ++messageId,
          type: 'chat',
          sender: client.name,
          senderType: client.type,
          message: message.message,
          timestamp: new Date().toISOString()
        };
        
        console.log(`${client.name}: ${message.message}`);
        
        // Broadcast message to all clients
        broadcastMessage(chatMessage);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    const client = clients.get(clientId);
    if (client) {
      console.log(`Client disconnected: ${client.name}`);
      broadcastMessage({
        type: 'system',
        message: `${client.name} left the chat`,
        timestamp: new Date().toISOString()
      }, clientId);
    }
    clients.delete(clientId);
  });
});

// Broadcast message to all connected clients
function broadcastMessage(message, excludeClientId = null) {
  const messageStr = JSON.stringify(message);
  
  clients.forEach((client, id) => {
    if (id !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    clients: clients.size,
    timestamp: new Date().toISOString() 
  });
});

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Simple Chat Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`WebSocket server ready for connections`);
});
