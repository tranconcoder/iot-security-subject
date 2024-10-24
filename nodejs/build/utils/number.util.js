"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomIntFromInterval = randomIntFromInterval;
function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
