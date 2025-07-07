// Ship.js - Player-controlled ship

import { GameObject } from './GameObject.js';
import { shipArt } from './assets.js';

export class Ship extends GameObject {
  constructor(x, y) {
    super(x, y, shipArt[0], "white");
    this.hits = 0;
    this.maxHits = shipArt.length - 1;
    this.speed = 1;
  }

  // Move the ship by dx, dy
  move(dx, dy, windowWidth, windowHeight, obstacles = []) {
    const newX = this.x + dx * this.speed;
    const newY = this.y + dy * this.speed;

    // Create temporary ship at new position for collision checking
    const tempShip = new Ship(newX, newY);
    tempShip.hits = this.hits;
    tempShip.art = shipArt[this.hits];

    // Check bounds
    if (!tempShip.isWithinBounds(windowWidth, windowHeight)) {
      return false;
    }

    // Check collisions with obstacles
    for (const obstacle of obstacles) {
      if (this.checkCollision(tempShip, obstacle)) {
        this.onCollision(obstacle);
        return false; // Don't move if collision would occur
      }
    }

    // Move is valid
    this.x = newX;
    this.y = newY;
    return true;
  }

  // Take damage
  takeDamage(amount = 1) {
    this.hits = Math.min(this.hits + amount, this.maxHits);
    this.art = shipArt[this.hits];
    
    if (this.isDestroyed()) {
      this.active = false;
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
    if (other.name === "meteor" || other.name === "moon") {
      this.takeDamage(1);
    }
  }

  // Get current health percentage
  getHealthPercentage() {
    return ((this.maxHits - this.hits) / this.maxHits) * 100;
  }
}