import * as BABYLON from "babylonjs";
import { InputManager } from "./InputManager.js";
import { Player } from "./Player.js";
import { PowerUpManager } from "./PowerUpManager.js";
import { TileManager } from "./TileManager.js";

/**
 * Game
 * Classe principale qui orchestre tous les systèmes.
 * Gère la boucle de jeu, les états et le score.
 *
 * États possibles :
 *   IDLE      → affiché au lancement, avant que le joueur commence
 *   PLAYING   → jeu en cours
 *   GAMEOVER  → collision détectée
 */

export class Game {
  static INITIAL_SPEED = 0.15;
  static SPEED_INCREMENT = 0.000035; // accélération progressive par frame

  constructor(canvas, { onHudUpdate, onGameOver, onPowerUpChange } = {}) {
    this._onHudUpdate = onHudUpdate || (() => {});
    this._onGameOver = onGameOver || (() => {});
    this._onPowerUpChange = onPowerUpChange || (() => {});

    this.canvas = canvas;
    this.state = "IDLE";
    this.score = 0;
    this.speed = Game.INITIAL_SPEED;

    this._initEngine();
    this._initScene();
    this._initSystems();
    this._initCamera();
    this._initLights();

    // Lance le rendu (même à l'état IDLE pour voir la scène)
    this.engine.runRenderLoop(() => this._loop());

    // Redimensionnement de la fenêtre
    this._resizeHandler = () => this.engine.resize();
    window.addEventListener("resize", this._resizeHandler);
  }

  // ─────────────────────────────────────────
  // Initialisation
  // ─────────────────────────────────────────

  _initEngine() {
    this.engine = new BABYLON.Engine(this.canvas, true);
  }

