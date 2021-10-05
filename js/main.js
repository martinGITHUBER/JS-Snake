import Game from "./game.js";
window.game = new Game(document.getElementById("canvas").getContext("2d"));
game.start();
