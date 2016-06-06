namespace Game {
  export let finished = false;
  
  export let camera: CameraBehavior;
  export let ball: BallBehavior;
  
  export const scores = [ 0, 0 ];
  export const winScore = 5;
  
  export const playerCollidables: Sup.ArcadePhysics2D.Body[] = [];
  export const ballCollidables: Sup.ArcadePhysics2D.Body[] = [];
  export const projectileCollidables: Sup.ArcadePhysics2D.Body[] = [];
  
  export function start() {
    finished = false;
    
    playerCollidables.length = 0;
    ballCollidables.length = 0;
    projectileCollidables.length = 0;
    
    Sup.loadScene("Scene");

    playerCollidables.push(Sup.getActor("Map").arcadeBody2D);
    playerCollidables.push(Sup.getActor("Player 1").arcadeBody2D);
    playerCollidables.push(Sup.getActor("Player 2").arcadeBody2D);
    playerCollidables.push(Sup.getActor("Ball").arcadeBody2D);

    ballCollidables.push(Sup.getActor("Map").arcadeBody2D);
    projectileCollidables.push(Sup.getActor("Map").arcadeBody2D);
  }
  
  export function restart() {
    scores.length = 0;
    scores.push(0, 0);
    
    start();
  }
}

Sup.ArcadePhysics2D.setGravity(0, 0);
Sup.Audio.playSound("Music", 0.2, { loop: true });
