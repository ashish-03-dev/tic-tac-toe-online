
import {
    delay,
    fadeOut,
    callRoundBoard,
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
    showTurnArea,
} from './ui.js';


const server = document.querySelector(".server");

const handleShowTurn = () => {
    showTurnArea();
}
const handleUpdateTurn = (turn) => {
    updateTurn(turn); // if players turn then below statement
}
const handleRoundCall = async (data) => {
    await callRoundBoard(data.n);
    updateTurn(data.turn);
}
const handleScoreNumber = (score) => {
    setScoreNumber(score);
}
const handleOpponentMove = (moveData) => {
    opponentMove(moveData.position);
}
const handleRoundOver = async (data) => {
    await roundOver(data);
    sendReady();
}
const handleGameOver = async (data) => {
    disconnectSocket();
    await gameOver(data); // either "X" or "Y"
}
const handleWrongMove = () => {
    wrongMove();
}

function disconnectSocket() {
    socket.close();
}

const handlePlayerJoined = () => {
    let fullName = document.getElementById("username").value.toUpperCase();
    if (!fullName.trim()) fullName = "";
    let username = fullName.trim().split(" ")[0];
    sendUserName(username);
}

const handleRemoveWaiting = () => {
    removeWaiting();
}
const handlePlayerLeft = () => {
    playerLeft();
}
const handleGameData = async (data) => {
    await gameData(data);
    sendReady();
}

const handleGame = (gameState) => {
    if (gameState.mode === "new") newGame();
    else {
        console.log(gameState.mode);
        resumeGame(gameState.gameData);
    }
}

const handleConnect = async () => {
    await delay(1000);
    await fadeOut(server, 400);
    // reconnectAttempts = 0;
    socket.emit('tellme');  // ask server if there is previous ongoing game
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

    socket.on('connect', handleConnect); // When Connected

    socket.on('game', handleGame);// check for previous game to resume or new game

    socket.on('playerJoined', handlePlayerJoined);  // Both Player

    socket.on('playerLeft', handlePlayerLeft);

    socket.on('removeWaiting', handleRemoveWaiting);

    socket.on('gameData', handleGameData);   // listen for symbol

    socket.on('turn', handleUpdateTurn);   // Recieving Turn

    socket.on('showTurn', handleShowTurn);

    socket.on('callRound', handleRoundCall);  // Round Call

    socket.on('score', handleScoreNumber);     // Server send Score after Round

    socket.on('opponentMove', handleOpponentMove);    // Process Opponent Move

    socket.on('roundOver', handleRoundOver);   // When Server send Round Results

    socket.on('gameOver', handleGameOver);    // When Server Send Gameover

    socket.on('wrongMove', handleWrongMove); // when Wrong Move sent by client after manipulation

    socket.on('error', (error) => {
        console.log("WebSocket Error Trying to reconnect");
        socket.connect();
    });

    // When Disconnected
    socket.on('disconnect'), () => {
        console.log("Disconnected from Server");
        // socket = null;
    };
}

export { connectServer, connectWebSocket, joinRoom, sendUserName, sendReadyToResume, sendReady, makeMove, disconnectSocket }