var Stockfish;
var myEngine;

try {
    var INIT_ENGINE = require("stockfish");
    
    var wasmPath = require("path").join(__dirname, "node_modules/stockfish/src/stockfish.wasm");
    var mod = {
        locateFile: function (path)
        {
            if (path.indexOf(".wasm") > -1) {
                /// Set the path to the wasm binary.
                return wasmPath;
            } else {
                /// Set path to worker (self + the worker hash)
                return __filename;
            }
        },
    };
    if (typeof INIT_ENGINE === "function") {
        var Stockfish = INIT_ENGINE();
        try {
            Stockfish(mod).then(function (sf)
            {
                myEngine = sf;
                start();
            });
        } catch (e) {
            console.error(e);
            console.error("\nYour Node.js version appears to be too old. Also, try adding --experimental-wasm-threads --experimental-wasm-simd.\n");
            process.exit(1);
        }
    }
    
} catch (e) {
    console.error(e)
}

function start()
{
    var loadedNets;
    var gotUCI;
    var startedThinking;
    var position = "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
    
    function send(str)
    {
        console.log("Sending: " + str)
        myEngine.postMessage(str);
    }
    
    myEngine.addMessageListener(line =>
    {
        var match;
        
        console.log("Line: " + line)
        
        if (typeof line !== "string") {
            console.log("Got line:");
            console.log(typeof line);
            console.log(line);
            return;
        }
        
        if (!loadedNets && line.indexOf("Load eval file success: 1") > -1) {
            loadedNets = true;
            send("uci");
        } else if (!gotUCI && line === "uciok") {
            gotUCI = true;
            send("setoption name UCI_LimitStrength value true");
            send("setoption name UCI_Elo value 2600");
            send("position fen " + position);
            send("isready");
            send("eval");
            send("d");
            
            send("go infinite");
        } else if (!startedThinking && line.indexOf("info depth") > -1) {
            console.log("Stopping in three seconds...");
            startedThinking = true;
            setTimeout(function ()
            {
                send("stop");
            }, 1000 * 3);
        } else if (line.indexOf("bestmove") > -1) {
            match = line.match(/bestmove\s+(\S+)/);
            if (match) {
                console.log("Best move: " + match[1]);
                myEngine.terminate();
            }
        }
    });
    
    send("uci");
}