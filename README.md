S.O.L. — SOVEREIGN.ORIGIN.LIGHT

Babylon.js-based flight controller sandbox with meter-accurate, streamed world tiles, floating-origin precision, and performance-conscious effects. Unity-style project layout under `Assets/` for familiarity.

Features

- World streaming: meter-based chunk tiles, load/unload around player
- Floating origin: keeps precision by recentring world content
- Flight modes: HOVER, JET, PRECISION, TELEPORT, ENERGY_BLAST, ULTRA
- Visuals: speed lines, glow/aura, trails; Babylon GridMaterial preferred
- HUD + Telemetry: live HUD data, optional WebSocket telemetry
  - New: `SOL_TelemetryClient` library (batching, backoff, metadata & sensors)
  - Inspector: open `/inspector.html` to see live packets and pose
- Performance: adaptive hardware scaling + optional SceneOptimizer
- Debug: Babylon Debug Layer toggle (Ctrl+Shift+D)

Requirements

- Node.js 18+ (LTS) and npm
- Modern browser with WebGL2

Project layout

- `Assets/Scenes/` — entry HTML for the classic scene
- `Assets/Scripts/` — source scripts (Unity-style)
- `public/Assets/Scripts/` — served scripts (Babylon runtime)
- `server/` — Express dev server + WebSocket server for telemetry
- `api/` — simple API endpoints for serverless/static hosting

Getting started

```bash
npm install

# macOS/Linux
npm start

# Windows PowerShell (if npm is not on PATH or you prefer explicit invocation)
powershell -NoLogo -NoProfile -Command "npm run start"

# Dev server
# http://localhost:8080
# Main Scene: http://localhost:8080/Scenes/SOL_Superman_Drone_Controller.html
# Health: http://localhost:8080/health
```

Controls

- WASD: move
- Space/Shift: up/down
- Q/E: yaw
- Alt: precision modifier
- Tab: cycle modes
- T: teleport
- B: energy blast
- U: ultra
- Mouse: look (click canvas to lock pointer)
- Ctrl+Shift+D: toggle Debug Layer

Configuration

Runtime config lives in `public/Assets/Scripts/Config.js`.

```js
world: {
  unitsPerMeter: 1,             // 1 unit == 1 meter
  tileSizeMeters: 200,          // size of each streamed tile
  renderRadiusTiles: 3,         // tiles kept around player in +/- radius
  floatingOrigin: true,         // recenter world to maintain precision
  recenterThresholdMeters: 500, // distance before recentering
  enableChessboardOverlay: false
},
optimize: {
  sceneOptimizer: 'moderate'    // 'none' | 'low' | 'moderate' | 'high'
},
telemetry: {
  wsEnabled: true,
  wsUrl: "ws://localhost:8080/ws",
  sendIntervalMs: 200
}
```

Babylon architecture notes

- Per-frame updates: use `scene.onBeforeRenderObservable`
- Materials: prefer `BABYLON.GridMaterial` when available
- Precision: use floating origin with a world root `TransformNode`
- Debug: use `scene.debugLayer.show()` when needed

Development workflow

- Start dev server: `npm start` (Express serves `public/` and `Assets/`)
- Edit runtime scripts under `public/Assets/Scripts/`
- Optional: Enable `world.enableChessboardOverlay` for the chess grid overlay
 - Scenes are also available under `/Scenes` (dev convenience)
 - Telemetry Inspector: `/inspector.html`

Testing

- Unit tests: Jest (configured but minimal)
- E2E: Playwright (`npm run test:pw`) — artifacts are ignored by `.gitignore`

Deployment (Vercel)

Preferred: connect GitHub repo in Vercel — PRs get Preview Deployments; `main` merges deploy to Production.

CLI quickstart:

```bash
npm i -g vercel
vercel login
vercel link --yes
vercel        # Preview
vercel --prod # Production
```

Troubleshooting

- Windows PowerShell inline commands can be finicky. Prefer `npm start` directly from a shell.
- If port 8080 is busy, set `PORT=8081` (macOS/Linux) or `$env:PORT=8081` (PowerShell) before `npm start`.

License

MIT
