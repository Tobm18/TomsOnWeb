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

class Game {
  static INITIAL_SPEED = 0.15;
  static SPEED_INCREMENT = 0.000035; // accélération progressive par frame

  constructor(canvas) {
    this.canvas = canvas;
    this.state  = 'IDLE';
    this.score  = 0;
    this.speed  = Game.INITIAL_SPEED;

    this._initEngine();
    this._initScene();
    this._initSystems();
    this._initCamera();
    this._initLights();

    // Lance le rendu (même à l'état IDLE pour voir la scène)
    this.engine.runRenderLoop(() => this._loop());

    // Redimensionnement de la fenêtre
    window.addEventListener('resize', () => this.engine.resize());
  }

  // ─────────────────────────────────────────
  // Initialisation
  // ─────────────────────────────────────────

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
    this.input       = new InputManager();
    this.player      = new Player(this.scene);
    this.powerUpManager = new PowerUpManager(this.scene);
    this.tileManager = new TileManager(this.scene, this.powerUpManager);
  }

  _initCamera() {
    // Caméra fixe derrière le joueur
    this.camera = new BABYLON.FreeCamera(
      'camera',
      new BABYLON.Vector3(0, 6, -10),
      this.scene
    );
    this.camera.setTarget(new BABYLON.Vector3(0, 0, 8));
  }

  _initLights() {
    // Lumière ambiante douce
    const ambient = new BABYLON.HemisphericLight(
      'ambient',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    ambient.intensity    = 0.5;
    ambient.groundColor  = new BABYLON.Color3(0.1, 0.1, 0.15);

    // Lumière directionnelle pour les ombres
    const sun = new BABYLON.DirectionalLight(
      'sun',
      new BABYLON.Vector3(-0.5, -1, 0.5),
      this.scene
    );
    sun.intensity = 0.8;
  }

  // ─────────────────────────────────────────
  // Boucle de jeu principale
  // ─────────────────────────────────────────

  _loop() {
    if (this.state === 'PLAYING') {
      // Augmenter la vitesse progressivement
      this.speed += Game.SPEED_INCREMENT;

      // Mettre à jour les systèmes
      this.tileManager.update(this.speed, this.score);
      this.powerUpManager.update(this.speed, this.player, this);
      this.tileManager.checkCoins(this.player, (count) => { this.score += count * 50; });
      this.player.update(this.input);

      // Incrémenter le score
      this.score += Math.round(this.speed * 10);
      this._updateHUD();

      // Vérifier les collisions
      if (!this.powerUpManager.isActive('shield') &&
          !this.invincible &&
          this.tileManager.checkCollision(this.player)) {
        this._triggerGameOver();
      }

      // Super vitesse : boost temporaire
      if (this.powerUpManager.isActive('speed')) {
        this.speed = Math.min(this.speed, Game.INITIAL_SPEED * 2.5);
      }

      // Trouve la tuile la plus proche sous le joueur
     const tile = this.tileManager.getTileUnderPlayer(this.player);
     if (tile) {
         this.player.groundY = tile.ground.metadata.groundY;
     }
    }

    this.scene.render();
  }

  onPowerUpStart(type) {
  const icons = { magnet: '🧲', shield: '🛡️', speed: '⚡' };
  document.getElementById('powerupDisplay').textContent = icons[type];
  document.getElementById('powerupDisplay').style.opacity = '1';

  if (type === 'speed') {
    this.speed *= 2;
    this.scene.clearColor = new BABYLON.Color4(0.15, 0.0, 0.3, 1); // violet
  }
  if (type === 'shield') {
    this.player.mesh.material.emissiveColor = new BABYLON.Color3(0.0, 0.5, 1.0);
  }
}

onPowerUpEnd(type) {
  document.getElementById('powerupDisplay').style.opacity = '0';

  if (type === 'speed') {
    this.speed = Game.INITIAL_SPEED;
    this.scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1);
  }
  if (type === 'shield') {
    this.player.mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
  }
}

  // ─────────────────────────────────────────
  // Gestion des états
  // ─────────────────────────────────────────

  start() {
    this.state = 'PLAYING';
  }

  restart() {
    // Réinitialiser toutes les valeurs
    this.score = 0;
    this.speed = Game.INITIAL_SPEED;
    this.state = 'IDLE';

    this.player.reset();
    this.tileManager.reset();
    this.powerUpManager.reset();

    // Remettre l'état PLAYING directement
    this.state = 'PLAYING';
  }

  _triggerGameOver() {
    this.state = 'GAMEOVER';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('gameoverScreen').style.display = 'flex';
  }

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  _updateHUD() {
    document.getElementById('scoreDisplay').textContent = this.score;
    const pct = Math.min(100, ((this.speed - Game.INITIAL_SPEED) / 0.3) * 100);
    const color = pct > 70 ? '#ff4444' : pct > 40 ? '#ffaa00' : '#00ffcc';
    const fill = document.getElementById('speedFill');
    fill.style.width = pct + '%';
    fill.style.background = color;
  }
}