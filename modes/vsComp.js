const rl = require('readline-sync');
const { Chess } = require('chess.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const vsComp = async engine => {
    do {
        const chess = new Chess();
        console.log('Range: 1350 - 2850, Default: 2000');
        const elo = rl.questionInt('Engine ELO: ', {defaultInput: 2000});
        console.log('Default: 3 seconds');
        const thinkTimeInput = rl.questionFloat('Number of seconds for engine to think: ', {defaultInput: 3});
        const thinkTime = thinkTimeInput * 1000;
        const colorIndex = rl.keyInSelect(['White', 'Black', 'Random'], 'Play as', {cancel: false});
        engine.setOptions({
            UCI_LimitStrength: true,
            UCI_Elo: elo
        });
        console.log('Input q as move at any time to quit.');
        let i = colorIndex === 0 || (colorIndex === 2 && Math.random() > 0.5) ? 0 : 1;
        game: do {
            if (chess.in_checkmate()) {
                const colorToMove = chess.turn();
                console.log(`Checkmate. ${colorToMove === 'b' ? 'White' : 'Black'} wins.`);
                break game;
            }
            if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition()) {
                console.log('Game is drawn.');
                break game;
            }
            if (i % 2 === 0) {
                console.log(chess.ascii());
                player: do {
                    let proposedMove = rl.question('Move: ');
                    if (proposedMove === 'q') {
                        console.log('Player resigned.');
                        break game;
                    }
                    if (chess.moves().indexOf(proposedMove) === -1) console.log(`${proposedMove} is an invalid move.`);
                    else {
                        chess.move(proposedMove);
                        break player;
                    }
                } while (true);
            } else {
                engine.analyze(chess.fen(), thinkTime);
                await delay(thinkTime + 500);
                chess.move(engine.bestMove, {sloppy: true});
                console.log(`Move: ${[...chess.history()].pop()}`);
            }
            i++;
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

module.exports = vsComp;
