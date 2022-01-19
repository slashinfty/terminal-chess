const rl = require('readline-sync');

const Engine = require('./Engine');
const vsComp = require('./modes/vsComp');
const vsHuman = require('./modes/vsHuman');

let Stockfish;
let myEngine;

// Set up Stockfish
try {
    const INIT_ENGINE = require("stockfish");
    const wasmPath = require("path").join(__dirname, "node_modules/stockfish/src/stockfish.wasm");
    const mod = { locateFile: path => path.indexOf(".wasm") > -1 ? wasmPath : __filename };
    Stockfish = INIT_ENGINE();
    try {
        Stockfish(mod).then(sf => {
            myEngine = new Engine(sf);
            start();
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
} catch (e) {}

const start = () => {
    const index = rl.keyInSelect(['vs Comp', 'vs Human'], 'Select', {cancel: 'Quit'});
    if (index === 0) vsComp(myEngine);
    else if (index === 1) vsHuman(myEngine);
    else process.exit(1);
}
