const express = require('express');
const path = require('path');
const http = require('http');
const { startWebSocketServer } = require('./wsServer');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const rootDir = path.join(__dirname, '..');

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'S.O.L. Drone Controller', time: new Date().toISOString() });
});

app.use('/Assets', express.static(path.join(rootDir, 'Assets')));
app.use('/', express.static(rootDir));

app.get('/', (_req, res) => {
  res.sendFile(path.join(rootDir, 'Assets', 'Scenes', 'SOL_Superman_Drone_Controller.html'));
});

const server = http.createServer(app);
startWebSocketServer(server);
server.listen(PORT, () => {
  console.log(`[S.O.L] Dev server running at http://localhost:${PORT}`);
});
