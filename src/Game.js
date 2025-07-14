// Game.js - Main game controller with responsive design and dynamic obstacles

import { Ship } from './Ship.js';
import { Meteor, Moon, Asteroid } from './Obstacle.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';
import { ResponsiveGame } from './ResponsiveGame.js';
import { MobileControls } from './MobileControls.js';
import { ObstacleSpawner } from './ObstacleSpawner.js';

export class Game extends ResponsiveGame {
  constructor(display) {
    super(); // Initialize responsive system

    this.display = display;
    this.updateDisplaySize(); // Set initial size

    // Initialize game systems
    this.renderer = new Renderer(display, this.windowWidth, this.windowHeight);
    this.inputHandler = new InputHandler(this.currentDimensions.isMobile);

    // Mobile controls
    this.mobileControls = null;
    this.setupMobileControls();

    // Game state
    this.gameState = "playing";
    this.score = 0;
    this.lastTime = 0;
    this.lastBackgroundUpdate = 0;
    this.backgroundUpdateInterval = 25;
    this.lastObstacleCount = 0; // Track obstacles for scoring
    this.collisionDebugMode = false; // Enable collision debugging

    // Initialize game objects
    this.initializeGame();

    // Start game loop
    this.startGameLoop();

    // Apply initial styling
    this.applyResponsiveStyles();
  }

  updateDisplaySize() {
    const dims = this.getDimensions();
    this.windowWidth = dims.width;
    this.windowHeight = dims.height;

    console.log('Updating display size:', dims);

    // Resize the ROT.js display with proper font sizing
    this.display.setOptions({
      width: this.windowWidth,
      height: this.windowHeight,
      fontSize: dims.fontSize,
      fontFamily: "monospace",
      spacing: 1.0
    });

    // Apply CSS styling to the display container
    const container = this.display.getContainer();
    if (dims.isMobile) {
      container.style.fontSize = `${dims.fontSize}px`;
      container.style.lineHeight = `${dims.lineHeight}px`;
    }
  }

  setupMobileControls() {
    if (this.currentDimensions.isMobile) {
      this.mobileControls = new MobileControls(document.body);
      this.inputHandler.setMobileControls(this.mobileControls);
      this.mobileControls.show();
    }
  }

  applyResponsiveStyles() {
    const container = this.display.getContainer();
    const styles = this.getContainerStyles();

    Object.assign(container.style, styles);
    container.classList.add('game-display');
  }

  // Override the resize handler from ResponsiveGame
  onResize(newDimensions) {
    const wasPlaying = this.gameState === "playing";
    this.gameState = "paused"; // Pause during resize

    // Update display
    this.updateDisplaySize();

    // Update renderer
    this.renderer = new Renderer(this.display, this.windowWidth, this.windowHeight);

    // Update obstacle spawner dimensions
    if (this.obstacleSpawner) {
      this.obstacleSpawner.updateDimensions(this.windowWidth, this.windowHeight);
    }

    // Update mobile controls
    const needsMobile = newDimensions.isMobile;
    const hasMobile = !!this.mobileControls;

    if (needsMobile && !hasMobile) {
      // Add mobile controls
      this.setupMobileControls();
    } else if (!needsMobile && hasMobile) {
      // Remove mobile controls
      this.mobileControls.destroy();
      this.mobileControls = null;
    }

    // Update input handler
    this.inputHandler.setMobileMode(needsMobile);
    if (this.mobileControls) {
      this.inputHandler.setMobileControls(this.mobileControls);
    }

    // Reposition game objects to fit new screen
    this.repositionGameObjects();

    // Apply new styles
    this.applyResponsiveStyles();

    // Resume if was playing
    if (wasPlaying) {
      this.gameState = "playing";
    }

    console.log('Game resized to:', newDimensions);
  }

  repositionGameObjects() {
    // Keep ship in safe position
    const shipDims = this.ship.getDimensions();
    this.ship.x = Math.min(this.ship.x, this.windowWidth - shipDims.width);
    this.ship.y = Math.min(this.ship.y, this.windowHeight - shipDims.height);

    // Reposition obstacles to stay on screen
    for (const obstacle of this.obstacles) {
      const obsDims = obstacle.getDimensions();
      obstacle.x = Math.min(obstacle.x, this.windowWidth - obsDims.width);
      obstacle.y = Math.min(obstacle.y, this.windowHeight - obsDims.height);
    }

    this.updateGameObjects();
  }

