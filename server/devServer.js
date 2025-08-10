const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { startWebSocketServer } = require('./wsServer');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'S.O.L. Drone Controller', time: new Date().toISOString() });
});

app.use('/', express.static(publicDir));
app.use('/Assets', express.static(path.join(publicDir, 'Assets')));
app.use('/Assets', express.static(path.join(rootDir, 'Assets')));
app.use('/', express.static(rootDir));

// Local metrics endpoint to write to ./.data/metrics.ndjson
app.use(express.json({ limit: '256kb' }));
app.post('/api/metrics', (req, res) => {
  try {
    const dataDir = path.join(rootDir, '.data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const line = JSON.stringify({ ...req.body, t: Date.now() }) + '\n';
    fs.appendFileSync(path.join(dataDir, 'metrics.ndjson'), line, 'utf8');
    res.json({ ok: true });
  } catch (err) {
    console.error('[metrics:devServer:error]', err);
    res.status(500).json({ error: 'write_failed' });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(rootDir, 'Assets', 'Scenes', 'SOL_Superman_Drone_Controller.html'));
});

const server = http.createServer(app);
startWebSocketServer(server);
server.listen(PORT, () => {
  console.log(`[S.O.L] Dev server running at http://localhost:${PORT}`);
});
