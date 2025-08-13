const http = require('http');
const WebSocket = require('ws');

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });
  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', (msg) => {
      // naive broadcast of telemetry
      for (const client of wss.clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(msg);
        }
      }
    });
  });

  // Heartbeat to drop dead connections
  const interval = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws.isAlive === false) { try { ws.terminate(); } catch(_){}; continue; }
      ws.isAlive = false;
      try { ws.ping(); } catch(_){}
    }
  }, 15000);
  wss.on('close', () => clearInterval(interval));
  return wss;
}

module.exports = { startWebSocketServer };


