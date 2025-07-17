// Obstacle.js - Game obstacles with movement capabilities

import { GameObject } from './GameObject.js';
import { meteorArt, moonArt, asteroidArt, voyagerMessageMorse, recordArt, blackHoleArt } from './assets.js';




export class Obstacle extends GameObject {
  constructor(x, y, name, art, color) {
    super(x, y, art, color);
    this.name = name;
    this.speed = 1;           // Movement speed (pixels per update)
    this.direction = { dx: -1, dy: 0 }; // Default: move left
    this.spawned = false;     // Whether this was dynamically spawned
  }

  // Update obstacle position
  update(deltaTime) {
    // Move the obstacle based on speed and direction
    this.x += this.direction.dx * this.speed;
    this.y += this.direction.dy * this.speed;
  }

  morseUpdate(deltaTime) {
    this.x += this.direction.dx;
    this.y += this.direction.dy;
  }

  // Check if obstacle is off-screen (for cleanup)
  isOffScreen(windowWidth, windowHeight) {
    const dims = this.getDimensions();
    return this.x + dims.width < 0 ||
      this.x > windowWidth ||
      this.y + dims.height < 0 ||
      this.y > windowHeight;
  }
}

export class Meteor extends Obstacle {
  constructor(x, y) {
    super(x, y, "meteor", meteorArt, "gray");
    this.speed = 1.5; // Meteors are faster
  }

  // Meteors can have slight downward drift
  update(deltaTime) {
    super.update(deltaTime);
    // Add slight downward movement for realism
    if (Math.random() < 0.01) { // 1% chance per frame
      this.y += 0.1;
    }
  }
}

export class Moon extends Obstacle {
  constructor(x, y) {
    super(x, y, "moon", moonArt, "yellow");
    this.speed = 0.8; // Moons are slower but bigger
  }

  // Moons move in a slight sine wave pattern
  update(deltaTime) {
    super.update(deltaTime);
    // Add subtle vertical oscillation
    this.y += Math.sin(this.x * 0.01) * 0.1;
  }
}

export class MorseStar extends Obstacle {
  constructor(x, y, z) {
    super(x, y, "morse", voyagerMessageMorse[z], "#745d58");
    this.speed = 1; // Moons are slower but bigger
  }

  morseUpdate(deltaTime) {
    super.morseUpdate(deltaTime);
    // Add slight downward movement for realism
  }
}

export class Record extends Obstacle {
  constructor(x, y) {
    super(x, y, "record", recordArt, "gold");
    this.speed = 0.3; // Slower, majestic movement
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Add a gentle floating effect
    this.y += Math.sin(this.x * 0.02) * 0.05;
  }
}

// New obstacle type for variety
export class Asteroid extends Obstacle {
  constructor(x, y) {

    super(x, y, "asteroid", asteroidArt, "orange");
    this.speed = 2.5; // Asteroids are fast and small
    this.rotationPhase = Math.random() * Math.PI * 2; // Random rotation start
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Asteroids have erratic movement
    if (Math.random() < 0.05) { // 5% chance per frame
      this.direction.dy = (Math.random() - 0.5) * 0.5; // Random vertical drift
    }

    // Rotation effect by slightly changing the art display
    this.rotationPhase += 0.1;
    if (this.rotationPhase > Math.PI * 2) {
      this.rotationPhase = 0;
    }
  }

  // Override draw method to add rotation effect
  getOccupiedCells() {
    // For collision, use normal calculation
    return super.getOccupiedCells();
  }
}

export class BlackHole extends Obstacle {
  constructor(x, y) {
    super(x, y, "blackhole", blackHoleArt, "white");
    this.speed = 0.5;
    this.effectRadius = 5;
    this.damage = 1;

    // Blink state
    this.visible = true;
    this.blinkTimer = 0;
    this.blinkInterval = 500; // ms
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Swirl effect (optional)
    this.y += Math.sin(this.x * 0.02) * 0.05;

    // Blinking logic
    this.blinkTimer += deltaTime * 1000;
    if (this.blinkTimer >= this.blinkInterval) {
      this.visible = !this.visible;
      this.blinkTimer = 0;
    }
  }

  render(display) {
    if (this.visible) {
      super.render(display); // only draw when visible
    }
  }

  affectsPlayer(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.effectRadius;
  }
}
