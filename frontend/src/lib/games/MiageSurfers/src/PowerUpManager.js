<<<<<<< HEAD
import * as BABYLON from "babylonjs";

export class PowerUpManager {
  static TYPES = ["magnet", "shield", "speed"];
  static DURATION = { magnet: 8000, shield: 5000, speed: 4000 };
  static COLORS = {
    magnet: new BABYLON.Color3(1.0, 0.85, 0.0), // doré
    shield: new BABYLON.Color3(0.0, 0.8, 1.0), // cyan
    speed: new BABYLON.Color3(0.6, 0.0, 1.0), // violet
=======
class PowerUpManager {
  static TYPES    = ['magnet', 'shield', 'speed'];
  static DURATION = { magnet: 8000, shield: 5000, speed: 4000 };
  static COLORS   = {
    magnet: new BABYLON.Color3(1.0, 0.85, 0.0),
    shield: new BABYLON.Color3(0.0, 0.8,  1.0),
    speed:  new BABYLON.Color3(0.6, 0.0,  1.0),
>>>>>>> c40e69e (walk on trains feature)
  };
  static EMISSIVE = {
    magnet: new BABYLON.Color3(0.4, 0.3, 0.0),
    shield: new BABYLON.Color3(0.0, 0.3, 0.5),
    speed: new BABYLON.Color3(0.2, 0.0, 0.5),
  };

  constructor(scene) {
<<<<<<< HEAD
    this.scene = scene;
    this.spawned = []; // { mesh, type }
    this.active = {}; // { magnet: false, shield: false, speed: false }
    this.timers = {};
=======
    this.scene   = scene;
    this.spawned = [];
    this.active  = { magnet: false, shield: false, speed: false };
    this.timers  = {};
>>>>>>> c40e69e (walk on trains feature)
    this._createMaterials();
  }

  _createMaterials() {
    this.mats = {};
    for (const type of PowerUpManager.TYPES) {
      const mat = new BABYLON.StandardMaterial("pu_" + type, this.scene);
      mat.diffuseColor = PowerUpManager.COLORS[type];
      mat.emissiveColor = PowerUpManager.EMISSIVE[type];
      this.mats[type] = mat;
    }
  }

  spawnOn(z, lanes) {
<<<<<<< HEAD
    if (Math.random() > 0.25) return; // 25% de chance par tuile

    const type =
      PowerUpManager.TYPES[
        Math.floor(Math.random() * PowerUpManager.TYPES.length)
      ];
=======
    if (Math.random() > 0.25) return;
    const type = PowerUpManager.TYPES[Math.floor(Math.random() * PowerUpManager.TYPES.length)];
>>>>>>> c40e69e (walk on trains feature)
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    let mesh;
    if (type === "magnet") {
      mesh = BABYLON.MeshBuilder.CreateBox(
        "pu_magnet",
        { size: 0.7 },
        this.scene,
      );
    } else if (type === "shield") {
      mesh = BABYLON.MeshBuilder.CreateSphere(
        "pu_shield",
        { diameter: 0.8 },
        this.scene,
      );
    } else {
      mesh = BABYLON.MeshBuilder.CreateCylinder(
        "pu_speed",
        {
          diameter: 0.6,
          height: 0.9,
          tessellation: 6,
        },
        this.scene,
      );
    }
    mesh.position.set(lane, 2.0, z + (Math.random() - 0.5) * 8);
    mesh.material = this.mats[type];
    this.spawned.push({ mesh, type });
  }

  update(speed, player, game) {
    const pPos = player.getPosition();

<<<<<<< HEAD
    // Déplacer les power-ups
    this.spawned.forEach((pu) => {
      pu.mesh.position.z -= speed;
      pu.mesh.rotation.y += 0.04; // rotation continue
      pu.mesh.position.y = 2.0 + Math.sin(Date.now() * 0.003) * 0.15; // flottement
    });

    // Détecter la collecte
    this.spawned = this.spawned.filter((pu) => {
=======
    this.spawned.forEach(pu => {
      pu.mesh.position.z -= speed;
      pu.mesh.rotation.y += 0.04;
      pu.mesh.position.y  = 2.0 + Math.sin(Date.now() * 0.003) * 0.15;
    });

    this.spawned = this.spawned.filter(pu => {
>>>>>>> c40e69e (walk on trains feature)
      const dist = BABYLON.Vector3.Distance(pPos, pu.mesh.position);
      if (dist < 1.2) {
        this._activate(pu.type, game);
        pu.mesh.dispose();
        return false;
      }
      if (pu.mesh.position.z < -20) {
        pu.mesh.dispose();
        return false;
      }
      return true;
    });

    if (this.active.magnet) {
      game.tileManager.tiles.forEach((tile) => {
        tile.coins.forEach((coin) => {
          const d = BABYLON.Vector3.Distance(pPos, coin.position);
          if (d < 6) {
            const dir = pPos.subtract(coin.position).normalize();
            coin.position.addInPlace(dir.scale(0.15));
          }
        });
      });
    }

    // Mettre à jour l'affichage HUD des powerups actifs
    this._updateHUD();
  }

  _activate(type, game) {
    const wasActive = this.active[type];

    // Annuler le timer existant pour ce type (recharge la durée)
    if (this.timers[type]) clearTimeout(this.timers[type]);

    this.active[type] = true;
    this._game = game; // garder la référence pour _updateHUD

    // Effets visuels au démarrage (seulement si pas déjà actif)
    if (!wasActive) {
      if (type === 'shield') {
        game.player.mesh.material.emissiveColor = new BABYLON.Color3(0.0, 0.5, 1.0);
      }
      if (type === 'speed') {
        game.speed *= 2;
        game.scene.clearColor = new BABYLON.Color4(0.15, 0.0, 0.3, 1);
      }
    }

    this.timers[type] = setTimeout(() => {
      this.active[type] = false;
      delete this.timers[type];

      // Effets visuels à la fin
      if (type === 'shield') {
        game.player.mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
      }
      if (type === 'speed') {
        game.speed = game.constructor.INITIAL_SPEED;
        game.scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1);
      }

      this._updateHUD();
    }, PowerUpManager.DURATION[type]);
  }

  // Affiche tous les powerups actifs simultanément
  _updateHUD() {
    const icons = { magnet: '🧲', shield: '🛡️', speed: '⚡' };
    const actives = PowerUpManager.TYPES.filter(t => this.active[t]);
    const display = document.getElementById('powerupDisplay');
    if (actives.length > 0) {
      display.textContent = actives.map(t => icons[t]).join(' ');
      display.style.opacity = '1';
    } else {
      display.style.opacity = '0';
    }
  }

  isActive(type) {
    return !!this.active[type];
  }

  reset() {
<<<<<<< HEAD
    this.spawned.forEach((pu) => pu.mesh.dispose());
    this.spawned = {};
    this.spawned = [];
    this.active = {};
    for (const t of this.timers) clearTimeout(t);
    this.timers = {};
=======
    this.spawned.forEach(pu => pu.mesh.dispose());
    this.spawned = [];
    this.active  = { magnet: false, shield: false, speed: false };
    for (const timerId of Object.values(this.timers)) clearTimeout(timerId);
    this.timers  = {};
    const display = document.getElementById('powerupDisplay');
    if (display) display.style.opacity = '0';
>>>>>>> c40e69e (walk on trains feature)
  }
}
