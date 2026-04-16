class TileManager {
  static TILE_LENGTH   = 24;
  static TILE_WIDTH    = 10;
  static VISIBLE_COUNT = 10;
  static LANES         = [-3, 0, 3];

  static OBSTACLE_PATTERNS = [
    [],
    [0],
    [2],
    [1],
    [0, 2],
    [0, 1],
    [1, 2],
  ];

  constructor(scene, powerUpManager) {
    this.scene      = scene;
    this.tiles      = [];
    this.obstacles  = [];
    this.tileIndex  = 0;
    this.difficulty = 0;

    this._createMaterials();
    this._spawnInitialTiles();
    this.powerUpManager = powerUpManager;
  }

  _createMaterials() {
    this.groundMat = new BABYLON.StandardMaterial('groundMat', this.scene);
    this.groundMat.diffuseColor  = new BABYLON.Color3(0.2, 0.2, 0.35);
    this.groundMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.2);

    this.edgeMat = new BABYLON.StandardMaterial('edgeMat', this.scene);
    this.edgeMat.diffuseColor  = new BABYLON.Color3(0.0, 0.8, 1.0);
    this.edgeMat.emissiveColor = new BABYLON.Color3(0.0, 0.4, 0.6);

    this.obstacleMat = new BABYLON.StandardMaterial('obstacleMat', this.scene);
    this.obstacleMat.diffuseColor  = new BABYLON.Color3(1.0, 0.0, 0.5);
    this.obstacleMat.emissiveColor = new BABYLON.Color3(0.5, 0.0, 0.2);

    this.coinMat = new BABYLON.StandardMaterial('coinMat', this.scene);
    this.coinMat.diffuseColor  = new BABYLON.Color3(1, 0.85, 0);
    this.coinMat.emissiveColor = new BABYLON.Color3(0.4, 0.3, 0);

    this.wallMat = new BABYLON.StandardMaterial('wallMat', this.scene);
    this.wallMat.diffuseColor  = new BABYLON.Color3(0.83, 0.33, 0.49);
    this.wallMat.emissiveColor = new BABYLON.Color3(0.3, 0.05, 0.15);

    this.barrierMat = new BABYLON.StandardMaterial('barrierMat', this.scene);
    this.barrierMat.diffuseColor  = new BABYLON.Color3(0.2, 0.54, 0.87);
    this.barrierMat.emissiveColor = new BABYLON.Color3(0.05, 0.2, 0.4);

    this.tunnelMat = new BABYLON.StandardMaterial('tunnelMat', this.scene);
    this.tunnelMat.diffuseColor  = new BABYLON.Color3(0.94, 0.62, 0.15);
    this.tunnelMat.emissiveColor = new BABYLON.Color3(0.4, 0.2, 0.0);
    }

  _spawnInitialTiles() {
    for (let i = 0; i < TileManager.VISIBLE_COUNT; i++) {
      this._spawnTile();
    }
  }

  _spawnTile() {
    const z = this.tiles.length === 0
      ? -TileManager.TILE_LENGTH
      : this.tiles[this.tiles.length - 1].ground.position.z + TileManager.TILE_LENGTH;

    const ground = BABYLON.MeshBuilder.CreateBox('tile_' + this.tileIndex, {
      width:  TileManager.TILE_WIDTH,
      height: 0.5,
      depth:  TileManager.TILE_LENGTH
    }, this.scene);
    ground.position.set(0, 0, z);
    ground.material = this.groundMat;
    ground.metadata = { groundY: 1.25 }; // hauteur du dessus du sol

    const leftEdge = BABYLON.MeshBuilder.CreateBox('edge_l_' + this.tileIndex, {
      width: 0.4, height: 0.8, depth: TileManager.TILE_LENGTH
    }, this.scene);
    leftEdge.position.set(-TileManager.TILE_WIDTH / 2 - 0.2, 0.4, z);
    leftEdge.material = this.edgeMat;

    const rightEdge = leftEdge.clone('edge_r_' + this.tileIndex);
    rightEdge.position.x = TileManager.TILE_WIDTH / 2 + 0.2;

    const tileGroup = { ground, leftEdge, rightEdge, obstacles: [], coins: [] };

    if (this.tileIndex > 2) {
      this._spawnObstacles(tileGroup, z);
      this._spawnCoins(tileGroup, z);
    }

    if (this.powerUpManager) {
      this.powerUpManager.spawnOn(z, TileManager.LANES);
    }

    this.tiles.push(tileGroup);
    this.tileIndex++;
  }

  _spawnObstacles(tileGroup, z) {
  const maxPattern = Math.min(
    TileManager.OBSTACLE_PATTERNS.length,
    2 + Math.floor(this.difficulty / 200)
  );
  const pattern = TileManager.OBSTACLE_PATTERNS[
    Math.floor(Math.random() * maxPattern)
  ];

  pattern.forEach(laneIdx => {
    const offsetZ = (Math.random() - 0.5) * (TileManager.TILE_LENGTH * 0.5);
    const x       = TileManager.LANES[laneIdx];
    const type    = Math.floor(Math.random() * 3); // 0=mur 1=barrière 2=tunnel

    if (type === 0) {
      // MUR ROSE — changer de lane
      const obs = BABYLON.MeshBuilder.CreateBox('obs_' + Math.random(), {
        width: 1.8, height: 2.8, depth: 1.0
      }, this.scene);
      obs.position.set(x, 1.6, z + offsetZ);
      obs.material = this.wallMat;
      obs.metadata = { type: 'wall' };
      tileGroup.obstacles.push(obs);
      this.obstacles.push(obs);

    } else if (type === 1) {
      // BARRIÈRE BLEUE — sauter par-dessus
      const obs = BABYLON.MeshBuilder.CreateBox('obs_' + Math.random(), {
        width: 1.8, height: 0.5, depth: 1.0
      }, this.scene);
      obs.position.set(x, 0.5, z + offsetZ);
      obs.material = this.barrierMat;
      obs.metadata = { type: 'barrier' };
      tileGroup.obstacles.push(obs);
      this.obstacles.push(obs);

    } else {
      // TUNNEL ORANGE — slider en dessous
      // plafond
      const roof = BABYLON.MeshBuilder.CreateBox('obs_' + Math.random(), {
        width: 1.8, height: 0.4, depth: 1.2
      }, this.scene);
      roof.position.set(x, 2.4, z + offsetZ);
      roof.material = this.tunnelMat;
      roof.metadata = { type: 'tunnel' };

      // pilier gauche
      const pilL = BABYLON.MeshBuilder.CreateBox('obs_' + Math.random(), {
        width: 0.3, height: 1.5, depth: 1.2
      }, this.scene);
      pilL.position.set(x - 0.75, 1.4, z + offsetZ);
      pilL.material = this.tunnelMat;
      pilL.metadata = { type: 'tunnel' };

      // pilier droit
      const pilR = pilL.clone('obs_' + Math.random());
      pilR.position.x = x + 0.75;
      pilR.material = this.tunnelMat;
      pilR.metadata = { type: 'tunnel' };

      tileGroup.obstacles.push(roof, pilL, pilR);
      this.obstacles.push(roof, pilL, pilR);
    }
  });
}

  _spawnCoins(tileGroup, z) {
    const lane = Math.floor(Math.random() * 3);
    for (let i = 0; i < 3; i++) {
      const coin = BABYLON.MeshBuilder.CreateSphere('coin', { diameter: 0.4 }, this.scene);
      coin.position.set(TileManager.LANES[lane], 1.5, z + i * 2 - 2);
      coin.material = this.coinMat;
      tileGroup.coins.push(coin);
    }
  }

  checkCoins(player, onCollect) {
    const pPos = player.getPosition();
    let collected = 0;
    this.tiles.forEach(tile => {
      tile.coins = tile.coins.filter(coin => {
        if (BABYLON.Vector3.Distance(pPos, coin.position) < 1.0) {
          coin.dispose();
          collected++;
          return false;
        }
        return true;
      });
    });
    if (collected > 0) onCollect(collected);
  }

  getTileUnderPlayer(player) {
    const pPos = player.getPosition();
    return this.tiles.find(tile => {
      const z = tile.ground.position.z;
      return Math.abs(z - pPos.z) < TileManager.TILE_LENGTH / 2;
    }) || null;
  }

  update(speed, score) {
    this.difficulty = score;

    this.tiles.forEach(tile => {
      tile.ground.position.z   -= speed;
      tile.leftEdge.position.z -= speed;
      tile.rightEdge.position.z -= speed;
      tile.obstacles.forEach(obs  => obs.position.z  -= speed);
      tile.coins.forEach(coin     => coin.position.z -= speed);
    });

    const firstTile = this.tiles[0];
    const DESPAWN_Z = -TileManager.TILE_LENGTH * 1.5;

    if (firstTile && firstTile.ground.position.z < DESPAWN_Z) {
      this._destroyTile(this.tiles.shift());
      this._spawnTile();
    }
  }

  _destroyTile(tile) {
    tile.ground.dispose();
    tile.leftEdge.dispose();
    tile.rightEdge.dispose();
    tile.obstacles.forEach(obs => {
      const idx = this.obstacles.indexOf(obs);
      if (idx !== -1) this.obstacles.splice(idx, 1);
      obs.dispose();
    });
    tile.coins.forEach(coin => coin.dispose());
  }

  checkCollision(player) {
    const pPos    = player.getPosition();
    const sliding = player.isSliding;
    const pY      = pPos.y;

    for (const obs of this.obstacles) {
        const dx   = Math.abs(pPos.x - obs.position.x);
        const dz   = Math.abs(pPos.z - obs.position.z);
        const type = obs.metadata?.type;

        if (dx > 1.3 || dz > 1.4) continue;

        if (type === 'barrier') {
        // la barrière est basse (Y=0.5) — le saut passe par-dessus
        if (pY > 1.1) continue;
        }

        if (type === 'tunnel') {
        // le tunnel laisse passer si on slide (joueur aplati à Y~0.6)
        if (sliding && pY < 1.0) continue;
        }

        return true;
    }
    return false;
}

  reset() {
    [...this.tiles].forEach(tile => this._destroyTile(tile));
    this.tiles      = [];
    this.obstacles  = [];
    this.tileIndex  = 0;
    this.difficulty = 0;
    this._spawnInitialTiles();
  }
}