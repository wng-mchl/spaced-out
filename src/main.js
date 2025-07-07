// main.js - Responsive game entry point

import * as ROT from "rot-js";
import { Game } from './Game.js';

// Initialize display with temporary size (will be resized by ResponsiveGame)
const display = new ROT.Display({ 
  width: 100, 
  height: 50,
  fontSize: 12,
  fontFamily: "monospace"
});

// Add display to DOM
const gameContainer = document.querySelector('.game-container');
if (gameContainer) {
  gameContainer.appendChild(display.getContainer());
} else {
  document.body.appendChild(display.getContainer());
}

// Initialize and start the responsive game
const game = new Game(display);

// Make game globally accessible for debugging
window.game = game;

// Log device info
const dims = game.getDimensions();
console.log("Space Game initialized!");
console.log(`Device: ${dims.isMobile ? 'Mobile' : 'Desktop'}`);
console.log(`Screen size: ${dims.width}x${dims.height}`);
console.log(`Controls: ${dims.isMobile ? 'Touch joystick + buttons' : 'Arrow keys (or WASD) + P/R'}`);

// Performance monitoring
let frameCount = 0;
let lastFpsTime = performance.now();

function monitorPerformance() {
  frameCount++;
  const now = performance.now();
  
  if (now - lastFpsTime >= 1000) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    console.log(`FPS: ${fps}`);
    frameCount = 0;
    lastFpsTime = now;
  }
  requestAnimationFrame(monitorPerformance);
}

// Start performance monitoring in dev mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  monitorPerformance();
}