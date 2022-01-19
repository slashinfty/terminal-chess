const rl = require('readline-sync');
const { Chess } = require('chess.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const vsHuman = async engine => {
    do {
        const chess = new Chess();
        game: do {
            console.log(chess.ascii());
            const colorToMove = chess.turn();
            if (chess.in_checkmate()) {
                console.log(`Checkmate. ${colorToMove === 'b' ? 'White' : 'Black'} wins.`);
                break game;
            }
            if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition()) {
                console.log('Game is drawn.');
                break game;
            }
            player: do {
                let choice = rl.keyInSelect(['Input Move', 'Get Evaluation'], 'Select', {cancel: 'Quit'});
                if (choice === 0) {
                    let proposedMove = rl.question(`${colorToMove === 'w' ? 'White' : 'Black'} to move: `);
                    if (chess.moves().indexOf(proposedMove) === -1) console.log(`${proposedMove} is an invalid move.`);
                    else {
                        chess.move(proposedMove);
                        engine.post('stop');
                        break player;
                    }
                } else if (choice === 1) {
                    console.log('Default: 3 seconds');
                    let thinkTime = rl.questionFloat('Number of seconds for engine to think: ', {defaultInput: 3});
                    thinkTime *= 1000;
                    engine.analyze(chess.fen(), thinkTime);
                    await delay(thinkTime + 500);
                    chess.move(engine.bestMove, {sloppy: true});
                    console.log(`Best move: ${[...chess.history()].pop()} Score: ${engine.score}`);
                    chess.undo();
                } else {
                    console.log('Game over.');
                    break game;
                }
            } while (true);
        } while (true);
        const save = rl.keyInYN('Save PGN?');
        if (save) {
            const path = require('path').resolve(__dirname, `../${new Date(Date.now()).toISOString()}.pgn`);
            require('fs').writeFileSync(path, chess.pgn());
            console.log(`Saved at ${path}`);
        }
        const bool = rl.keyInYN('Play again?');
        if (!bool) process.exit(1);
    } while (true);
}

module.exports = vsHuman;
