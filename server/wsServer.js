const http = require('http');
const WebSocket = require('ws');

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      // naive broadcast of telemetry
      for (const client of wss.clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(msg);
        }
      }
    });
  });
  return wss;
}

module.exports = { startWebSocketServer };


