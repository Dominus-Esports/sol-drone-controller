(function() {
  /**
   * SOL_World: simple, meter-based chunked world streaming with optional floating origin.
   * - Units are meters by default (1 unit == 1 meter).
   * - Tiles are flat ground meshes generated procedurally.
   * - Tiles load/unload around the player within a tile radius.
   * - Floating origin recenters the scene when the player wanders far to preserve precision.
   */
  class SOL_World {
    constructor(scene, options = {}) {
      this.scene = scene;
      const cfg = window.SOL_Config?.world || {};
      this.unitsPerMeter = Number(cfg.unitsPerMeter ?? options.unitsPerMeter ?? 1);
      this.tileSizeMeters = Number(cfg.tileSizeMeters ?? options.tileSizeMeters ?? 200);
      this.renderRadiusTiles = Number(cfg.renderRadiusTiles ?? options.renderRadiusTiles ?? 3);
      this.enableFloatingOrigin = Boolean(cfg.floatingOrigin ?? options.floatingOrigin ?? true);
      this.recenterThresholdMeters = Number(cfg.recenterThresholdMeters ?? options.recenterThresholdMeters ?? 500);

      // Transform root for all world content (terrain, effects tied to world space)
      this.root = new BABYLON.TransformNode('SOL_WorldRoot', scene);

      // Accumulated origin shift in meters (XZ only)
      this.accumulatedOrigin = new BABYLON.Vector3(0, 0, 0);

      // Active tile meshes keyed by "x:z"
      this.tiles = new Map();
    }

    getRoot() {
      return this.root;
    }

    // Convert a world-space position (meters) to tile indices
    worldToTileIndices(worldX, worldZ) {
      const size = this.tileSizeMeters;
      const tx = Math.floor(worldX / size);
      const tz = Math.floor(worldZ / size);
      return { tx, tz };
    }

    tileKey(tx, tz) {
      return `${tx}:${tz}`;
    }

    // Returns the local position (relative to current origin) for the center of a tile
    tileCenterLocal(tx, tz) {
      const size = this.tileSizeMeters;
      const centerX = tx * size + size * 0.5;
      const centerZ = tz * size + size * 0.5;
      // Convert to local by subtracting accumulated origin
      return new BABYLON.Vector3(
        centerX - this.accumulatedOrigin.x,
        0,
        centerZ - this.accumulatedOrigin.z
      );
    }

    createTile(tx, tz) {
      const size = this.tileSizeMeters;
      const key = this.tileKey(tx, tz);
      if (this.tiles.has(key)) return;

      const name = `Tile_${tx}_${tz}`;
      const ground = BABYLON.MeshBuilder.CreateGround(name, { width: size, height: size, subdivisions: 1 }, this.scene);
      ground.parent = this.root;
      ground.position = this.tileCenterLocal(tx, tz);

      // Prefer Babylon GridMaterial if available; fallback to dynamic texture
      if (BABYLON.GridMaterial) {
        const gmat = new BABYLON.GridMaterial(`${name}_GridMat`, this.scene);
        gmat.majorUnitFrequency = 10; // grid every 10 meters
        gmat.minorUnitVisibility = 0.25;
        gmat.gridRatio = 1; // 1 unit == 1 meter
        gmat.mainColor = new BABYLON.Color3(0.07, 0.1, 0.18);
        gmat.lineColor = new BABYLON.Color3(0.12, 0.2, 0.35);
        ground.material = gmat;
      } else {
        const mat = new BABYLON.StandardMaterial(`${name}_Mat`, this.scene);
        const texSize = 1024;
        const tex = new BABYLON.DynamicTexture(`${name}_Tex`, { width: texSize, height: texSize }, this.scene, true);
        const ctx = tex.getContext();
        ctx.fillStyle = '#0f1526';
        ctx.fillRect(0, 0, texSize, texSize);
        const metersPerCell = 10;
        const cells = Math.floor(size / metersPerCell);
        ctx.strokeStyle = '#1a2644';
        ctx.lineWidth = 1;
        for (let i = 0; i <= cells; i += 1) {
          const pos = Math.floor((i / cells) * texSize);
          ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, texSize); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(texSize, pos); ctx.stroke();
        }
        ctx.font = '28px Arial';
        ctx.fillStyle = '#b8c7ff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`(${tx}, ${tz})`, texSize * 0.5, texSize * 0.5);
        tex.update(false);
        mat.diffuseTexture = tex;
        mat.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.material = mat;
      }

      this.tiles.set(key, ground);
    }

    destroyTile(tx, tz) {
      const key = this.tileKey(tx, tz);
      const mesh = this.tiles.get(key);
      if (mesh) {
        mesh.dispose();
        this.tiles.delete(key);
      }
    }

    // Remove tiles outside of the active radius
    cullTiles(centerTx, centerTz) {
      const radius = this.renderRadiusTiles;
      for (const [key, mesh] of this.tiles.entries()) {
        const [sx, sz] = key.split(':').map(Number);
        if (Math.abs(sx - centerTx) > radius || Math.abs(sz - centerTz) > radius) {
          mesh.dispose();
          this.tiles.delete(key);
        }
      }
    }

    // Optional floating origin: recenters scene to keep player near (0,0)
    maybeRecenter(playerLocal) {
      if (!this.enableFloatingOrigin) return;
      const dx = playerLocal.x;
      const dz = playerLocal.z;
      const dist2 = dx * dx + dz * dz;
      const thresh = this.recenterThresholdMeters;
      if (dist2 < thresh * thresh) return;

      // Shift accumulated origin by player's local offset
      this.accumulatedOrigin.x += dx;
      this.accumulatedOrigin.z += dz;

      // Move all world content opposite to keep player near origin
      this.root.position.x -= dx;
      this.root.position.z -= dz;
    }

    // Update should be called once per frame with the player's local position
    update(playerLocal, deltaSec) {
      // Floating origin first (keeps numbers small)
      this.maybeRecenter(playerLocal);

      // Compute player's global meters (based on accumulated origin + local)
      const globalX = this.accumulatedOrigin.x + playerLocal.x;
      const globalZ = this.accumulatedOrigin.z + playerLocal.z;
      const { tx, tz } = this.worldToTileIndices(globalX, globalZ);

      // Ensure tiles in radius exist
      const radius = this.renderRadiusTiles;
      for (let z = tz - radius; z <= tz + radius; z += 1) {
        for (let x = tx - radius; x <= tx + radius; x += 1) {
          this.createTile(x, z);
        }
      }
      // Cull tiles out of range
      this.cullTiles(tx, tz);
    }
  }

  window.SOL_World = SOL_World;
})();
