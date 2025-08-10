S.O.L. — SOVEREIGN.ORIGIN.LIGHT

Revolutionary Drone Controller Teaching Platform (Unity-style + Babylon.js)

- Unity-style folders: `Assets/Scripts`, `Assets/Scenes`
- Babylon.js 3D engine; first-person drone controller
- Flight modes: HOVER, JET, PRECISION, TELEPORT, ENERGY_BLAST, ULTRA
- HUD with position, velocity, energy, thrust, altitude, stats
- Local dev on http://localhost:8080 with /health
- Ready for Vercel deployment (static + serverless /api/health)

Quick Start

```
npm install
npm start
# http://localhost:8080
# Main Scene: http://localhost:8080/Scenes/SOL_Superman_Drone_Controller.html
# Health: http://localhost:8080/health
```

Vercel

```
vercel link --yes
vercel --prod -y
```

Controls

- WASD move, Q/E yaw, Space/Shift up/down, Alt precision
- Tab cycle modes, T teleport, B energy blast, U ultra, Mouse look

License: MIT
