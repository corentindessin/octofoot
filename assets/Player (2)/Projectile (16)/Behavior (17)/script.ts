class ProjectileBehavior extends Sup.Behavior {
  position = this.actor.getLocalPosition().toVector2();
  angle: number;
  forceAmount: number;
  playerBehavior: PlayerBehavior;

  private life = 120;
  private rebounds = 2;
  private hasExploded = false;
  
  awake() {
    const options: BoxOptions = { movable: true, width: 0.6, height: 0.6, bounceX: 0.6, bounceY: 0.6 }
    new Sup.ArcadePhysics2D.Body(this.actor, Sup.ArcadePhysics2D.BodyType.Box, options);
    
    const speed = 0.2 + this.forceAmount;
    this.actor.arcadeBody2D.setVelocity(Math.cos(this.angle) * speed, Math.sin(this.angle) * speed);
  }

  update() {
    if (this.hasExploded) {
      this.actor.arcadeBody2D.setVelocity(0, 0);
      
      if (!this.actor.spriteRenderer.isAnimationPlaying()) {
        this.actor.destroy();
      }
      return;
    }
    
    this.life -= 1;
    if (this.life < 0) {
      this.explode();
      return;
    }
    
    const distanceToBall = this.position.distanceTo(Game.ball.position);
    const angleToBall = this.position.angleTo(Game.ball.position);
    
    if (distanceToBall < ProjectileBehavior.maxBallDistance) {
      Game.ball.applyImpulse(angleToBall, this.forceAmount);
      this.explode();
      return;
    }
    
    if (Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, Game.projectileCollidables)) {
      this.rebounds -= 1;
      this.life -= 30;

      if (this.rebounds < 0 || this.life < 0) this.explode();
    }

    this.position = this.actor.getLocalPosition().toVector2();
  }

  explode() {
    this.hasExploded = true;
    this.actor.spriteRenderer.setAnimation("Explode").playAnimation(false);
  }
}
Sup.registerBehavior(ProjectileBehavior);

namespace ProjectileBehavior {
  export const maxBallDistance = 1;
}
