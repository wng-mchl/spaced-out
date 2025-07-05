import * as ROT from "rot-js";

const windowWidth = 224, windowHeight = 68

const display = new ROT.Display({ width: windowWidth, height: windowHeight });
document.body.appendChild(display.getContainer());

// Ship
let ship = {
  x: 2,
  y: 8,
  hits: 0
};


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



import { shipArt, meteorArt, moonArt, background1 } from "./assets";

// background drawing
function drawBackground() {
  for (let y = 0; y < windowHeight; y++) {
    const line = background1[y % background1.length]; // Wrap vertically if needed

    for (let x = 0; x < windowWidth; x++) {
      const sourceX = (x + scrollOffset) % line.length; // Wrap horizontally
      const ch = line[sourceX];
      display.draw(x, y, ch, "#666", "#000");
    }
  }
}

// background animation and scrolling 
let scrollOffset = 0;
setInterval(() => {
  scrollOffset = (scrollOffset + 1) % background1[0].length;
  drawMap(); // This should call drawBackground + drawObjects
}, 25); // Adjust speed/fps (ms) as needed



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
  drawObject(shipArt[ship.hits ], ship.x, ship.y);
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

function getShipDimensions() {
  const currentArt = shipArt[ship.hits]
  
  return {
    height : currentArt.length,
    width :currentArt[0].length
  }
}

// Function for ship movement
function moveShip(dx, dy) {
  const newX = ship.x + dx;
  const newY = ship.y + dy;

  // Out of bounds checking
  const { width, height } = getShipDimensions();
  if (newX < 0 || newY < 0 || newX + width > windowWidth || newY + height > windowHeight) return;


  const tempPlayer = {
    x: newX,
    y: newY,
    art: shipArt[ship.hits]
  };

  for (const obj of gameObjects) {
    if (checkCollision(tempPlayer, obj)) {
      if (ship.hits == 0) 
      {
        ship.hits += 1
      }
      return; // prevent move or trigger game over
    }
  }

  ship.x = newX;
  ship.y = newY;

};


const keysPressed = {}; 

window.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

function gameLoop() {
  if (keysPressed["ArrowUp"]) moveShip(0, -1);
  if (keysPressed["ArrowDown"]) moveShip(0, 1);
  if (keysPressed["ArrowLeft"]) moveShip(-1, 0);
  if (keysPressed["ArrowRight"]) moveShip(1, 0);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);




