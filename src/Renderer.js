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

  // Draw a single game object with enhanced ship rendering
  drawObject(gameObject) {
    if (!gameObject.active) return;

    let { art, x, y, color } = gameObject;
    
    // Special rendering for ships based on damage state
    if (gameObject.constructor.name === 'Ship') {
      const healthPercent = gameObject.getHealthPercentage();
      if (healthPercent <= 30) {
        color = "#f00"; // Red when heavily damaged
      } else if (healthPercent <= 60) {
        color = "#ff0"; // Yellow when moderately damaged
      } else {
        color = "#0f0"; // Green when healthy
      }
    }
    
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
    
    // Debug: Draw collision boxes (optional, can be toggled)
    if (window.game && window.game.collisionDebugMode) {
      this.drawCollisionBoxes(gameObjects);
    }
  }

  // Debug: Draw bounding boxes for collision detection
  drawCollisionBoxes(gameObjects) {
    for (const obj of gameObjects) {
      if (!obj.active) continue;
      
      const dims = obj.getDimensions();
      const left = Math.round(obj.x);
      const right = Math.round(obj.x + dims.width) - 1;
      const top = Math.round(obj.y);
      const bottom = Math.round(obj.y + dims.height) - 1;
      
      // Draw corners of collision box
      const color = obj.constructor.name === 'Ship' ? "#0ff" : "#f0f";
      
      // Only draw if within screen bounds
      if (left >= 0 && left < this.windowWidth && top >= 0 && top < this.windowHeight) {
        this.display.draw(left, top, "┌", color);
      }
      if (right >= 0 && right < this.windowWidth && top >= 0 && top < this.windowHeight) {
        this.display.draw(right, top, "┐", color);
      }
      if (left >= 0 && left < this.windowWidth && bottom >= 0 && bottom < this.windowHeight) {
        this.display.draw(left, bottom, "└", color);
      }
      if (right >= 0 && right < this.windowWidth && bottom >= 0 && bottom < this.windowHeight) {
        this.display.draw(right, bottom, "┘", color);
      }
    }
  }

  // Draw UI elements (health, score, etc.) with mobile-friendly sizing
  drawUI(ship, score = 0, difficultyInfo = null) {
    const health = ship.getHealthPercentage();
    const healthText = `Health: ${Math.round(health)}%`;
    // const scoreText = `Score: ${score}`;
    
    // Health in top-left
    const healthColor = health > 30 ? "#0f0" : (health > 10 ? "#ff0" : "#f00");
    for (let i = 0; i < healthText.length && i < this.windowWidth; i++) {
      this.display.draw(i, 0, healthText[i], healthColor);
    }
    
    // Score in top-right (but check boundaries)
    // const scoreX = Math.max(0, this.windowWidth - scoreText.length);
    // for (let i = 0; i < scoreText.length && scoreX + i < this.windowWidth; i++) {
    //   this.display.draw(scoreX + i, 0, scoreText[i], "#fff");
    // }
    
    // Difficulty level in top-center (if provided)
    if (difficultyInfo && this.windowHeight > 10) {
      const diffText = `Level ${difficultyInfo.level}`;
      const diffX = Math.floor((this.windowWidth - diffText.length) / 2);
      const diffColor = difficultyInfo.level > 5 ? "#f00" : (difficultyInfo.level > 3 ? "#ff0" : "#0f0");
      
      for (let i = 0; i < diffText.length && diffX + i < this.windowWidth && diffX + i >= 0; i++) {
        this.display.draw(diffX + i, 0, diffText[i], diffColor);
      }
    }
  }

  // Update dimensions when screen resizes
  updateDimensions(windowWidth, windowHeight) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    console.log(`Renderer updated: ${windowWidth}x${windowHeight}`);
  }
}