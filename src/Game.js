// Game.js - Main game controller

import { Ship } from './Ship.js';
import { Meteor, Moon } from './Obstacle.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';

export class Game {
  constructor(display, windowWidth, windowHeight) {
    this.display = display;
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    
    // Initialize game systems
    this.renderer = new Renderer(display, windowWidth, windowHeight);
    this.inputHandler = new InputHandler();
    
    // Game state
    this.gameState = "playing"; // "playing", "paused", "gameOver"
    this.score = 0;
    this.lastTime = 0;
    this.lastBackgroundUpdate = 0;
    this.backgroundUpdateInterval = 25; // ms between background updates
    
    // Initialize game objects
    this.initializeGame();
    
    // Start game loop (background animation now handled in main loop)
    this.startGameLoop();
  }

  initializeGame() {
    // Create ship
    this.ship = new Ship(2, 8);
    
    // Create obstacles
    this.obstacles = [
      new Meteor(30, 10),
      new Moon(25, 2)
    ];
    
    // All game objects for rendering
    this.updateGameObjects();
  }

  updateGameObjects() {
    this.gameObjects = [this.ship, ...this.obstacles];
  }

  // Main game loop
  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Always handle input (for pause/restart functionality)
    this.handleInput();
    
    // Update background scrolling (independent of game state)
    if (currentTime - this.lastBackgroundUpdate >= this.backgroundUpdateInterval) {
      if (this.gameState === "playing") {
        this.renderer.updateScroll();
      }
      this.lastBackgroundUpdate = currentTime;
    }
    
    // Only update game objects when playing
    if (this.gameState === "playing") {
      this.update(deltaTime);
    }
    
    // Always render (to show pause/game over screens)
    this.render();
    
    // Continue loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  handleInput() {
    // Handle movement (only when playing)
    if (this.gameState === "playing") {
      const { dx, dy } = this.inputHandler.getMovementDirection();
      if (dx !== 0 || dy !== 0) {
        this.ship.move(dx, dy, this.windowWidth, this.windowHeight, this.obstacles);
      }
    }

    // Handle other actions (use triggered for single-press actions)
    if (this.inputHandler.isActionTriggered("pause")) {
      this.togglePause();
    }
    
    if (this.inputHandler.isActionTriggered("restart") && this.gameState === "gameOver") {
      this.restart();
    }

    // Update input handler to clear "just pressed" states
    this.inputHandler.update();
  }

  update(deltaTime) {
    // Update all game objects
    for (const obj of this.gameObjects) {
      obj.update(deltaTime);
    }

    // Check game over condition
    if (this.ship.isDestroyed() && this.gameState === "playing") {
      this.gameState = "gameOver";
      console.log("Game Over! Final score:", this.score);
    }

    // Update score (simple time-based scoring for now)
    if (this.gameState === "playing") {
      this.score += Math.floor(deltaTime / 100);
    }
  }

  render() {
    this.renderer.clear();
    this.renderer.render(this.gameObjects);
    this.renderer.drawUI(this.ship, this.score);
    
    // Draw game state messages
    this.drawGameStateUI();
  }

  drawGameStateUI() {
    const centerX = Math.floor(this.windowWidth / 2);
    const centerY = Math.floor(this.windowHeight / 2);

    if (this.gameState === "paused") {
      const pauseText = "=== PAUSED ===";
      const continueText = "Press P to continue";
      
      // Draw pause title
      let startX = centerX - Math.floor(pauseText.length / 2);
      for (let i = 0; i < pauseText.length; i++) {
        this.display.draw(startX + i, centerY - 1, pauseText[i], "#ff0", "#000");
      }
      
      // Draw continue instruction
      startX = centerX - Math.floor(continueText.length / 2);
      for (let i = 0; i < continueText.length; i++) {
        this.display.draw(startX + i, centerY + 1, continueText[i], "#ff0", "#000");
      }
      
    } else if (this.gameState === "gameOver") {
      const gameOverText = "=== GAME OVER ===";
      const restartText = "Press R to restart";
      const finalScore = `Final Score: ${this.score}`;
      
      // Draw game over title
      let startX = centerX - Math.floor(gameOverText.length / 2);
      for (let i = 0; i < gameOverText.length; i++) {
        this.display.draw(startX + i, centerY - 2, gameOverText[i], "#f00", "#000");
      }
      
      // Draw final score
      startX = centerX - Math.floor(finalScore.length / 2);
      for (let i = 0; i < finalScore.length; i++) {
        this.display.draw(startX + i, centerY, finalScore[i], "#fff", "#000");
      }
      
      // Draw restart instruction
      startX = centerX - Math.floor(restartText.length / 2);
      for (let i = 0; i < restartText.length; i++) {
        this.display.draw(startX + i, centerY + 2, restartText[i], "#0f0", "#000");
      }
    }
  }

  startGameLoop() {
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      console.log("Game paused");
    } else if (this.gameState === "paused") {
      this.gameState = "playing";
      console.log("Game resumed");
    }
  }

  restart() {
    this.gameState = "playing";
    this.score = 0;
    this.lastTime = 0;
    this.initializeGame();
    console.log("Game restarted!");
  }

  // Add obstacle (for future dynamic obstacle generation)
  addObstacle(obstacle) {
    this.obstacles.push(obstacle);
    this.updateGameObjects();
  }

  // Remove obstacle
  removeObstacle(obstacle) {
    const index = this.obstacles.indexOf(obstacle);
    if (index > -1) {
      this.obstacles.splice(index, 1);
      this.updateGameObjects();
    }
  }
}