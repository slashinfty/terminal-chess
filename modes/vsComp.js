const rl = require('readline-sync');
const { Chess } = require('chess.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const vsComp = async engine => {
    const chess = new Chess();
    /*engine.getMove('rr4k1/7b/4p1pP/8/1q1n4/pPNP4/K1Q1BP2/3R3R w - - 4 29', 5000);
    await delay(5500);
    console.log(`best move: ${engine.bestMove} score: ${engine.score}`);*/
}

module.exports = vsComp;