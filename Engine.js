class Engine {
    constructor(sf) {
        this.engine = sf;
        this.uciok = false;
        this.bestMove = undefined;
        this.currentMove = undefined;
        this.score = 0;
        this.engine.addMessageListener(line => {
            if (line.startsWith('info depth') && (line.includes('cp') || line.includes('mate'))) {
                const fullMatch = /(cp|mate)\s?\-?\d+/.exec(line)[0];
                const scoreMatch = /\-?\d+/.exec(fullMatch)[0];
                this.score = `${fullMatch.startsWith('mate') ? '#' : ''}${fullMatch.startsWith('cp') ? parseInt(scoreMatch) / 100 : parseInt(scoreMatch)}`;
                if (line.includes('pv')) {
                    const move = /(?<=\spv\s)\S+/.exec(line)[0];
                    this.currentMove = move;
                }
            } else if (line.startsWith('bestmove')) {
                const move = /(?<=bestmove\s)\S+/.exec(line)[0];
                this.bestMove = move;
            } else if (line === 'uciok') this.uciok = true;
        });
    }

    post(message) {
        if (!this.uciok) this.engine.postMessage('uci');
        this.engine.postMessage(message);
    }
    
    setOptions(options) {
        for (const opt in options) this.post(`option name ${opt} value ${options[opt]}`);
    }

    analyze(position, thinkTime, interval = false) {
        this.currentMove = undefined;
        this.score = 0;
        this.post(`position fen ${position}`);
        this.post('go infinite');
        let int;
        if (interval) {
            int = setInterval(() => {
                console.log(`${this.currentMove !== undefined ? `Current Move: ${this.currentMove} Score: ${this.score}` : ''}`);
            }, 500);
        }
        setTimeout(() => {
            this.post('stop');
            if (interval) clearInterval(int);
        }, thinkTime);
        
    }
}

module.exports = Engine;
