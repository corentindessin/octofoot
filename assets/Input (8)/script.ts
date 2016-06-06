namespace Input {
  export function getAngle(index: number) {
    const horizontalAxis = Sup.Input.getGamepadAxisValue(index, 0);
    const verticalAxis = Sup.Input.getGamepadAxisValue(index, 1);
    
    let angle: number;
    
    if (horizontalAxis !== 0 || verticalAxis !== 0) {
      angle = Math.atan2(-verticalAxis, horizontalAxis);
    } else {
      const leftDown = Sup.Input.isKeyDown(index === 0 ? "LEFT" : "Q");
      const rightDown = Sup.Input.isKeyDown(index === 0 ? "RIGHT" : "D");
      const upDown = Sup.Input.isKeyDown(index === 0 ? "UP" : "Z");
      const downDown = Sup.Input.isKeyDown(index === 0 ? "DOWN" : "S");
      
      if (leftDown) {
        if (upDown) {
          angle = Math.PI * 3 / 4;
        } else if (downDown) {
          angle = -Math.PI * 3 / 4;
        } else {
          angle = Math.PI;
        }
      } else if (rightDown) {
        if (upDown) {
          angle = Math.PI * 1 / 4;
        } else if (downDown) {
          angle = -Math.PI * 1 / 4;
        } else {
          angle = 0;
        }
      } else if (upDown) {
        angle = Math.PI / 2;
      } else if (downDown) {
        angle = -Math.PI * 1 / 2;
      }
    }
    
    return angle;
  }
  
  export function chargingPunch(index: number) {
    if (index === 0 && Sup.Input.isKeyDown("NUMPAD1") && !Sup.Input.isKeyDown("NUMPAD2")) return true;
    else if (index === 1 && Sup.Input.isKeyDown("H") && !Sup.Input.isKeyDown("J")) return true;
    else if (Sup.Input.isGamepadButtonDown(index, 0) && !Sup.Input.isGamepadButtonDown(index, 1)) return true;
    
    return false;
  }
  
  export function chargingProjectile(index: number) {
    if (index === 0 && Sup.Input.isKeyDown("NUMPAD2") && !Sup.Input.isKeyDown("NUMPAD1")) return true;
    else if (index === 1 && Sup.Input.isKeyDown("J") && !Sup.Input.isKeyDown("H")) return true;
    else if (Sup.Input.isGamepadButtonDown(index, 1) && !Sup.Input.isGamepadButtonDown(index, 0)) return true;
    
    return false;
  }
}