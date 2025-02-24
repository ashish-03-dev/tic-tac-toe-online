
let turnP;
let symbol;
let boxSymbol;
let yourSymbol;
let opponentSymbol;

let roundNumber = 1;
let playerOWin = 0;
let playerXWin = 0;
let isValidMove = false;

const loader = document.querySelector(".loading-container");
const heading = document.querySelector(".heading");
const game = document.querySelector(".game");
const board = document.querySelector(".board");
const draw = document.querySelector(".drawBoard");
const winner = document.querySelector(".winner");
const round = document.querySelector(".round");
const replay = document.querySelector(".replay");
const turnBoard = document.querySelector(".turn");
const symbolX = '<i class="fa-solid fa-xmark"></i>';
const symbolO = '<i class="fa-regular fa-circle"></i>';
const scoreBoard = document.querySelector(".scoreBoard");
const nameBoard = document.querySelector(".nameBoard");
const finding = document.querySelector(".finding");

document.addEventListener("DOMContentLoaded", async function () {

    await delay(5000);//given time to load

    await fadeOut(loader, 200);// fade out loader

    await appearFlex(heading, 400); // make heading appear and animation

    disableBoxes();

    connectWebSocket();
})

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function appearFlex(node, ms) {
    return new Promise(async resolve => {
        node.style.display = "flex";

        await delay(100);// give time for rendering display

        node.style.opacity = "1";
        node.style.visibility = "visible";

        await delay(ms);//time for transition

        resolve();
    });
}

function appearBlock(node, ms) {
    return new Promise(async resolve => {
        node.style.display = "block";

        await delay(100);// give time for rendering display

        node.style.opacity = "1";
        node.style.visibility = "visible";

        await delay(ms);//time for transition

        resolve();
    });
}

function fadeOut(node, ms) {
    return new Promise(async resolve => {

        node.style.opacity = "0";

        await delay(ms);//time for element to transition

        node.style.display = "none";
        node.style.visibility = "hidden";
        resolve();
    });
}

function enableBoxes() {
    board.style.pointerEvents = "auto";
}

function disableBoxes() {
    board.style.pointerEvents = "none";
}

async function updateSymbol(sym) {
    if (sym === "X") {
        console.log("symbol set");
        symbol = "X";
        yourSymbol = symbolX;
        opponentSymbol = symbolO;
    } else {
        console.log("symbol set");
        symbol = "O";
        yourSymbol = symbolO;
        opponentSymbol = symbolX;
    }
}

// Game Function
async function gameAppear() {
    //make game appear
    await appearFlex(game, 850);// 400 ms for appear
}

// RoundBoard
async function callRoundBoard() {
    console.log("Round Board Called");
    let str = `<p><i>Round ${roundNumber}</i></p>`;
    round.innerHTML = str;

    await appearBlock(round, 200);
    await delay(900);//let user see round board after appearing

    await fadeOut(round, 200);
    enableBoxes();
    showTurnArea();
}

function showTurnArea() {
    turnBoard.style.opacity = "1";
}
function hideTurnArea() {
    turnBoard.style.opacity = "0";
}


// from server then here
function updateTurn(turn) {

    //display turn 
    if (turn === symbol) {
        console.log("turn updated");
        turnP = true;
        enableBoxes();// enable boxes for clicks
        turnBoard.innerHTML = "<p>Your Turn</p>";
        boxSymbol = yourSymbol;
    } else {
        console.log("turn updated");
        turnP = false;
        disableBoxes();
        turnBoard.innerHTML = "<p>Opponent Turn</p>";
        boxSymbol = opponentSymbol;
    }
}


function setName(opponentName) {
    const yourName = document.getElementById("username").value.toUpperCase();
    scoreBoard.querySelector("#player1").innerText = `${yourName || "ANONYMOUS"} '${symbol == "X" ? "X" : "O"}'`;
    scoreBoard.querySelector("#player2").innerText = `${opponentName} '${symbol == "X" ? "O" : "X"}'`;
};


