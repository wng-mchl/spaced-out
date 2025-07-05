// assets.js

export const shipArt = [
  "   __       ",
  "   \\ \\_____ ",
  "###[==_____>",
  "   /_/      "
];

export const meteorArt = [
  " .-. ",
  "(   )",
  " `-' "
];

export const moonArt = [
  "   _..    ",
  " '`-. `.  ", 
  "     \\  \\ ", 
  "     |  | ", 
  "     /  / ", 
  " _.-`_.`  ", 
  "  '''     ", 
];

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
  }
];
