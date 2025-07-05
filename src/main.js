import * as ROT from "rot-js";

const windowWidth = 224, windowHeight = 68

const display = new ROT.Display({ width: windowWidth, height: windowHeight });
document.body.appendChild(display.getContainer());

// Ship
let ship = {
  x: 2,
  y: 8
};



const shipHeight = shipArt.length;
const shipWidth = shipArt[0].length;


export const gameObjects = [
  {
    name: "meteor",
    x: 30,
    y: 10,
    art: meteorArt,
    color: "gray"
  },
  {
    name: "moon",
    x: 25,
    y: 2,
    art: moonArt,
    color: "yellow"
  },
];


import { shipArt, meteorArt, moonArt } from "./assets";


function drawBackground() {
  for (let x = 0; x < windowWidth; x++) {
    for (let y = 0; y < windowHeight; y++) {
      display.draw(x, y, ".", "#666", "#000");``
    }
  }
};

function drawObject(asciiArt, x, y, color = "white") {
  for (let row = 0; row < asciiArt.length; row++) {
    for (let col = 0; col < asciiArt[row].length; col++) {
      const ch = asciiArt[row][col];
      if (ch !== " ") {
        display.draw(x + col, y + row, ch, color);
      }
    }
  }
};


function drawMap() {
  drawBackground();

  // properly loop through all game objects using the predefined array
  for (const obj of gameObjects) {
    drawObject(obj.art, obj.x, obj.y, obj.color);
  }

  // draws ship last as its the only one that actually updates
  drawObject(shipArt, ship.x, ship.y);
}


drawMap();


// Collision detection
function getOccupiedCells(obj) {
  const cells = [];
  for (let row = 0; row < obj.art.length; row++) {
    for (let col = 0; col < obj.art[row].length; col++) {
      const ch = obj.art[row][col];
      if (ch !== " ") {
        const x = obj.x + col;
        const y = obj.y + row;
        cells.push(`${x},${y}`);
      }
    }
  }
  return cells;
};

function checkCollision(objA, objB) {
  const cellsA = new Set(getOccupiedCells(objA));
  const cellsB = getOccupiedCells(objB);

  for (const cell of cellsB) {
    if (cellsA.has(cell)) return true;
  }

  return false;
};


// Function for ship movement
function moveShip(dx, dy) {
  const newX = ship.x + dx;
  const newY = ship.y + dy;

  // Out of bounds checking
  if (newX < 0) return;
  if (newY < 0) return;
  if (newX + shipWidth > windowWidth) return;
  if (newY + shipHeight > windowHeight) return;

  const tempPlayer = {
    x: newX,
    y: newY,
    art: shipArt
  };

  for (const obj of gameObjects) {
    if (checkCollision(tempPlayer, obj)) {
      return; // prevent move or trigger game over
    }
  }

  ship.x = newX;
  ship.y = newY;

  drawMap();
};

// Key map for arrow key controls
const keyMap = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};


// Key activation
window.addEventListener("keydown", (e) => {

  if (!(e.key in keyMap)) return;

  const [dx, dy] = keyMap[e.key];

  moveShip(dx, dy);
});


