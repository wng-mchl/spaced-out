// GameObject.js - Base class for all game entities

export class GameObject {
  constructor(x, y, art, color = "white") {
    this.x = x;
    this.y = y;
    this.art = art;
    this.color = color;
    this.active = true;
  }

  // Get all occupied cells for collision detection
  getOccupiedCells() {
    const cells = [];
    for (let row = 0; row < this.art.length; row++) {
      for (let col = 0; col < this.art[row].length; col++) {
        const ch = this.art[row][col];
        if (ch !== " ") {
          const x = this.x + col;
          const y = this.y + row;
          cells.push(`${x},${y}`);
        }
      }
    }
    return cells;
  }

  // Get dimensions of the object
  getDimensions() {
    return {
      width: this.art[0].length,
      height: this.art.length
    };
  }

  // Check if object is within bounds
  isWithinBounds(windowWidth, windowHeight) {
    const { width, height } = this.getDimensions();
    return this.x >= 0 && 
           this.y >= 0 && 
           this.x + width <= windowWidth && 
           this.y + height <= windowHeight;
  }

  // Update method to be overridden by subclasses
  update(deltaTime) {
    // Base implementation does nothing
  }

  // Collision response - to be overridden
  onCollision(other) {
    // Base implementation does nothing
  }
}