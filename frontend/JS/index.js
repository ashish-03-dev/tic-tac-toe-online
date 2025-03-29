import {
    handlePageLoaded,
    handleSubmitName,
    handleRestartGame,
    handleBoxClick,
} from './ui.js';


const boxNodes = document.querySelectorAll(".box");
const submit = document.querySelector("#submitName");
const replay = document.querySelector(".replay");


document.addEventListener("DOMContentLoaded", handlePageLoaded);

boxNodes.forEach((box) => { box.addEventListener("click", (evt) => { handleBoxClick(evt); }) });

submit.addEventListener('click', handleSubmitName);     // Submit Name

replay.addEventListener("click", handleRestartGame);    // replay Board
