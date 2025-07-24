// Ship.js - Player-controlled ship

import { GameObject } from './GameObject.js';
import { shipArt } from './assets.js';

export class Ship extends GameObject {
  constructor(x, y) {
    super(x, y, shipArt, "white");
    this.hits = 0;
    this.maxHits = 4;
    this.speed = 1;
    this.baseSpeed = 1;
  }

  // Move the ship by dx, dy
  move(dx, dy, windowWidth, windowHeight, obstacles = []) {
    const newX = this.x + dx * this.speed;
    const newY = this.y + dy * this.speed;

    // Check bounds first
    const dims = this.getDimensions();
    if (newX < 0 || newY < 0 || newX + dims.width > windowWidth || newY + dims.height > windowHeight) {
      return false;
    }

    // Store current position
    const oldX = this.x;
    const oldY = this.y;

    // Temporarily move to new position for collision check
    this.x = newX;
    this.y = newY;

    // Check collisions with obstacles at new position
    for (const obstacle of obstacles) {
      if (obstacle.name == 'morse') continue;
      if(obstacle.name == "record")continue;
      if (this.wouldCollide(obstacle)) {
        // Restore old position - don't move into collision
        this.x = oldX;
        this.y = oldY;
        return false;
      }
    }

    // Move is valid - already at new position
    return true;
  }

  // Simple collision check for movement
  wouldCollide(obstacle) {
    const dims1 = this.getDimensions();
    const dims2 = obstacle.getDimensions();

    return !(this.x + dims1.width <= obstacle.x ||
      this.x >= obstacle.x + dims2.width ||
      this.y + dims1.height <= obstacle.y ||
      this.y >= obstacle.y + dims2.height);
  }

  // Take damage
  takeDamage(amount = 1) {
    this.hits = Math.min(this.hits + amount, this.maxHits);
    this.art = shipArt;

    console.log(`💥 Ship damage! Hits: ${this.hits}/${this.maxHits}, Health: ${this.getHealthPercentage()}%`);
    
    if (this.isDestroyed()) {
      this.active = false;
      console.log("💀 Ship destroyed!");
    }
  }

  // Check if ship is destroyed
  isDestroyed() {
    return this.hits >= this.maxHits;
  }

  // Collision detection between two objects
  checkCollision(objA, objB) {
    const cellsA = new Set(objA.getOccupiedCells());
    const cellsB = objB.getOccupiedCells();

    for (const cell of cellsB) {
      if (cellsA.has(cell)) return true;
    }
    return false;
  }

  // Handle collision
  onCollision(other) {
    if (other.name === "meteor" || other.name === "moon" || other.name === "asteroid" || other.name === "blackhole") {
      console.log(`🔥 Ship took damage from ${other.name}! Health: ${this.getHealthPercentage()}%`);
      this.takeDamage(1);

      // Visual feedback - change ship art immediately
      this.art = shipArt;
    }
  }

  // Get current health percentage
  getHealthPercentage() {
    return ((this.maxHits - this.hits) / this.maxHits) * 100;
  }
}