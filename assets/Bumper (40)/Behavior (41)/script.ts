class BumperBehavior extends Sup.Behavior {
  position: Sup.Math.Vector2;
  cooldown = 0;
  
  awake() {
    this.position = this.actor.getLocalPosition().toVector2();
  }

  update() {
    if (!this.actor.spriteRenderer.isAnimationPlaying()) {
      this.actor.spriteRenderer.setAnimation("Idle");
    }
    
    if (this.cooldown > 0) {
      this.cooldown--;
      return;
    } 
    
    const distanceToBall = this.position.distanceTo(Game.ball.position);
    const angleToBall = this.position.angleTo(Game.ball.position);
    
    if (distanceToBall < BumperBehavior.maxBallDistance) {
      Game.ball.bounce();
      this.actor.spriteRenderer.setAnimation("Bounce", false);
      this.cooldown = BumperBehavior.cooldownValue;
      Sup.Audio.playSound("Bumper/Sound", 0.5);
    }
  }
}
Sup.registerBehavior(BumperBehavior);

namespace BumperBehavior {
  export const maxBallDistance = 1;
  
  export const cooldownValue = 60;
}
