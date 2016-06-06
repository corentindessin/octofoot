class CameraBehavior extends Sup.Behavior {
  private shakeTimer = 0;
  private timeoutIds = [];
  
  awake() {
    Game.camera = this;
    
    this.scheduleBubble();
    
    Sup.Input.on("fullscreenStateChange", this.onFullscreenStateChange);
  }

  onFullscreenStateChange(state: string) {
    Sup.log(state);
    if (state === "suspended") {
      Sup.Input.exitFullscreen();
    }
  }

  onDestroy() {
    for (const timeoutId of this.timeoutIds) Sup.clearTimeout(timeoutId);
  }

  update() {
    if (Sup.Input.wasKeyJustPressed("F11")) {
      Sup.Input.goFullscreen();
    }
    
    // Debug when getting stuck outside the wall
    if (Game.scores[0] < Game.winScore && Game.scores[1] < Game.winScore &&
    (Sup.Input.wasKeyJustPressed("R") || Sup.Input.wasGamepadButtonJustPressed(0, 8))) {
      Game.start();
      return;
    }
    
    if (Sup.Input.wasKeyJustPressed("RETURN") || Sup.Input.wasGamepadButtonJustPressed(0, 9)) {
      Game.restart();
      return;
    }
    
    if (this.shakeTimer > 0) {
      this.shakeTimer -= 1;
      
      const x = 10 + Sup.Math.Random.float(-CameraBehavior.shakeAmplitude, CameraBehavior.shakeAmplitude);
      const y = 7 + Sup.Math.Random.float(-CameraBehavior.shakeAmplitude, CameraBehavior.shakeAmplitude);
      this.actor.setLocalPosition(x, y);
    }
  }
  
  shake() {
    this.shakeTimer = CameraBehavior.shakeDuration;
  }

  scheduleBubble() {
    const timeoutId = Sup.setTimeout(Sup.Math.Random.integer(CameraBehavior.bubbleMinSpawnDelay, CameraBehavior.bubbleMaxSpawnDelay), () => {
      this.timeoutIds.splice(this.timeoutIds.indexOf(timeoutId), 1);
      
      const x = Sup.Math.Random.float(1, 19);
      const y = Sup.Math.Random.float(1, 11);
      
      for (let i = 0; i < Sup.Math.Random.integer(2, 4); i++) {
        const bubbleTimeoutId = Sup.setTimeout(Sup.Math.Random.integer(0, 5) * 100, () => {
          this.timeoutIds.splice(this.timeoutIds.indexOf(bubbleTimeoutId), 1);
          
          const bubbleActor = new Sup.Actor("Bubble");
          new Sup.SpriteRenderer(bubbleActor, `Effects/Bubble/Sprite ${Sup.Math.Random.integer(1, 3)}`);

          const xOffset = Sup.Math.Random.float(-0.5, 0.5);
          const yOffset = Sup.Math.Random.float(-0.5, 0.5);
          bubbleActor.setLocalPosition(x + xOffset, y + yOffset, 5);

          bubbleActor.addBehavior(BubbleBehavior);
        });
        this.timeoutIds.push(bubbleTimeoutId);
      }
      
      this.scheduleBubble();
    });
    this.timeoutIds.push(timeoutId);
  }
}
Sup.registerBehavior(CameraBehavior);

namespace CameraBehavior {
  export const shakeAmplitude = 0.2;
  export const shakeDuration = 30;
  
  export const bubbleMinSpawnDelay = 90;
  export const bubbleMaxSpawnDelay = 240;
}
