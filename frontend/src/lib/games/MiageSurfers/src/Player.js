import * as BABYLON from "babylonjs";

export class Player {
  static LANES      = [-3, 0, 3];
  static GRAVITY    = -0.018;
  static JUMP_FORCE =  0.35;
  static LANE_SPEED =  0.18;

  constructor(scene) {
    this.scene       = scene;
    this.laneIndex   = 1;
    this.targetX     = 0;
    this.velocityY   = 0;
    this.isOnGround  = true;
    this.jumpsLeft   = 2;
    this.groundY     = 1.25;
    this._leftWasPressed  = false;
    this._rightWasPressed = false;
    this.isSliding   = false;
    this.slideTimer  = 0;
    this._createMesh();
  }

  _createMesh() {
    this.mesh = BABYLON.MeshBuilder.CreateCapsule(
      'player',
      { radius: 0.4, height: 1.5 },
      this.scene
    );
    this.mesh.position.set(0, 1.25 + 0.75, 0);
    const mat = new BABYLON.StandardMaterial('playerMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
    this.mesh.material = mat;
  }

  update(input) {
    this._handleLaneSwitch(input);
    this._handleJump(input);
    this._handleSlide(input);
    this._applyMovement();
  }

  _handleLaneSwitch(input) {
    if (input.leftPressed && !this._leftWasPressed) {
      if (this.laneIndex > 0) this.laneIndex--;
      this.targetX = Player.LANES[this.laneIndex];
    }
    if (input.rightPressed && !this._rightWasPressed) {
      if (this.laneIndex < 2) this.laneIndex++;
      this.targetX = Player.LANES[this.laneIndex];
    }
    this._leftWasPressed  = input.leftPressed;
    this._rightWasPressed = input.rightPressed;
  }

  _handleJump(input) {
    if (this.jumpsLeft > 0 && input.consumeJump()) {
      this.velocityY  = Player.JUMP_FORCE;
      this.isOnGround = false;
      this.jumpsLeft--;
    }
  }

  _handleSlide(input) {
    if (input.slidePressed && this.isOnGround && !this.isSliding) {
      this.isSliding       = true;
      this.slideTimer      = 40;
      this.mesh.scaling.y  = 0.5;
      this.mesh.position.y = this.groundY + 0.4;
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

    const feetY = this.groundY + 0.75;
    if (this.mesh.position.y <= feetY) {
      this.mesh.position.y = feetY;
      this.velocityY       = 0;
      this.isOnGround      = true;
      this.jumpsLeft       = 2;
    } else {
      this.isOnGround = false;
    }
  }

  reset() {
    this.laneIndex       = 1;
    this.targetX         = 0;
    this.velocityY       = 0;
    this.isOnGround      = true;
    this.mesh.position.set(0, 1.25 + 0.75, 0);
    this.jumpsLeft       = 2;
    this.groundY         = 1.25;
    this.isSliding       = false;
    this.mesh.scaling.y  = 1;
  }

  getPosition() {
    return this.mesh.position;
  }
}