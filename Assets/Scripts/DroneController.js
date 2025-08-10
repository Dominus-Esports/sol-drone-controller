(function() {
  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true, { stencil: true, preserveDrawingBuffer: true });

  const FlightMode = {
    HOVER: 'HOVER',
    JET: 'JET',
    PRECISION: 'PRECISION',
    TELEPORT: 'TELEPORT',
    ENERGY_BLAST: 'ENERGY_BLAST',
    ULTRA: 'ULTRA',
  };

  let currentMode = FlightMode.HOVER;
  let ultraMode = false;
  let supermanMode = false;

  const state = {
    position: new BABYLON.Vector3(0, 2, 0),
    velocity: new BABYLON.Vector3(0, 0, 0),
    energy: 100,
    thrustPct: 0,
    yaw: 0,
    speedCap: 30,
    teleports: 0,
    blasts: 0,
  };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.04, 0.05, 0.08, 1);

  const camera = new BABYLON.UniversalCamera('Camera', new BABYLON.Vector3(0, 2, -6), scene);
  camera.attachControl(canvas, true);
  camera.inertia = 0.1;
  camera.angularSensibility = 800;

  const light = new BABYLON.HemisphericLight('Light', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  const ground = BABYLON.MeshBuilder.CreateGround('Ground', { width: 200, height: 200 }, scene);
  const groundMat = new BABYLON.StandardMaterial('GroundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.08, 0.1, 0.16);
  ground.material = groundMat;

  const player = BABYLON.MeshBuilder.CreateBox('Drone', { size: 0.4 }, scene);
  player.position = state.position.clone();
  const playerMat = new BABYLON.StandardMaterial('DroneMat', scene);
  playerMat.emissiveColor = new BABYLON.Color3(0.4, 0.6, 1.0);
  player.material = playerMat;

  // Aura/Glow for Ultra/Superman
  const glow = new BABYLON.GlowLayer('glow', scene, { blurKernelSize: 64 });
  glow.intensity = 0.0;

  // Player trail (lines)
  const trailMaxPoints = 60;
  const trailPoints = [];
  let trailLines = null;

  // Speed lines pool
  const speedLines = [];
  const maxSpeedLines = 24;
  function spawnSpeedLine(speedMagnitude) {
    if (speedLines.length >= maxSpeedLines) return;
    const line = BABYLON.MeshBuilder.CreateBox('SpeedLine', { width: 0.02, height: 0.02, depth: 0.8 }, scene);
    line.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    const mat = new BABYLON.StandardMaterial('SpeedLineMat', scene);
    mat.emissiveColor = new BABYLON.Color3(0.7, 0.8, 1.0);
    mat.alpha = 0.85;
    line.material = mat;
    // Place a bit in front of camera with random offset
    const fwd = camera.getDirection(BABYLON.Vector3.Forward()).normalize();
    const right = camera.getDirection(BABYLON.Vector3.Right()).normalize();
    const up = BABYLON.Vector3.Up();
    const dist = 1.2 + Math.random() * 0.8;
    const offR = (Math.random() - 0.5) * 0.6;
    const offU = (Math.random() - 0.5) * 0.6;
    const startPos = camera.position.add(fwd.scale(dist)).add(right.scale(offR)).add(up.scale(offU));
    line.position.copyFrom(startPos);
    const life = 14 + Math.floor(Math.random() * 10);
    const speedFactor = Math.min(2.5, 0.5 + speedMagnitude / 20);
    speedLines.push({ mesh: line, mat, life, speedFactor });
  }

  const keys = { w:false, a:false, s:false, d:false, space:false, shift:false, q:false, e:false, alt:false };

  window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
      case 'w': keys.w = true; break;
      case 'a': keys.a = true; break;
      case 's': keys.s = true; break;
      case 'd': keys.d = true; break;
      case ' ': keys.space = true; break;
      case 'shift': keys.shift = true; break;
      case 'q': keys.q = true; break;
      case 'e': keys.e = true; break;
      case 'alt': keys.alt = true; break;
      case 'tab': e.preventDefault(); cycleMode(); break;
      case 't': teleport(); break;
      case 'b': energyBlast(); break;
      case 'u': ultraMode = !ultraMode; if (window.SOL_Audio) window.SOL_Audio.PlayPowerUp({}); break;
      case 'g': supermanMode = !supermanMode; if (window.SOL_Audio) window.SOL_Audio.PlayPowerUp({}); break;
    }
  });
  window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
      case 'w': keys.w = false; break;
      case 'a': keys.a = false; break;
      case 's': keys.s = false; break;
      case 'd': keys.d = false; break;
      case ' ': keys.space = false; break;
      case 'shift': keys.shift = false; break;
      case 'q': keys.q = false; break;
      case 'e': keys.e = false; break;
      case 'alt': keys.alt = false; break;
    }
  });

  function cycleMode() {
    const order = [FlightMode.HOVER, FlightMode.JET, FlightMode.PRECISION, FlightMode.TELEPORT, FlightMode.ENERGY_BLAST, FlightMode.ULTRA];
    const idx = order.indexOf(currentMode);
    currentMode = order[(idx + 1) % order.length];
  }

  function teleport() {
    const forward = camera.getDirection(BABYLON.Vector3.Forward());
    const dest = player.position.add(forward.scale(ultraMode ? 50 : 20));
    player.position.copyFrom(dest);
    camera.position.copyFrom(dest.add(new BABYLON.Vector3(0, 1.6, -1.5)));
    state.teleports += 1;
    if (window.SOL_Audio) window.SOL_Audio.PlaySweep({ startFreq: 3000, endFreq: 200 });
    // Teleport burst effect
    const burst = BABYLON.MeshBuilder.CreateSphere('TeleportBurst', { diameter: 0.4 }, scene);
    const mat = new BABYLON.StandardMaterial('TeleportBurstMat', scene);
    mat.emissiveColor = new BABYLON.Color3(0.8, 0.6, 1.0);
    mat.alpha = 0.8;
    burst.material = mat;
    burst.position.copyFrom(dest);
    let life = 20;
    scene.onBeforeRenderObservable.add(() => {
      if (life-- <= 0) { burst.dispose(); return; }
      burst.scaling.addInPlace(new BABYLON.Vector3(0.2, 0.2, 0.2));
      mat.alpha *= 0.9;
    });
  }

  function energyBlast() {
    const origin = player.position.add(new BABYLON.Vector3(0, 0.2, 0));
    const blast = BABYLON.MeshBuilder.CreateSphere('Blast', { diameter: 0.2 }, scene);
    const mat = new BABYLON.StandardMaterial('BlastMat', scene);
    mat.emissiveColor = new BABYLON.Color3(0.6, 0.4, 1.0);
    blast.material = mat;
    blast.position.copyFrom(origin);
    const dir = camera.getDirection(BABYLON.Vector3.Forward()).normalize();
    const speed = ultraMode ? 100 : 50;
    let life = 120;
    if (window.SOL_Audio) window.SOL_Audio.PlayImpact({ freq: 90 });
    scene.onBeforeRenderObservable.add(() => {
      if (life-- <= 0) { blast.dispose(); return; }
      blast.position.addInPlace(dir.scale(engine.getDeltaTime() / 1000 * speed));
      // simple trail
      if (life % 6 === 0) {
        const trail = BABYLON.MeshBuilder.CreateSphere('Trail', { diameter: 0.08 }, scene);
        const tmat = new BABYLON.StandardMaterial('TrailMat', scene);
        tmat.emissiveColor = new BABYLON.Color3(0.5, 0.3, 1.0);
        tmat.alpha = 0.6;
        trail.material = tmat;
        trail.position.copyFrom(blast.position);
        let tlife = 15;
        scene.onBeforeRenderObservable.add(() => {
          if (tlife-- <= 0) { trail.dispose(); return; }
          trail.scaling.scaleInPlace(0.95);
          tmat.alpha *= 0.9;
        });
      }
    });
    state.blasts += 1;
  }

  function updateMovement(deltaSec) {
    const forward = camera.getDirection(BABYLON.Vector3.Forward());
    const right = camera.getDirection(BABYLON.Vector3.Right());
    const up = BABYLON.Vector3.Up();

    let accel = 20;
    if (currentMode === FlightMode.JET) accel = 60;
    if (currentMode === FlightMode.PRECISION || keys.alt) accel = 5;
    if (ultraMode) accel *= 2.0;
    if (supermanMode) accel *= 1.5;

    let vel = state.velocity.clone();
    if (keys.w) vel.addInPlace(forward.scale(accel * deltaSec));
    if (keys.s) vel.addInPlace(forward.scale(-accel * deltaSec));
    if (keys.d) vel.addInPlace(right.scale(accel * deltaSec));
    if (keys.a) vel.addInPlace(right.scale(-accel * deltaSec));
    if (keys.space) vel.addInPlace(up.scale(accel * deltaSec));
    if (keys.shift) vel.addInPlace(up.scale(-accel * deltaSec));

    const capBase = state.speedCap * (supermanMode ? 1.5 : 1);
    const cap = ultraMode ? capBase * 2 : capBase;
    if (vel.length() > cap) {
      vel = vel.normalize().scale(cap);
    }
    state.velocity.copyFrom(vel);
    player.position.addInPlace(state.velocity.scale(deltaSec));
    camera.position.copyFrom(player.position.add(new BABYLON.Vector3(0, 1.6, -1.5)));

    // Q/E yaw rotation
    const yawSpeed = (ultraMode ? 2.0 : 1.0) * (supermanMode ? 1.25 : 1.0) * 1.5; // rad/sec
    if (keys.q) camera.rotation.y -= yawSpeed * deltaSec;
    if (keys.e) camera.rotation.y += yawSpeed * deltaSec;

    state.position.copyFrom(player.position);
    state.thrustPct = clamp((vel.length() / cap) * 100, 0, 100);
    state.energy = clamp(state.energy + (ultraMode ? -5 : -2) * deltaSec + 3 * deltaSec, 0, 100);

    // Update player trail
    trailPoints.push(player.position.clone());
    if (trailPoints.length > trailMaxPoints) trailPoints.shift();
    if (trailLines === null) {
      trailLines = BABYLON.MeshBuilder.CreateLines('PlayerTrail', { points: trailPoints, updatable: true }, scene);
      trailLines.color = new BABYLON.Color3(0.6, 0.7, 1.0);
    } else {
      BABYLON.MeshBuilder.CreateLines('PlayerTrail', { points: trailPoints, instance: trailLines }, scene);
    }

    // Spawn and update speed lines when moving fast
    const speedMag = state.velocity.length();
    if (speedMag > 10) {
      // Spawn a few based on speed
      const toSpawn = Math.min(3, 1 + Math.floor(speedMag / 20));
      for (let i = 0; i < toSpawn; i += 1) spawnSpeedLine(speedMag);
    }
    for (let i = speedLines.length - 1; i >= 0; i -= 1) {
      const sl = speedLines[i];
      sl.life -= 1;
      // Move towards camera a bit to simulate streaks
      const fwd = camera.getDirection(BABYLON.Vector3.Forward()).normalize();
      sl.mesh.position.addInPlace(fwd.scale(0.06 * sl.speedFactor));
      sl.mesh.scaling.z = 0.8 + (sl.speedFactor - 0.5) * 0.8;
      sl.mat.alpha *= 0.94;
      if (sl.life <= 0) {
        sl.mesh.dispose();
        speedLines.splice(i, 1);
      }
    }
  }

  function updateHUD(deltaSec) {
    if (window.SOL_HUD) {
      window.SOL_HUD.Update({
        mode: currentMode,
        position: state.position,
        velocity: state.velocity,
        thrustPct: state.thrustPct,
        energy: state.energy,
        ultra: ultraMode || supermanMode,
        stats: { teleports: state.teleports, blasts: state.blasts },
        altitude: state.position.y
      });
    }
    // Visual aura intensity
    glow.intensity = (ultraMode ? 0.8 : 0) + (supermanMode ? 0.3 : 0);
    player.material.emissiveColor = new BABYLON.Color3(
      0.3 + (ultraMode ? 0.4 : 0) + (supermanMode ? 0.2 : 0),
      0.5 + (ultraMode ? 0.2 : 0),
      1.0
    );
  }

  let last = performance.now();
  engine.runRenderLoop(() => {
    const now = performance.now();
    const deltaSec = (now - last) / 1000;
    last = now;
    updateMovement(deltaSec);
    updateHUD(deltaSec);
    scene.render();
  });

  window.addEventListener('resize', () => engine.resize());

  // Pointer lock for mouse look
  const centerPrompt = document.getElementById('centerPrompt');
  canvas.addEventListener('click', () => {
    if (canvas.requestPointerLock) canvas.requestPointerLock();
  });
  document.addEventListener('pointerlockchange', () => {
    const locked = document.pointerLockElement === canvas;
    if (centerPrompt) centerPrompt.style.display = locked ? 'none' : 'block';
  });
})();
