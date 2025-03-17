
import { delay,
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
} from './ui.js';

import {sendReady, sendUserName} from "../connect.js";

const boxNodes = document.querySelectorAll(".box");
const nameBoard = document.querySelector(".nameBoard");
const waiting = document.querySelector(".waiting");
const replay = document.querySelector(".replay");
const loader = document.querySelector(".loading-container");
const heading = document.querySelector(".heading");
const server = document.querySelector(".server");


function handleConnect() {
    return async () => {
        await delay(1000);
        await fadeOut(server, 400);
        // reconnectAttempts = 0;
        appearFlex(nameBoard, 200);
    }
}
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
        await setName(data.opponentName);
        await delay(1000);
        await fadeOut(waiting, 200);
        await gameAppear();
        sendReady();
    }
}
function handleUpdateTurn() {
    return async (turn) => {
        updateTurn(turn); // if players turn then below statement
    }
}
function handleRoundCall() {
    return async (n) => {
        callRoundBoard(n);
    }
}
function handleScoreNumber() {
    return async (score) => {
        setScoreNumber(score);
    }
}
function handleOpponentMove() {
    return async (moveData) => {
        opponentMove(moveData.position);
    }
}
function handleRoundOver() {
    return async (data) => {
        disableBoxes();
        hideTurnArea();
        // if winner only show winner animation else proper draw Board
        if (data.status === "win") {
            await showWinnerEffect(data.list);
        }
        else if (data.status === "draw")
            await openDraw();

        await delay(1000); // 300ms for reset Shadows
        sendReady();
    }
}
function handleGameOver() {
    return async (data) => {
        showWinnerBoard(data); // either "X" or "Y"
    }
}
function handleWrongMove() {
    return async () => {
        wrongMove()
    }
}

export {
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
}
