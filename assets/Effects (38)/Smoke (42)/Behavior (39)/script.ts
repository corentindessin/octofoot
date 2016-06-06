class SmokeBehavior extends Sup.Behavior {
  awake() {
    new Sup.SpriteRenderer(this.actor, `Effects/Smoke/Sprite ${Sup.Math.Random.integer(1, 2)}`).setAnimation("Animation").playAnimation(false);
  }

  update() {
    if (!this.actor.spriteRenderer.isAnimationPlaying()) {
      this.actor.destroy();
      return;
    }
  }
}
Sup.registerBehavior(SmokeBehavior);

function makeSmoke(position: Sup.Math.Vector2) {
  const particles = Sup.Math.Random.integer(3, 7);

  for (let i = 0; i < particles; i++) {
    const offset = new Sup.Math.Vector2(Sup.Math.Random.float(-0.5, 0.5), Sup.Math.Random.float(-0.5, 0.5));
    new Sup.Actor("Smoke").setLocalPosition(offset.add(position)).setLocalZ(4).addBehavior(SmokeBehavior);
  }
}