  initializeGame() {
    // Create ship (start further left to give dodging room)
    this.ship = new Ship(5, Math.floor(this.windowHeight / 2));

    // Start with empty obstacles array (they'll be spawned dynamically)
    this.obstacles = [];

    // Initialize obstacle spawner
    this.obstacleSpawner = new ObstacleSpawner(this.windowWidth, this.windowHeight);

    // All game objects for rendering
    this.updateGameObjects();

    // Debug info
    const shipDims = this.ship.getDimensions();
    console.log(`🚀 Ship initialized at (${this.ship.x}, ${this.ship.y}) with dimensions ${shipDims.width}x${shipDims.height}`);
    console.log(`🎮 Game area: ${this.windowWidth}x${this.windowHeight}`);
    console.log('🎯 Game initialized with dynamic obstacles - collision detection active');
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
    // Update obstacle spawner (handles spawning and cleanup)
    this.obstacleSpawner.update(performance.now(), this.obstacles);

    // Update all game objects
    for (const obj of this.gameObjects) {
      obj.update(deltaTime);
    }

    // Check collisions between ship and all obstacles every frame
    this.checkCollisions();

    // Update game objects array (obstacles may have been added/removed)
    this.updateGameObjects();

    // Check game over condition
    if (this.ship.isDestroyed() && this.gameState === "playing") {
      this.gameState = "gameOver";
      console.log("Game Over!");
    }

    // Update score based on survival time and obstacles dodged
    // if (this.gameState === "playing") {
    //   // Time-based scoring
    //   this.score += Math.floor(deltaTime / 50);

    //   // Bonus points for dodging obstacles
    //   const currentObstacleCount = this.obstacles.length;
    //   if (currentObstacleCount > this.lastObstacleCount) {
    //     // New obstacles spawned, potential for bonus points
    //     this.lastObstacleCount = currentObstacleCount;
    //   }

    //   // Award points for obstacles that have passed the ship
    //   for (const obstacle of this.obstacles) {
    //     if (obstacle.spawned && !obstacle.passedShip && obstacle.x + obstacle.getDimensions().width < this.ship.x) {
    //       obstacle.passedShip = true;
    //       this.score += 50; // Bonus for dodging
    //       console.log(`Dodged ${obstacle.name}! +50 points`);
    //     }
    //   }
    // }
  }

  // Check collisions between ship and obstacles every frame
  checkCollisions() {
    for (const obstacle of this.obstacles) {
      if (obstacle.type !== 'morse') {
        if (this.isColliding(this.ship, obstacle)) {
          // Mark obstacle as having hit to prevent multiple damage
          if (!obstacle.hasHitShip) {
            obstacle.hasHitShip = true;
            this.ship.onCollision(obstacle);
            console.log(`💥 Ship hit by ${obstacle.name} at (${Math.round(obstacle.x)}, ${Math.round(obstacle.y)})!`);

            // Debug info
            console.log(`Ship position: (${Math.round(this.ship.x)}, ${Math.round(this.ship.y)})`);
            console.log(`Obstacle position: (${Math.round(obstacle.x)}, ${Math.round(obstacle.y)})`);

            // Visual feedback
            if (navigator.vibrate) {
              navigator.vibrate(200); // Haptic feedback on mobile
            }
          }
        }
      }

    }
  }

  // Simple and reliable collision detection
  isColliding(obj1, obj2) {
    const dims1 = obj1.getDimensions();
    const dims2 = obj2.getDimensions();

    // Get bounding boxes
    const box1 = {
      left: Math.round(obj1.x),
      right: Math.round(obj1.x + dims1.width),
      top: Math.round(obj1.y),
      bottom: Math.round(obj1.y + dims1.height)
    };

    const box2 = {
      left: Math.round(obj2.x),
      right: Math.round(obj2.x + dims2.width),
      top: Math.round(obj2.y),
      bottom: Math.round(obj2.y + dims2.height)
    };

    // Check if bounding boxes overlap
    const collision = !(box1.right <= box2.left ||
      box1.left >= box2.right ||
      box1.bottom <= box2.top ||
      box1.top >= box2.bottom);

    // Debug logging for the first few frames to see what's happening
    if (Math.random() < 0.01) { // Only log 1% of the time to avoid spam
      console.log(`Collision check: Ship(${box1.left},${box1.top},${box1.right},${box1.bottom}) vs ${obj2.name}(${box2.left},${box2.top},${box2.right},${box2.bottom}) = ${collision}`);
    }

    return collision;
  }

  render() {
    this.renderer.clear();
    this.renderer.render(this.gameObjects);

    // Get difficulty info for UI
    const difficultyInfo = this.obstacleSpawner ? this.obstacleSpawner.getDifficultyInfo() : null;
    this.renderer.drawUI(this.ship, this.score, difficultyInfo);

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
      // const finalScore = `Final Score: ${this.score}`;
      const difficultyInfo = this.obstacleSpawner ? this.obstacleSpawner.getDifficultyInfo() : null;
      const levelReached = difficultyInfo ? `Level Reached: ${difficultyInfo.level}` : "";
      const restartText = "Press R to restart";

      // Draw game over title
      let startX = centerX - Math.floor(gameOverText.length / 2);
      for (let i = 0; i < gameOverText.length; i++) {
        this.display.draw(startX + i, centerY - 3, gameOverText[i], "#f00", "#000");
      }

      // Draw final score
      // startX = centerX - Math.floor(finalScore.length / 2);
      // for (let i = 0; i < finalScore.length; i++) {
      //   this.display.draw(startX + i, centerY - 1, finalScore[i], "#fff", "#000");
      // }

      // Draw level reached (if available)
      if (levelReached && this.windowHeight > 20) {
        startX = centerX - Math.floor(levelReached.length / 2);
        for (let i = 0; i < levelReached.length; i++) {
          this.display.draw(startX + i, centerY, levelReached[i], "#ff0", "#000");
        }
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
    this.lastObstacleCount = 0;

    // Reset obstacle spawner
    if (this.obstacleSpawner) {
      this.obstacleSpawner.reset();
    }

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