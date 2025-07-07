// Obstacle.js - Game obstacles like meteors and moons

import { GameObject } from './GameObject.js';
import { meteorArt, moonArt } from './assets.js';

export class Obstacle extends GameObject {
  constructor(x, y, name, art, color) {
    super(x, y, art, color);
    this.name = name;
  }
}

export class Meteor extends Obstacle {
  constructor(x, y) {
    super(x, y, "meteor", meteorArt, "gray");
  }
}

export class Moon extends Obstacle {
  constructor(x, y) {
    super(x, y, "moon", moonArt, "yellow");
  }
}