import * as BABYLON from "babylonjs";
import { InputManager } from "./InputManager.js";
import { Player } from "./Player.js";
import { PowerUpManager } from "./PowerUpManager.js";
import { TileManager } from "./TileManager.js";

export class Game {
  static INITIAL_SPEED   = 0.45;
  static SPEED_INCREMENT = 0.00010;

  constructor(canvas, { onHudUpdate, onGameOver, onPowerUpChange } = {}) {
    this._onHudUpdate     = onHudUpdate     || (() => {});
    this._onGameOver      = onGameOver      || (() => {});
    this._onPowerUpChange = onPowerUpChange || (() => {});

    this.canvas = canvas;
    this.state  = 'IDLE';
    this.score  = 0;
    this.speed  = Game.INITIAL_SPEED;

    this._initEngine();
    this._initScene();
    this._initSystems();
    this._initCamera();
    this._initLights();

    this.engine.runRenderLoop(() => this._loop());
    this._resizeHandler = () => this.engine.resize();
    window.addEventListener('resize', this._resizeHandler);
  }

  _initEngine() {
    this.engine = new BABYLON.Engine(this.canvas, true);
  }

  _initScene() {
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.fogMode    = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.008;
    this.scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1);
    this.scene.fogColor   = new BABYLON.Color3(0.02, 0.02, 0.05);
  }

  _initSystems() {
    this.input          = new InputManager();
    this.player         = new Player(this.scene);
    this.powerUpManager = new PowerUpManager(this.scene);
    this.tileManager    = new TileManager(this.scene, this.powerUpManager);
  }

  _initCamera() {
    this.camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 6, -10), this.scene);
    this.camera.setTarget(new BABYLON.Vector3(0, 0, 8));
  }

  _initLights() {
    const ambient = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), this.scene);
    ambient.intensity   = 0.5;
    ambient.groundColor = new BABYLON.Color3(0.1, 0.1, 0.15);

    const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.5, -1, 0.5), this.scene);
    sun.intensity = 0.8;
  }

  _loop() {
    if (this.state === 'PLAYING') {
      this.speed += Game.SPEED_INCREMENT;

      this.tileManager.update(this.speed, this.score);
      this.powerUpManager.update(this.speed, this.player, this);

      // groundY AVANT player.update()
      this.player.groundY = this.tileManager.getGroundYUnderPlayer(this.player);
      this.player.update(this.input);

      // Caméra suit la hauteur réelle du joueur
      const playerHeight = this.player.mesh.position.y - 0.75;
      const targetCamY   = 6 + Math.max(0, playerHeight - 1.25);
      this.camera.position.y = BABYLON.Scalar.Lerp(this.camera.position.y, targetCamY, 0.06);

      this.score += Math.round(this.speed * 10);

      // Coins avec bonus jetpack
      this.tileManager.checkCoins(this.player, (count) => {
        const bonus = this.powerUpManager.isActive('jetpack') ? 100 : 50;
        this.score += count * bonus;
        const scoreEl = document.getElementById('scoreDisplay');
        if (scoreEl) {
          scoreEl.style.color = this.powerUpManager.isActive('jetpack') ? '#ff8800' : '#00ffcc';
          clearTimeout(this._scoreFlashTimer);
          this._scoreFlashTimer = setTimeout(() => { scoreEl.style.color = ''; }, 200);
        }
      });

      this._updateHUD();

      // Collisions (pas pendant jetpack)
      if (!this.powerUpManager.isActive('shield') &&
          !this.powerUpManager.isActive('jetpack') &&
          !this.invincible &&
          this.tileManager.checkCollision(this.player)) {
        this._triggerGameOver();
      }

      if (this.powerUpManager.isActive('speed')) {
        this.speed = Math.min(this.speed, Game.INITIAL_SPEED * 2.5);
      }
    }

    this.scene.render();
  }

  start() {
    this.state = 'PLAYING';
  }

  restart() {
    this.score = 0;
    this.speed = Game.INITIAL_SPEED;
    this.state = 'IDLE';
    this.player.reset();
    this.tileManager.reset();
    this.powerUpManager.reset();
    this.state = 'PLAYING';
  }

  _triggerGameOver() {
    this.state = 'GAMEOVER';
    this._onGameOver(this.score);
  }

  _updateHUD() {
    const pct   = Math.min(100, ((this.speed - Game.INITIAL_SPEED) / 0.3) * 100);
    const color = pct > 70 ? '#ff4444' : pct > 40 ? '#ffaa00' : '#00ffcc';
    this._onHudUpdate(this.score, pct, color);
  }

  destroy() {
    this.engine.stopRenderLoop();
    window.removeEventListener('resize', this._resizeHandler);
    this.input.destroy();
    this.engine.dispose();
  }
}