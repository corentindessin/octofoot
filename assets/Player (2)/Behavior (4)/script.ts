class PlayerBehavior extends Sup.Behavior {
  index: number;
  private position: Sup.Math.Vector2;
  private direction = "Down";

  private punchCharge = 0;
  private punchMaxChargeTimer = 0;

  private projectileCharge = 0;
  private projectileMaxChargeTimer = 0;

  private punchChargeSpriteRenderer: Sup.SpriteRenderer;
  private projectileChargeSpriteRenderer: Sup.SpriteRenderer;
  private punchContactSpriteRenderer: Sup.SpriteRenderer;

  private projectileAngle = this.index === 0 ? 0 : Math.PI;
  private projectileCooldown = 0;

  awake() {
    this.position = this.actor.getLocalPosition().toVector2();
    
    if (this.index === 1) this.actor.spriteRenderer.setHorizontalFlip(true);
    
    // Punch
    const punchChargeActor = new Sup.Actor("Punch Charge", this.actor);
    punchChargeActor.setVisible(false);
    punchChargeActor.setLocalZ(1);
    
    this.punchChargeSpriteRenderer = new Sup.SpriteRenderer(punchChargeActor, "Player/Punch Charge");
    this.punchChargeSpriteRenderer.setAnimation("Animation").pauseAnimation();
    
    const punchContactActor = new Sup.Actor("Punch Contact", punchChargeActor);
    punchChargeActor.setVisible(false);
    punchChargeActor.setLocalZ(1);
    
    this.punchContactSpriteRenderer = new Sup.SpriteRenderer(punchContactActor, "Player/Punch Contact");
    
    // Projectile
    const projectileChargeActor = new Sup.Actor("Projectile Charge", this.actor);
    projectileChargeActor.setVisible(false);
    projectileChargeActor.setLocalZ(1);
    
    this.projectileChargeSpriteRenderer = new Sup.SpriteRenderer(projectileChargeActor, "Player/Projectile Charge");
    this.projectileChargeSpriteRenderer.setAnimation("Animation").pauseAnimation();
    
    // Score
    Sup.getActor(`Score ${this.index + 1}`).textRenderer.setText(Game.scores[this.index]);
  }

  update() {
    Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, Game.playerCollidables);
    this.position = this.actor.getLocalPosition().toVector2();
    
    const moveAngle = Input.getAngle(this.index);
    if (moveAngle != null) {
      if (moveAngle > Math.PI / 2 || moveAngle < -Math.PI / 2) this.actor.spriteRenderer.setHorizontalFlip(true);
      else if (moveAngle < Math.PI / 2 && moveAngle > -Math.PI / 2) this.actor.spriteRenderer.setHorizontalFlip(false);
      
      this.direction = moveAngle > 0 && moveAngle < Math.PI ? "Up" : "Down";
    }
    
    if (!Input.chargingProjectile(this.index) && moveAngle != null) {
      this.actor.arcadeBody2D.setVelocity(Math.cos(moveAngle) * PlayerBehavior.moveSpeed, Math.sin(moveAngle) * PlayerBehavior.moveSpeed);
      this.actor.spriteRenderer.setAnimation(`Walk ${this.direction}`);
    } else {
      this.actor.arcadeBody2D.setVelocity(0, 0);
      this.actor.spriteRenderer.setAnimation(`Idle ${this.direction}`);
    }

    if (this.position.x < PlayerBehavior.leftLimit) {
      this.position.x = PlayerBehavior.leftLimit;
      this.actor.arcadeBody2D.setVelocityX(0);
      this.actor.arcadeBody2D.warpPosition(this.position);
    } else if (this.position.x > PlayerBehavior.rightLimit) {
      this.position.x = PlayerBehavior.rightLimit;
      this.actor.arcadeBody2D.setVelocityX(0);
      this.actor.arcadeBody2D.warpPosition(this.position);
    }

    if (Game.finished) {
      this.punchChargeSpriteRenderer.actor.setVisible(false);
      this.punchContactSpriteRenderer.actor.setVisible(false);
      this.projectileChargeSpriteRenderer.actor.setVisible(false);
      return;
    }

    this.charge();
  }

  charge() {
    const distanceToBall = this.position.distanceTo(Game.ball.position);
    const angleToBall = this.position.angleTo(Game.ball.position);
    
    if (Input.chargingPunch(this.index)) {
      this.punchCharge = Math.min(this.punchCharge + 1, PlayerBehavior.maxCharge);
      this.punchChargeSpriteRenderer.actor.setVisible(true);
      this.punchContactSpriteRenderer.actor.setVisible(distanceToBall < PlayerBehavior.maxPunchDistance);
      
      if (this.punchCharge === PlayerBehavior.maxCharge) {
        const currentFrame = this.punchChargeSpriteRenderer.getAnimationFrameIndex();
        this.punchMaxChargeTimer += 1;
        if (this.punchMaxChargeTimer > 2 * PlayerBehavior.maxChargeTimerDelay)
          this.punchMaxChargeTimer -= 2 * PlayerBehavior.maxChargeTimerDelay;
        this.punchChargeSpriteRenderer.setAnimationFrameTime(this.punchMaxChargeTimer < PlayerBehavior.maxChargeTimerDelay ? 6 : 7);

      } else {
        this.punchChargeSpriteRenderer.setAnimationFrameTime(this.punchCharge / PlayerBehavior.maxCharge * 8);
      }
      
      this.punchChargeSpriteRenderer.actor.setLocalEulerZ(angleToBall);
    } else {
      if (this.punchCharge !== 0 && distanceToBall < PlayerBehavior.maxPunchDistance) {
        const amplitude = PlayerBehavior.minPunchPower + this.punchCharge / PlayerBehavior.maxCharge * (PlayerBehavior.maxPunchPower - PlayerBehavior.minPunchPower);
        Game.ball.applyImpulse(angleToBall, amplitude);
      }
      
      this.punchCharge = 0;
      this.punchMaxChargeTimer = 0;
      this.punchChargeSpriteRenderer.actor.setVisible(false);
    }
    
    if (this.projectileCooldown > 0) {
      this.projectileCooldown--;
      return;
    }
    
    if (Input.chargingProjectile(this.index)) {
      this.projectileCharge = Math.min(this.projectileCharge + 1, PlayerBehavior.maxCharge);
      this.projectileChargeSpriteRenderer.actor.setVisible(true);
      
      const aimAngle = Input.getAngle(this.index);
      if (aimAngle != null) this.projectileAngle = aimAngle;
      
      if (this.projectileCharge === PlayerBehavior.maxCharge) {
        const currentFrame = this.projectileChargeSpriteRenderer.getAnimationFrameIndex();
        this.projectileMaxChargeTimer += 1;
        if (this.projectileMaxChargeTimer > 2 * PlayerBehavior.maxChargeTimerDelay)
          this.projectileMaxChargeTimer -= 2 * PlayerBehavior.maxChargeTimerDelay;
        this.projectileChargeSpriteRenderer.setAnimationFrameTime(this.projectileMaxChargeTimer < PlayerBehavior.maxChargeTimerDelay ? 6 : 7);

      } else {
        this.projectileChargeSpriteRenderer.setAnimationFrameTime(this.projectileCharge / PlayerBehavior.maxCharge * 8);
      }
      
      this.projectileChargeSpriteRenderer.actor.setLocalEulerZ(this.projectileAngle);
    } else {
      if (this.projectileCharge !== 0) {
        this.projectileCooldown = PlayerBehavior.projectileCooldownValue;
        const projectileActor = new Sup.Actor("Projectile");
        projectileActor.setLocalPosition(this.position);
        projectileActor.setLocalZ(5);
        new Sup.SpriteRenderer(projectileActor, "Player/Projectile/Sprite").setAnimation("Idle");
        projectileActor.addBehavior(ProjectileBehavior, {
          angle: this.projectileAngle,
          forceAmount: this.projectileCharge / PlayerBehavior.maxCharge * PlayerBehavior.maxProjectilePower,
          playerBehavior: this
        });
      }
      
      this.projectileAngle = angleToBall;
      this.projectileCharge = 0;
      this.projectileMaxChargeTimer = 0;
      this.projectileChargeSpriteRenderer.actor.setVisible(false);
    }
  }
}
Sup.registerBehavior(PlayerBehavior);

namespace PlayerBehavior {
  export const leftLimit = 0;
  export const rightLimit = 20;
  
  export const moveSpeed = 0.15;
  
  export const maxCharge = 64;
  export const maxChargeTimerDelay = 8;
  export const minPunchPower = 0.1;
  export const maxPunchPower = 0.5;
  export const maxPunchDistance = 2;
  
  export const maxProjectilePower = 0.3;
  export const projectileCooldownValue = 60;
}
