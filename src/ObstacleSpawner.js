// ObstacleSpawner.js - Manages dynamic obstacle spawning and difficulty

import { Meteor, Moon, Asteroid } from './Obstacle.js';

export class ObstacleSpawner {
  constructor(windowWidth, windowHeight) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;

    // Spawning parameters
    this.baseSpawnRate = 2000;     // Base time between spawns (ms)
    this.minSpawnRate = 500;      // Minimum time between spawns
    this.lastSpawnTime = 0;
    this.nextSpawnDelay = this.baseSpawnRate;

    // Difficulty scaling
    this.difficultyLevel = 1;
    this.difficultyIncreaseInterval = 10000; // Increase difficulty every 10 seconds
    this.lastDifficultyIncrease = 0;

    // Obstacle types and their spawn weights
    this.obstacleTypes = [
      { type: 'meteor', weight: 40, minSpeed: 0.2, maxSpeed: 0.3 },
      { type: 'moon', weight: 20, minSpeed: 0.1, maxSpeed: 0.2 },
      { type: 'asteroid', weight: 30, minSpeed: 0.3, maxSpeed: 0.4 }
    ];

    console.log('ObstacleSpawner initialized');
  }

  update(currentTime, obstacles) {
    // Check if it's time to increase difficulty
    if (currentTime - this.lastDifficultyIncrease >= this.difficultyIncreaseInterval) {
      this.increaseDifficulty();
      this.lastDifficultyIncrease = currentTime;
    }

    // Check if it's time to spawn a new obstacle
    if (currentTime - this.lastSpawnTime >= this.nextSpawnDelay) {
      const newObstacle = this.spawnObstacle();
      if (newObstacle) {
        obstacles.push(newObstacle);
        this.lastSpawnTime = currentTime;
        this.scheduleNextSpawn();
      }
    }

    // Remove obstacles that have moved off-screen (left side)
    const initialLength = obstacles.length;
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      if (obstacle.x + obstacle.getDimensions().width < 0) {
        obstacles.splice(i, 1);
      }
    }

    // Log when obstacles are removed for debugging
    if (obstacles.length < initialLength) {
      console.log(`Removed ${initialLength - obstacles.length} off-screen obstacles`);
    }
  }

  spawnObstacle() {
    // Choose obstacle type based on weights
    const obstacleType = this.selectObstacleType();
    const obstacleConfig = this.obstacleTypes.find(type => type.type === obstacleType.type);

    // Random spawn position (right edge, random Y)
    const spawnX = this.windowWidth + 5; // Slightly off-screen to the right
    const maxY = this.windowHeight - 10; // Leave some margin
    const spawnY = Math.random() * maxY;

    // Random speed based on obstacle type and difficulty
    const speed = this.calculateSpeed(obstacleConfig);

    let obstacle;
    switch (obstacleType.type) {
      case 'meteor':
        obstacle = new Meteor(spawnX, spawnY);
        break;
      case 'moon':
        obstacle = new Moon(spawnX, spawnY);
        break;
      case 'asteroid':
        obstacle = new Asteroid(spawnX, spawnY);
        break;
      default:
        obstacle = new Meteor(spawnX, spawnY);
    }

    // Set the speed and collision tracking
    obstacle.speed = speed;
    obstacle.spawned = true;      // Mark as dynamically spawned
    obstacle.hasHitShip = false;  // Track if this obstacle has already hit the ship
    obstacle.passedShip = false;  // Track if this obstacle has passed the ship for scoring

    console.log(`Spawned ${obstacleType.type} at (${spawnX}, ${Math.round(spawnY)}) with speed ${speed}`);
    return obstacle;
  }

  selectObstacleType() {
    const totalWeight = this.obstacleTypes.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;

    for (const type of this.obstacleTypes) {
      random -= type.weight;
      if (random <= 0) {
        return type;
      }
    }

    // Fallback
    return this.obstacleTypes[0];
  }

  calculateSpeed(obstacleConfig) {
    const baseSpeed = obstacleConfig.minSpeed +
      Math.random() * (obstacleConfig.maxSpeed - obstacleConfig.minSpeed);

    // Apply difficulty multiplier
    const difficultyMultiplier = 1 + (this.difficultyLevel - 1) * 0.3;
    return baseSpeed * difficultyMultiplier;
  }

  scheduleNextSpawn() {
    // Calculate next spawn delay based on difficulty
    const difficultyFactor = Math.max(0.1, 1 - (this.difficultyLevel - 1) * 0.15);
    this.nextSpawnDelay = Math.max(
      this.minSpawnRate,
      this.baseSpawnRate * difficultyFactor * (0.7 + Math.random() * 0.6)
    );
  }

  increaseDifficulty() {
    this.difficultyLevel++;
    console.log(`🔥 Difficulty increased to level ${this.difficultyLevel}!`);

    // You could add visual/audio feedback here
    // Maybe spawn a special effect or play a sound
  }

  // Update dimensions when screen resizes
  updateDimensions(windowWidth, windowHeight) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
  }

  // Get current difficulty info for UI
  getDifficultyInfo() {
    return {
      level: this.difficultyLevel,
      spawnRate: Math.round(this.nextSpawnDelay),
      obstaclesTypes: this.obstacleTypes.length
    };
  }

  // Reset for new game
  reset() {
    this.difficultyLevel = 1;
    this.lastSpawnTime = 0;
    this.lastDifficultyIncrease = 0;
    this.nextSpawnDelay = this.baseSpawnRate;
    console.log('ObstacleSpawner reset');
  }
}