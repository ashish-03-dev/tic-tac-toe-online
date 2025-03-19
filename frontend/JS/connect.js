
import {
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
    newGame,
    resumeGame,
    removeWait,
    removeBlockage,
} from './controllers/ui.js';


import {
    handleUpdateTurn,
    handleScoreNumber,
    handleRoundCall,
    handleOpponentMove,
    handleRoundOver,
    handleGameOver,
    handleWrongMove,
} from "./controllers/response.js";

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
const resume = document.querySelector('.resume');
const nameBoard = document.querySelector(".nameBoard");
const waiting = document.querySelector(".waiting");
const replay = document.querySelector(".replay");
const loader = document.querySelector(".loading-container");
const heading = document.querySelector(".heading");
const server = document.querySelector(".server");


function handlePlayerJoined() {
    return async () => {
        let fullName = document.getElementById("username").value.toUpperCase();
        if (!fullName.trim()) fullName = "";
        let username = fullName.trim().split(" ")[0];
        sendUserName(username);
    }
}
function handleGameData() {
    return async (data) => {
        await updateSymbol(data.symbol);
        await setName(data.names);
        await delay(1000);
        await fadeOut(waiting, 200);
        await gameAppear();
        sendReady();
    }
}

function handleGame() {
    return async (gameState) => {
        if (gameState.mode === "new") newGame();
        else resumeGame(gameState.gameData);
    }
}

function handleConnect() {
    return async () => {
        await delay(1000);
        await fadeOut(server, 400);
        // reconnectAttempts = 0;
        socket.emit('tellme');  // ask server if there is previous ongoing game
    }
}


function joinRoom() {
    socket.emit('joinRoom'); // ask to join Room
}
function sendUserName(username) {
    socket.emit('username', username);
}
function sendReady() {
    socket.emit('ready');
}
function sendReadyToResume() {
    socket.emit('readyResume');
}
function makeMove(n) {
    socket.emit('move', { position: n });
}

let socket = null;

const url = "https://onlinetictactoe-yf4j.onrender.com";
// const url = "http://127.0.0.1:3000";

async function connectServer() {
    await fetch(url + '/set-cookie', { credentials: "include" });
    connectWebSocket();
}

// connect Online
async function connectWebSocket() {

    socket = io(url, { withCredentials: true });

    socket.on('connect', handleConnect()); // When Connected

    socket.on('game', handleGame());// check for previous game to resume or new game

    socket.on('playerJoined', handlePlayerJoined());  // Both Player

    socket.on('gameData', handleGameData());   // listen for symbol

    socket.on('removeBlockage', removeBlockage);

    socket.on('removeWaitingForOpponent',removeWait);

    socket.on('turn', handleUpdateTurn());   // Recieving Turn

    socket.on('callRound', handleRoundCall());  // Round Call

    socket.on('score', handleScoreNumber());     // Server send Score after Round

    socket.on('opponentMove', handleOpponentMove());    // Process Opponent Move

    socket.on('roundOver', handleRoundOver());   // When Server send Round Results

    socket.on('gameOver', handleGameOver());    // When Server Send Gameover

    socket.on('wrongMove', handleWrongMove()); // when Wrong Move sent by client after manipulation

    // socket.on('error', (error) => {
    //     console.log("WebSocket Error Trying to reconnect");
    //     socket.onclose();
    // });

    // When Disconnected
    // socket.on('disconnect'), () => {
    //     console.log("Disconnected from Server");

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
}

export { connectServer, connectWebSocket, joinRoom, sendUserName, sendReadyToResume, sendReady, makeMove }