  _initScene() {
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.008;
    this.scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1);
    this.scene.fogColor = new BABYLON.Color3(0.02, 0.02, 0.05);
  }

  _initSystems() {
    this.input = new InputManager();
    this.player = new Player(this.scene);
    this.powerUpManager = new PowerUpManager(this.scene);
    this.tileManager = new TileManager(this.scene, this.powerUpManager);
  }

  _initCamera() {
    // Caméra fixe derrière le joueur
    this.camera = new BABYLON.FreeCamera(
      "camera",
      new BABYLON.Vector3(0, 6, -10),
      this.scene,
    );
    this.camera.setTarget(new BABYLON.Vector3(0, 0, 8));
  }

  _initLights() {
    // Lumière ambiante douce
    const ambient = new BABYLON.HemisphericLight(
      "ambient",
      new BABYLON.Vector3(0, 1, 0),
      this.scene,
    );
    ambient.intensity = 0.5;
    ambient.groundColor = new BABYLON.Color3(0.1, 0.1, 0.15);

    // Lumière directionnelle pour les ombres
    const sun = new BABYLON.DirectionalLight(
      "sun",
      new BABYLON.Vector3(-0.5, -1, 0.5),
      this.scene,
    );
    sun.intensity = 0.8;
  }

  // ─────────────────────────────────────────
  // Boucle de jeu principale
  // ─────────────────────────────────────────

  _loop() {
    if (this.state === "PLAYING") {
      // Augmenter la vitesse progressivement
      this.speed += Game.SPEED_INCREMENT;

      // Mettre à jour les systèmes
      this.tileManager.update(this.speed, this.score);
      this.powerUpManager.update(this.speed, this.player, this);
<<<<<<< HEAD
      this.tileManager.checkCoins(this.player, (count) => {
        this.score += count * 50;
      });
=======
      this.tileManager.checkCoins(this.player, (count) => { this.score += count * 50; });

      // IMPORTANT : Mettre à jour groundY AVANT player.update() pour que la gravité utilise la bonne hauteur
      this.player.groundY = this.tileManager.getGroundYUnderPlayer(this.player);
>>>>>>> c40e69e (walk on trains feature)
      this.player.update(this.input);

      // Caméra suit la hauteur du joueur
      // Caméra suit la hauteur du joueur en douceur
      // Caméra suit la hauteur réelle du joueur (pas juste groundY)
      const playerHeight = this.player.mesh.position.y - 0.75; // position des pieds
      const targetCamY   = 6 + Math.max(0, playerHeight - 1.25);
      this.camera.position.y = BABYLON.Scalar.Lerp(
        this.camera.position.y,
        targetCamY,
        0.06  // un peu plus lent pour un effet smooth pendant la montée
      );

      // Incrémenter le score
      this.score += Math.round(this.speed * 10);
      this._updateHUD();

<<<<<<< HEAD
      // Vérifier les collisions
      if (
        !this.powerUpManager.isActive("shield") &&
        !this.invincible &&
        this.tileManager.checkCollision(this.player)
      ) {
        this._triggerGameOver();
      }
=======
      // Chaque coin = 50 points de base + bonus selon la vitesse
      this.tileManager.checkCoins(this.player, (count) => {
        const bonus = this.powerUpManager.isActive('jetpack') ? 100 : 50;
        this.score += count * bonus;

        // Flash visuel sur le score pour feedback
        const scoreEl = document.getElementById('scoreDisplay');
        scoreEl.style.color = this.powerUpManager.isActive('jetpack') ? '#ff8800' : '#00ffcc';
        clearTimeout(this._scoreFlashTimer);
        this._scoreFlashTimer = setTimeout(() => {
          scoreEl.style.color = '';
        }, 200);
      });
      
      // Vérifier les collisions (pas pendant jetpack — le joueur vole au dessus)
    if (!this.powerUpManager.isActive('shield') &&
        !this.powerUpManager.isActive('jetpack') &&
        !this.invincible &&
        this.tileManager.checkCollision(this.player)) {
      this._triggerGameOver();
    }
>>>>>>> 9c2c7a8 (jetpack feature)

      // Super vitesse : boost temporaire
      if (this.powerUpManager.isActive("speed")) {
        this.speed = Math.min(this.speed, Game.INITIAL_SPEED * 2.5);
      }
<<<<<<< HEAD
<<<<<<< HEAD

      // Trouve la tuile la plus proche sous le joueur
      const tile = this.tileManager.getTileUnderPlayer(this.player);
      if (tile) {
        this.player.groundY = tile.ground.metadata.groundY;
      }
=======
>>>>>>> c40e69e (walk on trains feature)
=======

>>>>>>> 9c2c7a8 (jetpack feature)
    }

    this.scene.render();
  }

  onPowerUpStart(type) {
    const icons = { magnet: "🧲", shield: "🛡️", speed: "⚡" };
    this._onPowerUpChange(type, true, icons[type]);

    if (type === "speed") {
      this.speed *= 2;
      this.scene.clearColor = new BABYLON.Color4(0.15, 0.0, 0.3, 1); // violet
    }
    if (type === "shield") {
      this.player.mesh.material.emissiveColor = new BABYLON.Color3(
        0.0,
        0.5,
        1.0,
      );
    }
  }

  onPowerUpEnd(type) {
    this._onPowerUpChange(type, false, null);

    if (type === "speed") {
      this.speed = Game.INITIAL_SPEED;
      this.scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1);
    }
    if (type === "shield") {
      this.player.mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
    }
  }

  // ─────────────────────────────────────────
  // Gestion des états
  // ─────────────────────────────────────────

  start() {
    this.state = "PLAYING";
  }

  restart() {
    // Réinitialiser toutes les valeurs
    this.score = 0;
    this.speed = Game.INITIAL_SPEED;
    this.state = "IDLE";

    this.player.reset();
    this.tileManager.reset();
    this.powerUpManager.reset();

    // Remettre l'état PLAYING directement
    this.state = "PLAYING";
  }

  _triggerGameOver() {
    this.state = "GAMEOVER";
    this._onGameOver(this.score);
  }

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  _updateHUD() {
    const pct = Math.min(100, ((this.speed - Game.INITIAL_SPEED) / 0.3) * 100);
    const color = pct > 70 ? "#ff4444" : pct > 40 ? "#ffaa00" : "#00ffcc";
    this._onHudUpdate(this.score, pct, color);
  }

  destroy() {
    this.engine.stopRenderLoop();
    window.removeEventListener("resize", this._resizeHandler);
    this.input.destroy();
    this.engine.dispose();
  }
}
