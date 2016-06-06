class BubbleBehavior extends Sup.Behavior {
  
  private startTimer = Sup.Math.Random.integer(100, 130);
  private timer = this.startTimer;

  private x: number;
  private sinOffset = Sup.Math.Random.float(-Math.PI, Math.PI);

  awake() {
    this.x = this.actor.getLocalX();
  }

  update() {
    this.actor.moveLocalY(0.015);
    this.actor.setLocalX(this.x + Math.sin(this.sinOffset + this.timer / 30) / 3);
    
    this.timer -= 1;
    
    if (this.timer === 0) this.actor.destroy();
    else this.actor.spriteRenderer.setOpacity(this.timer / this.startTimer);
  }
}
Sup.registerBehavior(BubbleBehavior);
