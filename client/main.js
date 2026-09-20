import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { Game } from "./game.js";

const game = new Game();

window.hiveGame = game;

game.start();
