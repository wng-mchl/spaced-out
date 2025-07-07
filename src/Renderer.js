// Renderer.js - Handles all drawing operations with responsive support

import { background1 } from './assets.js';

export class Renderer {
  constructor(display, windowWidth, windowHeight) {
    this.display = display;
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    this.scrollOffset = 0;
    
    console.log(`Renderer initialized: ${windowWidth}x${windowHeight}`);
  }

  // Draw the scrolling background
  drawBackground() {
    for (let y = 0; y < this.windowHeight; y++) {
      const line = background1[y % background1.length];

      for (let x = 0; x < this.windowWidth; x++) {
        const sourceX = (x + this.scrollOffset) % line.length;
        const ch = line[sourceX];
        this.display.draw(x, y, ch, "#666", "#000");
      }
    }
  }

  // Draw a single game object
  drawObject(gameObject) {
    if (!gameObject.active) return;

    const { art, x, y, color } = gameObject;
    for (let row = 0; row < art.length; row++) {
      for (let col = 0; col < art[row].length; col++) {
        const ch = art[row][col];
        if (ch !== " ") {
          this.display.draw(x + col, y + row, ch, color);
        }
      }
    }
  }

  // Update scroll offset for background animation
  updateScroll() {
    this.scrollOffset = (this.scrollOffset + 1) % background1[0].length;
  }

  // Clear the display
  clear() {
    this.display.clear();
  }

  // Render the entire game state
  render(gameObjects) {
    this.drawBackground();
    
    // Draw all game objects
    for (const obj of gameObjects) {
      this.drawObject(obj);
    }
  }

  // Draw UI elements (health, score, etc.) with mobile-friendly sizing
  drawUI(ship, score = 0) {
    const health = ship.getHealthPercentage();
    const healthText = `Health: ${Math.round(health)}%`;
    // const scoreText = `Score: ${score}`;
    
    // Health in top-left
    const healthColor = health > 30 ? "#0f0" : (health > 10 ? "#ff0" : "#f00");
    for (let i = 0; i < healthText.length && i < this.windowWidth; i++) {
      this.display.draw(i, 0, healthText[i], healthColor);
    }
    
    // // Draw score in top-right
    // const scoreX = this.windowWidth - scoreText.length;
    // for (let i = 0; i < scoreText.length; i++) {
    //   this.display.draw(scoreX + i, 0, scoreText[i], "#fff");
    // }
  }

  // Update dimensions when screen resizes
  updateDimensions(windowWidth, windowHeight) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    console.log(`Renderer updated: ${windowWidth}x${windowHeight}`);
  }
}