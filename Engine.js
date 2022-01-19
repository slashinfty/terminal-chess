class Engine {
    constructor(sf) {
        this.engine = sf;
        this.uciok = false;
        this.bestMove = undefined;
        this.score = 0;
        this.engine.addMessageListener(line => {
            if (line.startsWith('info depth') && (line.includes('cp') || line.includes('mate'))) {
                const fullMatch = /(cp|mate)\s?\-?\d+/.exec(line)[0];
                const scoreMatch = /\-?\d+/.exec(fullMatch)[0];
                this.score = `${fullMatch.startsWith('mate') ? '#' : ''}${fullMatch.startsWith('cp') ? parseInt(scoreMatch) / 100 : parseInt(scoreMatch)}`;
            } else if (line.startsWith('bestmove')) {
                const move = /(?<=bestmove\s)\S+/.exec(line)[0];
                this.bestMove = move;
            } else if (line === 'uciok') this.uciok = true;
        });
    }

    post(message) {
        this.engine.postMessage(message);
    }

    getMove(position, thinkTime) {
        if (!this.uciok) this.post('uci');
        this.post(`position fen ${position}`);
        this.post('go infinite');
        setTimeout(() => this.post('stop'), thinkTime);
    }
}

module.exports = Engine;