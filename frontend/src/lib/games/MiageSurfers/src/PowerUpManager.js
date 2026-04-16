class PowerUpManager {
  static TYPES = ['magnet', 'shield', 'speed'];
  static DURATION = { magnet: 8000, shield: 5000, speed: 4000 };
  static COLORS = {
    magnet: new BABYLON.Color3(1.0, 0.85, 0.0),   // doré
    shield: new BABYLON.Color3(0.0, 0.8, 1.0),    // cyan
    speed:  new BABYLON.Color3(0.6, 0.0, 1.0),    // violet
  };
  static EMISSIVE = {
    magnet: new BABYLON.Color3(0.4, 0.3, 0.0),
    shield: new BABYLON.Color3(0.0, 0.3, 0.5),
    speed:  new BABYLON.Color3(0.2, 0.0, 0.5),
  };

  constructor(scene) {
    this.scene    = scene;
    this.spawned  = [];  // { mesh, type }
    this.active   = {};  // { magnet: false, shield: false, speed: false }
    this.timers   = {};
    this._createMaterials();
  }

  _createMaterials() {
    this.mats = {};
    for (const type of PowerUpManager.TYPES) {
      const mat = new BABYLON.StandardMaterial('pu_' + type, this.scene);
      mat.diffuseColor  = PowerUpManager.COLORS[type];
      mat.emissiveColor = PowerUpManager.EMISSIVE[type];
      this.mats[type]   = mat;
    }
  }

  // Appelé par TileManager pour spawner un power-up sur une tuile
  spawnOn(z, lanes) {
    if (Math.random() > 0.25) return; // 25% de chance par tuile

    const type = PowerUpManager.TYPES[
      Math.floor(Math.random() * PowerUpManager.TYPES.length)
    ];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    // Forme différente selon le type
    let mesh;
    if (type === 'magnet') {
      mesh = BABYLON.MeshBuilder.CreateBox('pu_magnet', { size: 0.7 }, this.scene);
    } else if (type === 'shield') {
      mesh = BABYLON.MeshBuilder.CreateSphere('pu_shield', { diameter: 0.8 }, this.scene);
    } else {
      mesh = BABYLON.MeshBuilder.CreateCylinder('pu_speed', {
        diameter: 0.6, height: 0.9, tessellation: 6
      }, this.scene);
    }

    mesh.position.set(lane, 2.0, z + (Math.random() - 0.5) * 8);
    mesh.material = this.mats[type];
    this.spawned.push({ mesh, type });
  }

  // Appelé à chaque frame
  update(speed, player, game) {
    const pPos = player.getPosition();

    // Déplacer les power-ups
    this.spawned.forEach(pu => {
      pu.mesh.position.z  -= speed;
      pu.mesh.rotation.y  += 0.04; // rotation continue
      pu.mesh.position.y   = 2.0 + Math.sin(Date.now() * 0.003) * 0.15; // flottement
    });

    // Détecter la collecte
    this.spawned = this.spawned.filter(pu => {
      const dist = BABYLON.Vector3.Distance(pPos, pu.mesh.position);
      if (dist < 1.2) {
        this._activate(pu.type, game);
        pu.mesh.dispose();
        return false;
      }
      // Supprimer si trop loin derrière
      if (pu.mesh.position.z < -20) {
        pu.mesh.dispose();
        return false;
      }
      return true;
    });

    // Effet aimant : attirer les pièces proches
    if (this.active.magnet) {
      game.tileManager.tiles.forEach(tile => {
        tile.coins.forEach(coin => {
          const d = BABYLON.Vector3.Distance(pPos, coin.position);
          if (d < 6) {
            const dir = pPos.subtract(coin.position).normalize();
            coin.position.addInPlace(dir.scale(0.15));
          }
        });
      });
    }
  }

  _activate(type, game) {
    // Annuler le timer précédent si déjà actif
    if (this.timers[type]) clearTimeout(this.timers[type]);

    this.active[type] = true;
    game.onPowerUpStart(type);

    this.timers[type] = setTimeout(() => {
      this.active[type] = false;
      game.onPowerUpEnd(type);
    }, PowerUpManager.DURATION[type]);
  }

  isActive(type) {
    return !!this.active[type];
  }

  reset() {
    this.spawned.forEach(pu => pu.mesh.dispose());
    this.spawned = {};
    this.spawned = [];
    this.active  = {};
    for (const t of this.timers) clearTimeout(t);
    this.timers  = {};
  }
}