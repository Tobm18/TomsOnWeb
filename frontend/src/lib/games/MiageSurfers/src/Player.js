import * as BABYLON from "babylonjs";

/**
 * Player
 * Gère le mesh du joueur, son déplacement sur 3 lanes
 * et la physique du saut (gravité manuelle, sans moteur physique).
 */
export class Player {
  // Les 3 positions X possibles (gauche, centre, droite)
  static LANES = [-3, 0, 3];
  static GRAVITY = -0.018;
  static JUMP_FORCE = 0.35;
  static LANE_SPEED = 0.18; // vitesse d'interpolation latérale

  constructor(scene) {
    this.scene = scene;
    this.laneIndex = 1; // démarre au centre
    this.targetX = 0;
    this.velocityY = 0;
    this.isOnGround = true;
    this.jumpsLeft = 2;
    this.groundY = 1.25;

    // Blocage du changement de lane (évite de spammer)
    this._leftWasPressed = false;
    this._rightWasPressed = false;

    this.isSliding = false;
    this.slideTimer = 0;

    this._createMesh();
  }

<<<<<<< HEAD
  _createMesh() {
    // Capsule simple pour représenter le joueur
    this.mesh = BABYLON.MeshBuilder.CreateCapsule(
      "player",
      { radius: 0.4, height: 1.5 },
      this.scene,
    );
    this.mesh.position.set(0, 1.25, 0);

    // Matériau couleur vive pour le distinguer
    const mat = new BABYLON.StandardMaterial("playerMat", this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
    this.mesh.material = mat;
  }
=======
 _createMesh() {
  this.mesh = BABYLON.MeshBuilder.CreateCapsule(
    'player',
    { radius: 0.4, height: 1.5 },
    this.scene
  );
  this.mesh.position.set(0, 1.25 + 0.75, 0); // 2.0 = sol + demi-capsule

  const mat = new BABYLON.StandardMaterial('playerMat', this.scene);
  mat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
  this.mesh.material = mat;
}
>>>>>>> c40e69e (walk on trains feature)

  /**
   * Appelé à chaque frame par Game.update()
   * @param {InputManager} input
   */
  update(input) {
    this._handleLaneSwitch(input);
    this._handleJump(input);
    this._handleSlide(input);
    this._applyMovement();
  }

  _handleLaneSwitch(input) {
    // Changement de lane : on attend que la touche soit relâchée
    // avant d'accepter un nouvel appui (évite le double-saut de lane)
    if (input.leftPressed && !this._leftWasPressed) {
      if (this.laneIndex > 0) this.laneIndex--;
      this.targetX = Player.LANES[this.laneIndex];
    }
    if (input.rightPressed && !this._rightWasPressed) {
      if (this.laneIndex < 2) this.laneIndex++;
      this.targetX = Player.LANES[this.laneIndex];
    }

    this._leftWasPressed = input.leftPressed;
    this._rightWasPressed = input.rightPressed;
  }

  _handleJump(input) {
    if (this.jumpsLeft > 0 && input.consumeJump()) {
<<<<<<< HEAD
      this.velocityY = Player.JUMP_FORCE;
      this.isOnGround = false;
      this.jumpsLeft--;
    }
  }

  _handleSlide(input) {
    if (input.slidePressed && this.isOnGround && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 40; // frames
      this.mesh.scaling.y = 0.5; // aplatit le joueur
      this.mesh.position.y = 0.8; // le descend
    }
    if (this.isSliding) {
      this.slideTimer--;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.mesh.scaling.y = 1;
        this.mesh.position.y = this.groundY;
      }
    }
  }

  _applyMovement() {
    this.mesh.position.x = BABYLON.Scalar.Lerp(
      this.mesh.position.x,
      this.targetX,
      Player.LANE_SPEED,
    );

    if (!this.isOnGround) {
      this.velocityY += Player.GRAVITY;
      this.mesh.position.y += this.velocityY;

      if (this.mesh.position.y <= this.groundY) {
        this.mesh.position.y = this.groundY;
        this.velocityY = 0;
        this.isOnGround = true;
        this.jumpsLeft = 2;
      }
    }
=======
        this.velocityY  = Player.JUMP_FORCE;
        this.isOnGround = false;
        this.jumpsLeft--;
    }
}

_handleSlide(input) {
  if (input.slidePressed && this.isOnGround && !this.isSliding) {
    this.isSliding  = true;
    this.slideTimer = 40;
    this.mesh.scaling.y = 0.5;
    this.mesh.position.y = this.groundY + 0.4; // aplati = centre plus bas
  }
  if (this.isSliding) {
    this.slideTimer--;
    if (this.slideTimer <= 0) {
      this.isSliding      = false;
      this.mesh.scaling.y = 1;
    }
  }
}

  _applyMovement() {
  this.mesh.position.x = BABYLON.Scalar.Lerp(
    this.mesh.position.x,
    this.targetX,
    Player.LANE_SPEED
  );

  this.velocityY       += Player.GRAVITY;
  this.mesh.position.y += this.velocityY;

  // Le centre de la capsule doit être à groundY + demi-hauteur (0.75)
  const feetY = this.groundY + 0.75;

  if (this.mesh.position.y <= feetY) {
    this.mesh.position.y = feetY;
    this.velocityY       = 0;
    this.isOnGround      = true;
    this.jumpsLeft       = 2;
  } else {
    this.isOnGround = false;
>>>>>>> c40e69e (walk on trains feature)
  }

  /**
   * Remet le joueur à sa position de départ
   */
  reset() {
<<<<<<< HEAD
    this.laneIndex = 1;
    this.targetX = 0;
    this.velocityY = 0;
    this.isOnGround = true;
    this.mesh.position.set(0, 1.25, 0);
    this.jumpsLeft = 2;
    this.groundY = 1.25;
    this.isSliding = false;
    this.mesh.scaling.y = 1;
  }
=======
  this.laneIndex  = 1;
  this.targetX    = 0;
  this.velocityY  = 0;
  this.isOnGround = true;
  this.mesh.position.set(0, 1.25 + 0.75, 0); // 2.0 = sol + demi-capsule
  this.jumpsLeft  = 2;
  this.groundY    = 1.25;
  this.isSliding  = false;
  this.mesh.scaling.y = 1;
}
>>>>>>> c40e69e (walk on trains feature)

  /**
   * Retourne la position actuelle (utilisé pour les collisions)
   */
  getPosition() {
    return this.mesh.position;
  }
}
