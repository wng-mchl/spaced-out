import * as ROT from "rot-js";

const windowWidth = 40, windowHeight = 20

const display = new ROT.Display({ width: windowWidth, height: windowHeight });
document.body.appendChild(display.getContainer());

let player = {
  x: 10,
  y: 10
};

const shipArt = [
  "   __       ",
  "   \\ \\_____ ",
  "###[==_____>",
  "   /_/      "
];
// Ship height = 4, width = 12
const shipHeight = 4, shipWidth = 12;

function drawShip(x, y) {
  for (let row = 0; row < shipArt.length; row++) {
    const line = shipArt[row];
    for (let col = 0; col < line.length; col++) {
      let ch = line[col];
      if (ch !== " ") {
        display.draw(x + col, y + row, ch, "white");
      }
    }
  }
};

function drawBackground() {
  for (let x = 0; x < 40; x++) {
    for (let y = 0; y < 20; y++) {
      display.draw(x, y, ".", "#666", "#000");
    }
  }
};

function drawMap() {
  drawBackground();
  drawShip(player.x, player.y);
};

drawMap();

// Key map for arrow key controls
const keyMap = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};


// Function for ship movement
function moveShip(dx, dy) {
  const newX = player.x + dx;
  const newY = player.y + dy;

  // Out of bounds checking
  if (newX < 0) return;
  if (newY < 0) return;
  if (newX + shipWidth > windowWidth) return;
  if (newY + shipHeight > windowHeight) return;

  player.x = newX;
  player.y = newY;

  drawMap();
};

// Key activation
window.addEventListener("keydown", (e) => {

  if (!(e.key in keyMap)) return;

  const [dx, dy] = keyMap[e.key];

  moveShip(dx, dy);
});
