import { connectWebSocket, joinRoom, makeMove} from '../connect.js';

let turnP;
let symbol;
let boxSymbol;
let yourSymbol;
let opponentSymbol;
let roundNumber = 1;


const game = document.querySelector(".game");
const board = document.querySelector(".board");
const draw = document.querySelector(".drawBoard");
const winner = document.querySelector(".winner");
const round = document.querySelector(".round");
const turnBoard = document.querySelector(".turn");
const symbolX = '<i class="fa-solid fa-xmark"></i>';
const symbolO = '<i class="fa-regular fa-circle"></i>';
const scoreBoard = document.querySelector(".scoreBoard");


const boxNodes = document.querySelectorAll(".box");
const nameBoard = document.querySelector(".nameBoard");
const waiting = document.querySelector(".waiting");
const replay = document.querySelector(".replay");
const loader = document.querySelector(".loading-container");
const heading = document.querySelector(".heading");
const server = document.querySelector(".server");



async function handlePageLoaded() {
    await delay(5000);//given time to load

    await fadeOut(loader, 200);// fade out loader

    await appearFlex(heading, 400); // make heading appear and animation

    await appearBlock(server, 400); // make server appear

    disableBoxes();
    connectWebSocket();
}


async function handleBoxClick(evt) {  // Every Click
    const position = evt.target.closest(".box").id;
    const box = evt.target.closest('.box');
    if (turnP)
        // if validated then make move will emit
        checkBox(box, position);
}


async function handleSubmitName() {
    await fadeOut(nameBoard, 200);
    appearBlock(waiting, 400);
    joinRoom(); // from socket Connect
}


async function handleRestartGame() {
    await fadeOut(replay, 320);
    connectWebSocket(); // connect to server
}


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
        symbol = "X";
        yourSymbol = symbolX;
        opponentSymbol = symbolO;
    } else {
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
async function callRoundBoard(n) {
    roundNumber = n;
    let str = `<p><i>Round ${roundNumber}</i></p>`;
    round.innerHTML = str;

    await appearBlock(round, 200);
    await delay(900);//let user see round board after appearing

    await fadeOut(round, 200);
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
        turnP = true;
        enableBoxes();// enable boxes for clicks
        turnBoard.innerHTML = `<p>Your Turn <ps>${yourSymbol}</ps></p>`;
        boxSymbol = yourSymbol;
    } else {
        turnP = false;
        disableBoxes();
        turnBoard.innerHTML = `<p>Opponent Turn</p>`;
        boxSymbol = opponentSymbol;
    }
}


async function setName(opponentName) {
    let yourName = document.getElementById("username").value.toUpperCase();
    if (!yourName.trim()) fullName = "";
    let username = yourName.trim().split(" ")[0];

    scoreBoard.querySelector("#player1").innerText = `${username || "ANONYMOUS"}`;
    scoreBoard.querySelector("#player2").innerText = `${opponentName}`;
};

function setScoreNumber(score) {
    let s1 = document.querySelector("#player1Win");
    s1.innerText = score[symbol];
    let s2 = document.querySelector("#player2Win");
    s2.innerText = score[symbol == "X" ? "O" : "X"];
}

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
    await delay(500);
    await appearBlock(draw, 400); // open DrawBoard;

    await delay(1400); //let user see

    await fadeOut(draw, 400); // close DrawBoard

    await delay(600);
    resetGame();
}


async function showWinnerBoard(data) { // from server
    hideTurnArea();
    await writeWinner(data);
    await appearBlock(winner, 400);

    await delay(1000);

    await fadeOut(winner, 900); // 400ms for transition 500ms for delay
    closeGame(); // close in server
}

//Write in Winner Board
async function writeWinner(result) {
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



export {
    handlePageLoaded,
    handleSubmitName,
    handleRestartGame,
    handleBoxClick,
    delay,
    appearFlex,
    appearBlock,
    fadeOut,
    enableBoxes,
    disableBoxes,
    updateSymbol,
    gameAppear,
    callRoundBoard,
    showTurnArea,
    hideTurnArea,
    updateTurn,
    setName,
    setScoreNumber,
    checkBox,
    opponentMove,
    fillBox,
    insetShadow,
    wrongMove,
    boxUnavailable,
    zoomInBoxes,
    showWinnerEffect,
    openDraw,
    showWinnerBoard,
    writeWinner,
    resetGame,
    upShadow,
    closeGame,
    sendName,
}