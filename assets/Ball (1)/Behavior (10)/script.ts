class BallBehavior extends Sup.Behavior {
  position = this.actor.getLocalPosition().toVector2();
  
  ballContainer: Sup.Actor;
  spriteRenderer: Sup.SpriteRenderer;

  lerpStretch = 1;

  y = 0;
  yVelocity = 0;

  awake() {
    Game.ball = this;
    
    const options: BoxOptions = { movable: true, width: 0.6, height: 0.6, bounceX: 0.8, bounceY: 0.8 }
    new Sup.ArcadePhysics2D.Body(this.actor, Sup.ArcadePhysics2D.BodyType.Box, options);
    this.actor.arcadeBody2D.setVelocityMultiplier(0.98, 0.98);
    
    this.ballContainer = this.actor.getChild("Container");
    this.spriteRenderer = this.ballContainer.getChild("Sprite").spriteRenderer;
  }

  update() {
    if (!this.spriteRenderer.isAnimationPlaying()) this.spriteRenderer.setAnimation("Idle");
    
    if (Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, Game.ballCollidables))
      Sup.Audio.playSound("Ball/Sound", 0.5);
      
    this.position = this.actor.getLocalPosition().toVector2();
    
    this.lerpStretch = Sup.Math.lerp(this.lerpStretch, 1, 0.15);
    this.ballContainer.setLocalScaleX(this.lerpStretch);
    this.ballContainer.setLocalScaleY(1 / (0.5 + this.lerpStretch / 2));
    
    if (this.y > 0 || this.yVelocity > 0) {
      this.yVelocity -= BallBehavior.gravity;
      
      this.y = Math.max(0, this.y + this.yVelocity);
      this.ballContainer.setLocalY(this.y);
    }
    
    if (Game.finished) {
      this.actor.arcadeBody2D.setVelocity(0, 0);
      return;
    }
    
    if (this.position.x < BallBehavior.leftLimit) this.goal(1);
    else if (this.position.x > BallBehavior.rightLimit) this.goal(0);
  }

  goal(playerIndex: number) {
    Game.finished = true;
    Game.scores[playerIndex] += 1;
    Sup.getActor(`Score ${playerIndex + 1}`).textRenderer.setText(Game.scores[playerIndex]);
    
    Game.camera.shake();
    Sup.Audio.playSound("Goal");
    
    Sup.setTimeout(1000, () => {
      if (Game.scores[playerIndex] === Game.winScore) {
        Sup.Audio.playSound("Victory");
        
        const winActor = Sup.getActor("Win");
        winActor.setVisible(true);
        winActor.textRenderer.setText(`Player ${playerIndex + 1}\nwins!`);
      } else {
        Game.start();
      }
    });
  }
  
  applyImpulse(angle: number, amount: number) {
    if (Game.finished) return;

    Sup.Audio.playSound("Ball/Sound", 0.5);
    makeSmoke(this.position);
    
    this.ballContainer.setLocalEulerZ(angle);
    this.spriteRenderer.actor.setLocalEulerZ(-angle);
    this.spriteRenderer.setAnimation("Impulse").playAnimation(false);
    this.lerpStretch = 1 + 1.5 * amount;
    this.yVelocity = 0.2 * amount;
    this.y = 0;

    this.actor.arcadeBody2D.addVelocity(Math.cos(angle) * amount, Math.sin(angle) * amount);
  }

  bounce() {
    const velocity = this.actor.arcadeBody2D.getVelocity();
    const velocityLength = Sup.Math.clamp(velocity.length() * 2, BallBehavior.minBounceSpeed, BallBehavior.maxBounceSpeed);
    velocity.normalize().multiplyScalar(velocityLength);
    velocity.y *= -1;
    this.actor.arcadeBody2D.setVelocity(velocity);
  }
}
Sup.registerBehavior(BallBehavior);

namespace BallBehavior {
  export const leftLimit = 0.3;
  export const rightLimit = 19.7;

  export const gravity = 0.02;
  
  export const minBounceSpeed = 0.3;
  export const maxBounceSpeed = 0.8;
}
