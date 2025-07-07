// InputHandler.js - Manages all user input

export class InputHandler {
  constructor() {
    this.keysPressed = {};
    this.keysJustPressed = {};
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("keydown", (e) => {
      // Only set justPressed if it wasn't already pressed
      if (!this.keysPressed[e.key]) {
        this.keysJustPressed[e.key] = true;
      }
      this.keysPressed[e.key] = true;
      e.preventDefault(); // Prevent page scrolling with arrow keys
    });

    window.addEventListener("keyup", (e) => {
      this.keysPressed[e.key] = false;
      this.keysJustPressed[e.key] = false;
      e.preventDefault();
    });
  }

  // Call this at the end of each frame to clear "just pressed" states
  update() {
    // Clear all "just pressed" states after they've been processed
    for (const key in this.keysJustPressed) {
      this.keysJustPressed[key] = false;
    }
  }

  // Check if a key is currently pressed
  isKeyPressed(key) {
    return !!this.keysPressed[key];
  }

  // Check if a key was just pressed this frame
  isKeyJustPressed(key) {
    return !!this.keysJustPressed[key];
  }

  // Get movement direction based on pressed keys
  getMovementDirection() {
    let dx = 0;
    let dy = 0;

    if (this.isKeyPressed("ArrowLeft") || this.isKeyPressed("a") || this.isKeyPressed("A")) {
      dx -= 1;
    }
    if (this.isKeyPressed("ArrowRight") || this.isKeyPressed("d") || this.isKeyPressed("D")) {
      dx += 1;
    }
    if (this.isKeyPressed("ArrowUp") || this.isKeyPressed("w") || this.isKeyPressed("W")) {
      dy -= 1;
    }
    if (this.isKeyPressed("ArrowDown") || this.isKeyPressed("s") || this.isKeyPressed("S")) {
      dy += 1;
    }

    return { dx, dy };
  }

  // Check for other action keys (using "just pressed" for single-trigger actions)
  isActionTriggered(action) {
    switch (action) {
      case "shoot":
        return this.isKeyJustPressed(" ") || this.isKeyJustPressed("Space");
      case "pause":
        return this.isKeyJustPressed("p") || this.isKeyJustPressed("P");
      case "restart":
        return this.isKeyJustPressed("r") || this.isKeyJustPressed("R");
      default:
        return false;
    }
  }

  // Check for continuously pressed action keys
  isActionPressed(action) {
    switch (action) {
      case "shoot":
        return this.isKeyPressed(" ") || this.isKeyPressed("Space");
      case "pause":
        return this.isKeyPressed("p") || this.isKeyPressed("P");
      case "restart":
        return this.isKeyPressed("r") || this.isKeyPressed("R");
      default:
        return false;
    }
  }

  // Get all currently pressed keys (for debugging)
  getPressedKeys() {
    return Object.keys(this.keysPressed).filter(key => this.keysPressed[key]);
  }
}