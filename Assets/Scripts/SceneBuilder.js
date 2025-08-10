(function(){
  async function createChessboardGround(scene) {
    const size = 100;
    const ground = BABYLON.MeshBuilder.CreateGround('ChessGround', { width: size, height: size, subdivisions: 2 }, scene);
    const mat = new BABYLON.StandardMaterial('ChessMat', scene);
    const tex = new BABYLON.DynamicTexture('ChessTex', { width: 1024, height: 1024 }, scene, true);
    const ctx = tex.getContext();
    const cells = 16;
    const cell = 1024 / cells;
    for (let y = 0; y < cells; y += 1) {
      for (let x = 0; x < cells; x += 1) {
        const dark = (x + y) % 2 === 0;
        ctx.fillStyle = dark ? '#0e1422' : '#1c2740';
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    // Grid coordinates like chess (A1..H8) but extended
    ctx.font = '32px Arial';
    ctx.fillStyle = '#b8c7ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let y = 0; y < cells; y += 1) {
      for (let x = 0; x < cells; x += 1) {
        const label = letters[x] + String(y + 1);
        ctx.fillText(label, x * cell + cell * 0.5, y * cell + cell * 0.5);
      }
    }
    tex.update(false);
    mat.diffuseTexture = tex;
    mat.specularColor = new BABYLON.Color3(0,0,0);
    ground.material = mat;
    return ground;
  }

  async function enableHavok(scene) {
    if (!window.HK) return null;
    const havokInstance = await HK();
    const physics = new BABYLON.HavokPlugin(true, havokInstance);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physics);
    return physics;
  }

  window.SOL_BuildSceneExtras = async function(scene) {
    await enableHavok(scene);
    await createChessboardGround(scene);
  };
})();


