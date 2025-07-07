// main.js - Game entry point

import * as ROT from "rot-js";
import { Game } from './Game.js';

// Game configuration
const WINDOW_WIDTH = 224;
const WINDOW_HEIGHT = 68;

// Initialize display
const display = new ROT.Display({ 
  width: WINDOW_WIDTH, 
  height: WINDOW_HEIGHT,
  fontSize: 12,
  fontFamily: "monospace"
});

// Add display to DOM
document.body.appendChild(display.getContainer());

// Initialize and start the game
const game = new Game(display, WINDOW_WIDTH, WINDOW_HEIGHT);

// Make game globally accessible for debugging
window.game = game;

console.log("Space Game initialized!");
console.log("Controls: Arrow keys (or WASD) to move, P to pause, R to restart when game over");