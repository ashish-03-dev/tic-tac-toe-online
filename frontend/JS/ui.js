import { connectServer, connectWebSocket, joinRoom, makeMove, sendReadyToResume } from './connect.js';

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
const symbolO = '<i class="fa-regular fa-o"></i>';
const scoreBoard = document.querySelector(".scoreBoard");


const boxNodes = document.querySelectorAll(".box");
const nameBoard = document.querySelector(".nameBoard");
const waiting = document.querySelector(".waiting");
const resume = document.querySelector('.resume');
const replay = document.querySelector(".replay");
const loader = document.querySelector(".loading-container");
const heading = document.querySelector(".heading");
const server = document.querySelector(".server");
const leftBoard = document.querySelector('.playerLeft');


async function handlePageLoaded() {
    console.log("page load called");
    await delay(5000);//given time to load
    await fadeOut(loader, 200);// fade out loader
    await appearFlex(heading, 400); // make heading appear and animation
    await appearBlock(server, 400); // make server appear
    disableBoxes();
    connectServer();
}

async function handleBoxClick(evt) {  // Every Click
    const position = evt.target.closest(".box").id;
    const box = evt.target.closest('.box');
    if (turnP)
        checkBox(box, position);     // if validated then make move will emit
}

async function handleSubmitName() {
    await fadeOut(nameBoard, 200);
    appearBlock(waiting, 400);
    joinRoom(); // from socket Connect
}

async function removeWaiting() {
    await fadeOut(leftBoard, 200);
    document.querySelector('.player2').classList.remove('showWaiting');
}

async function playerLeft() {
    disableBoxes();
    document.querySelector('.player2').classList.add('showWaiting');
    await delay(400);
    appearBlock(leftBoard, 200);
}

async function resumeGame(gameData) {
    console.log("resume Game called")
    updateSymbol(gameData.symbol);
    setName(gameData.names);
    setScoreNumber(gameData.score);
    await updateBox(gameData.playerBoxes);

    await appearBlock(resume, 400);
    await delay(1500);
    await fadeOut(resume, 400);
    await gameAppear();
    sendReadyToResume();
}

function newGame() {
    appearFlex(nameBoard, 200);
}

async function updateBox(playerBoxes) {
    updateTurn("X");
    playerBoxes["X"].forEach(id => {
        id = String(id);
        const b = document.getElementById(id);
        fillBox(b);
    })
    updateTurn("O");
    playerBoxes["O"].forEach(id => {
        id = String(id);
        const b = document.getElementById(id);
        fillBox(b);
    })
}

async function handleRestartGame() {
    await fadeOut(replay, 200);
    connectWebSocket(); // connect to server
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

async function gameData(data) {
    await updateSymbol(data.symbol);
    await setName(data.names);
    await delay(1000);
    await fadeOut(waiting, 200);
    await gameAppear();
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

async function setName(names) {
    scoreBoard.querySelector("#player1").innerText = `${names.username}`;
    scoreBoard.querySelector("#player2").innerText = `${names.opponentName}`;
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
    div.style.scale = "0.9";
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
        tick.style.scale = "1.08";
    }

    await delay(400);
    for (let i of strArray) {
        let box = document.getElementById(i);
        let tick = box.querySelector(".tick");
        tick.style.scale = ".92";
    }
}

async function roundOver(data) {
    disableBoxes();
    hideTurnArea();
    // if winner only show winner animation else proper draw Board
    if (data.status === "win") {
        await showWinnerEffect(data.list);
    }
    else if (data.status === "draw") {
        await delay(500);
        await openDraw();
    }
    await delay(1000); // 300ms for reset Shadows
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

async function gameOver(data) { // from server
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
    appearBlock(replay, 200); // call replay Board
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
    await appearFlex(game, 850);// 400 ms for appear
}


export {
    handlePageLoaded,
    handleSubmitName,
    handleRestartGame,
    handleBoxClick,
    delay,
    fadeOut,
    callRoundBoard,
    showTurnArea,
    updateTurn,
    setScoreNumber,
    opponentMove,
    wrongMove,
    newGame,
    resumeGame,
    playerLeft,
    removeWaiting,
    roundOver,
    gameOver,
    gameData,
}