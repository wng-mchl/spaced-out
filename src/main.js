import * as ROT from "rot-js";

const windowWidth = 40, windowHeight = 20

const display = new ROT.Display({ width: windowWidth, height: windowHeight });
document.body.appendChild(display.getContainer());

// Ship
let ship = {
  x: 2,
  y: 8
};

const shipArt = [
  "   __       ",
  "   \\ \\_____ ",
  "###[==_____>",
  "   /_/      "
];
const shipHeight = 4, shipWidth = 12;


// Objects
const meteorArt = [
  " .-. ",
  "(   )",
  " `-' "
];

const gameObjects = [
  {
    name: "meteor",
    x: 30,
    y: 10,
    art: meteorArt,
    color: "gray"
  }
];

function drawBackground() {
  for (let x = 0; x < 40; x++) {
    for (let y = 0; y < 20; y++) {
      display.draw(x, y, ".", "#666", "#000");
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

  // Meteor
  drawObject(meteorArt, 30, 10);

  // Ship
  drawObject(shipArt, ship.x, ship.y);
};

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


// Key map for arrow key controls
const keyMap = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
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


// Key activation
window.addEventListener("keydown", (e) => {

  if (!(e.key in keyMap)) return;

  const [dx, dy] = keyMap[e.key];

  moveShip(dx, dy);
});
