import {
    handleConnect,
    handlePlayerJoined,
    handleGameData,
    handleUpdateTurn,
    handleScoreNumber,
    handleRoundCall,
    handleOpponentMove,
    handleRoundOver,
    handleGameOver,
    handleWrongMove,
} from "./controllers/response.js";


function joinRoom() {
    socket.emit('joinRoom'); // ask to join Room
}
function sendUserName(username){
    socket.emit('username', username);
}
function sendReady(){
    socket.emit('ready');
}
function makeMove(n){
    socket.emit('move', { position: n });
}

let socket = null;
// let reconnectAttempts = 0;


// connect Online
function connectWebSocket() {

    socket = io("https://onlinetictactoe-yf4j.onrender.com");

    socket.on('connect', handleConnect()); // When Connected

    socket.on('playerJoined', handlePlayerJoined());  // Both Player

    socket.on('gameData', handleGameData());   // listen for symbol

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

export { connectWebSocket, joinRoom , sendUserName, sendReady, makeMove}