function setScoreNumber(score) {
    let s1 = document.querySelector("#player1Win");
    s1.innerText = score[symbol];
    let s2 = document.querySelector("#player2Win");
    s2.innerText = score[symbol == "X" ? "O" : "X"];
}

// Every Click
const boxNodes = document.querySelectorAll(".box");
boxNodes.forEach((box) => {
    box.onclick = async (evt) => {
        let position = evt.target.closest(".box").id;
        if (turnP)
            // if validated then make move will emit
            checkBox(box, position);
    }
});

// Player Move check and emit
async function checkBox(box, position) {
    if (!box.querySelector(".tick")) {
        disableBoxes();
        fillBox(box);
        makeMove(position) // validate the move for emit
    } else {
        wrongMove();
    }
}

// Used to update Opponent Move
function opponentMove(position) {
    for (let box of boxNodes) {
        if (box.id === position) {
            fillBox(box);
            break;
        }
    }
}

async function fillBox(box) {
    let div = document.createElement("div");
    div.innerHTML = boxSymbol;
    div.classList.add("tick");
    box.append(div);

    insetShadow(box);
    await delay(10);
    div.style.scale = "0.92";
}

async function insetShadow(box) {
    box.classList.add("clicked");
    await delay(180);
    box.classList.add("insetShadow");
}

//wrong move animation
function wrongMove() {
    console.log("wrongMove");
    let wrong = document.querySelector(".wrongMove");

    wrong.style.opacity = "1";

    setTimeout(() => {
        wrong.style.opacity = "0";
    }, 1200);

}


function boxUnavailable() {
    boxNodes.forEach((box) => {
        insetShadow(box);
    })
}

//zoom
async function zoomInBoxes(list) {
    let strArray = list.map(String);
    for (let i of strArray) {
        let box = document.getElementById(i);
        let tick = box.querySelector(".tick");
        tick.style.scale = "1.15";
    }

    await delay(400);
    zoomOutBoxes(list);
}

//remove zoom
function zoomOutBoxes(list) {
    let strArray = list.map(String);
    for (let i of strArray) {
        let box = document.getElementById(i);
        let tick = box.querySelector(".tick");
        tick.style.scale = ".92";
    }
}

//from server
async function showWinnerEffect(list) {
    await delay(300);

    boxUnavailable(); // inset Shadow
    await delay(800);
    zoomInBoxes(list);
    await delay(700);

    // animation of which player won

    await delay(800); //given time to see board boxes
    resetGame();
}


async function openDraw() {
    await appearBlock(draw, 400); // open DrawBoard;

    await delay(1400); //let user see

    await fadeOut(draw, 400); // close DrawBoard

    await delay(800);
    resetGame();
}


async function showWinnerBoard(data) { // from server
    hideTurnArea();
    writeWinner(data);
    await appearBlock(winner, 400);

    await delay(1000);

    await fadeOut(winner, 900); // 400ms for transition 500ms for delay
    closeGame(); // close in server
}

//Write in Winner Board
function writeWinner(result) {
    let winnerName = document.querySelector(".winnerName");

    if (result == "draw")
        winnerName.innerText = "Game Drawn";
    else if (result === symbol)
        winnerName.innerText = "YOU WON";
    else
        winnerName.innerText = "YOU LOST";
}

//reset Game
function resetGame() {
    boxNodes.forEach((box) => {
        //remove box ticks
        let div = box.querySelector(".tick");
        if (div) div.remove();

        upShadow(box); //reset box hover effect and shadow
    })
}


async function upShadow(box) {
    box.classList.remove("insetShadow");
    await delay(180);
    box.classList.remove("clicked");
}


async function closeGame() { // remove from server 
    await fadeOut(game, 400);

    // socket.close();
    // socket = null;

    appearBlock(replay, 300); // call replay Board
}

replay.addEventListener("click", async function restartGame() {
    await fadeOut(replay, 320);
    connectWebSocket(); // connect to server
});


