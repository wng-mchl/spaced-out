// Ship.js - Player-controlled ship

import { GameObject } from './GameObject.js';
import { shipArt } from './assets.js';

export class Ship extends GameObject {
  constructor(x, y) {
    super(x, y, shipArt[0], "white");
    this.hits = 0;
    this.maxHits = 4;
    this.speed = 1;
  }

  // Move the ship by dx, dy
  move(dx, dy, windowWidth, windowHeight, obstacles = []) {
    const newX = this.x + dx * this.speed;
    const newY = this.y + dy * this.speed;

    // Create temporary ship at new position for collision checking
    const tempShip = new Ship(newX, newY);
    tempShip.hits = this.hits;
    tempShip.art = shipArt[0];

    // Check bounds
    if (!tempShip.isWithinBounds(windowWidth, windowHeight)) {
      return false;
    }

    // Check collisions with obstacles at new position
    for (const obstacle of obstacles) {
      if (this.checkCollision(tempShip, obstacle)) {
        // Don't move into collision, but don't take damage here
        // Damage will be handled by the main collision detection system
        return false;
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
    this.art = shipArt[0];
    
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
    if (other.type === "meteor" || other.type === "moon" || other.type === "asteroid") {
      console.log(`🔥 Ship took damage from ${other.name}! Health: ${this.getHealthPercentage()}%`);
      this.takeDamage(1);
      
      // Visual feedback - change ship art immediately
      this.art = shipArt[0];
    }
  }

  // Get current health percentage
  getHealthPercentage() {
    return ((this.maxHits - this.hits) / this.maxHits) * 100;
  }
}