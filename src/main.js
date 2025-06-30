import * as ROT from "rot-js";

const display = new ROT.Display({ width: 40, height: 20 });
document.body.appendChild(display.getContainer());

let playerX = 10, playerY = 10;

function drawMap() {
  for (let x = 0; x < 40; x++) {
    for (let y = 0; y < 20; y++) {
      display.draw(x, y, ".", "#666", "#000");
    }
  }
}

function drawPlayer() {
  display.draw(playerX, playerY, "@", "yellow", "black");
}

drawMap();
drawPlayer();

window.addEventListener("keydown", (e) => {
  const keyMap = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
  };

  if (!(e.key in keyMap)) return;

  display.draw(playerX, playerY, ".", "#666", "#000");

  const [dx, dy] = keyMap[e.key];
  playerX = Math.max(0, Math.min(39, playerX + dx));
  playerY = Math.max(0, Math.min(19, playerY + dy));

  drawPlayer();
});