// Submit Name
nameBoard.querySelector(".submit").addEventListener('click', async () => {
    await fadeOut(nameBoard, 200);
    appearBlock(finding, 200);
    socket.emit('joinRoom'); // ask to join Room
});

async function sendName() {
    const username = document.getElementById("username").value.toUpperCase();
    socket.emit('username', username);
}


// Online Connection

let socket = null;
let reconnectAttempts = 0;


// Sending a move
function makeMove(n) {
    // send move to server
    socket.emit('move', { position: n });
    console.log("move emmitted");
};

// connect Online
function connectWebSocket() {
    console.log("try to connect to server");

    socket = io('http://localhost:8080');

    // When Connected
    socket.on('connect', async () => {
        console.log("Connected to server");
        await delay(1000);

        reconnectAttempts = 0;
        appearFlex(nameBoard, 200);


        // Send a ping message every second
        // pingInterval = setInterval(() => {
        //     if (socket.readyState === WebSocket.OPEN) {
        //         console.log("Sending Ping...");
        //         socket.emit({ type: "ping" });

        //         // set a timeout: if no pong comes back within 10s
        //         pongTimeout = setTimeout(() => {
        //             console.log("No Pong Recieved");
        //             socket.close();
        //         }, 10000);
        //     }
        // }, 30000);
    });

    // Both Player
    socket.on('playerJoined', async () => {
        console.log("player joined");
        await sendName();
    })

    // opponent username
    socket.on('username', (username) => {
        setUsername(username);
    })

    // listen for symbol
    socket.on('gameData', async (data) => {
        console.log("gameData Recieved");
        await updateSymbol(data.symbol);
        setName(data.opponentName);

        await delay(1000);
        fadeOut(finding, 200); 
        await gameAppear();
        socket.emit('ready');
    });

    // Recieving Turn
    socket.on('turn', (turn) => {
        updateTurn(turn); // if players turn then below statement
    });

    // Server send Score after Round
    socket.on('score', (score) => {
        setScoreNumber(score)
    });

    // Round Call
    socket.on('callRound', (n) => {
        roundNumber = n;
        callRoundBoard();
    })

    // Process Opponent Move
    socket.on('opponentMove', (moveData) => {
        console.log('Opponent Moved', moveData.position);
        opponentMove(moveData.position);
    });

    // When Server send Round Results
    socket.on('roundOver', async (data) => {
        disableBoxes();
        hideTurnArea();
        // if winner only show winner animation else proper draw Board
        if (data.status === "win") {
            await showWinnerEffect(data.list);
        }
        else if (data.status === "draw")
            await openDraw();

        await delay(1000); // 300ms for reset Shadows
        socket.emit('ready');
    });

    // When Server Send Gameover
    socket.on('gameOver', (data) => {
        showWinnerBoard(data); // either "X" or "Y"
    });

    // when Wrong Move sent by client after manipulation
    socket.on('wrongMove', () => { wrongMove() });

    // Revieved Message
    socket.on('message', (msg) => {
        // let data = JSON.parse(event.data);
        console.log("message from server", msg);
        // if (data.type === 'pong') {
        //     console.log("Pong Recieved, connection is alive.");
        //     clearTimeout(pongTimeout);
        // }
    });


    // When Disconnected
    // socket.on('disconnect'), () => {
    //     console.log("Disconnected from Server");
    //     clearInterval(pingInterval);
    //     clearTimeout(pongTimeout);

    //     socket = null;

    //     document.querySelector(".play").style.display = "block";
    //     document.querySelector(".leaveOnline").style.display = "none";

    //     if (reconnectAttempts <= 3) {
    //         console.log("Reconnecting...");

    //         // Trying to reconnect after an Increasing delay
    //         let delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
    //         setTimeout(connectWebSocket, delay);
    //         reconnectAttempts++;
    //     }
    // };


    // socket.on('error', (error) => {
    //     console.log("WebSocket Error Trying to reconnect");
    //     socket.onclose();
    // });
}