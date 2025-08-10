const isVercel = (typeof location !== 'undefined') && /vercel\.app$/.test(location.hostname);
const isProdStatic = (typeof location !== 'undefined') && location.protocol === 'https:' && !location.port;

window.SOL_Config = {
  acceleration: {
    base: 20,
    jetMultiplier: 3.0,
    precisionMultiplier: 0.25,
    ultraMultiplier: 2.0,
    supermanMultiplier: 1.5
  },
  speedCap: 30,
  controls: {
    yawSensitivity: 1.5
  },
  teleport: {
    distance: 20,
    ultraMultiplier: 2.5
  },
  visuals: {
    trailMaxPoints: 60,
    glowBase: 0.0,
    glowUltra: 0.8,
    glowSuperman: 0.3,
    enableSpeedLines: !(isVercel || isProdStatic) // disable on Vercel for clean UI
  },
  hud: {
    show: true
  },
  physics: {
    clampAltitude: true,
    minY: 0.5,
    maxY: 150
  },
  telemetry: {
    wsEnabled: !(isVercel || isProdStatic),
    wsUrl: (typeof location !== 'undefined') ? `ws://${location.hostname}:8080/ws` : 'ws://localhost:8080/ws',
    sendIntervalMs: 200
  }
};


