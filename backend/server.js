// Server Connection

// handled on the server to maintain fairness and prevent cheating. 
const winPatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8]
];



const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let rooms = {};
const players = {};
let roomCount = 1;


app.get('/', (req, res) => {
    res.send("Server is live");
})


// Handle Player Disconnections
// function handleDisconnection(socket) {
//     socket.on('disconnect', () => {
//         console.log(`Player disconnected: ${socket.id}`);

//         // Find and remove player from room
//         const roomId = getRoomId(socket);
//         if (roomId && rooms[roomId]) {
//             rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
//             if (rooms[roomId].players.length === 0)
//                 delete rooms[roomId]; // Remove empty rooms
//             else
//                 io.to(roomId).emit("playerLeft", { message: "your Opponent Left" });
//         }
//     })
// }

// Reset Board
function resetBoard(game) {
    game.board.fill(null);
    game.playerBoxes["X"].length = 0;
    game.playerBoxes["O"].length = 0;
    game.ready.length = 0;
    game.boxesFilled = 0;
}

// Change Turn
function changeTurn(roomId) {
    const room = rooms[roomId];
    room.turn = room.turn === "X" ? "O" : "X"; //change gameturn
}

// Display Turn
function displayTurn(roomId) {
    io.to(roomId).emit('turn', rooms[roomId].turn);
}

// checks Winner
function checkWinner(game, box) {
    for (let list of winPatterns) {
        let isSubset = list.every(num => box.includes(num));
        if (isSubset == true)
            return { status: 'win', list };
    }
    if (game.boxesFilled == 9) return { status: 'draw' };
    return null;
}

// Handle Check Winner
function handleCheckWinner(game, roomId, boxKey) {
    // check winner using turn
    let roundOver = checkWinner(game, game.playerBoxes[boxKey]);
    if (roundOver) {

        if (roundOver.status == "win") {
            roundOver.won = game.turn;
            let player = game.turn == "X" ? "playerXWin" : "playerOWin";
            game[player]++;
        }
        io.to(roomId).emit('roundOver', roundOver);
        resetBoard(game);
        changeTurn(roomId);
    } else {
        changeTurn(roomId);
        displayTurn(roomId);
    }
}

// Handle Move
function handlePlayerMove(socket) {

    socket.on('move', (moveData) => {

        const roomId = getRoomId(socket);

        if (!roomId || !rooms[roomId]) return; // Room not found

        const game = rooms[roomId];

        const playerIndex = game.players.indexOf(socket.id);
        if (playerIndex === -1) return; // PLayer not in this room

        let index = Number(moveData.position);

        if (!game) return;
        if (game.board[index] === null && socket.id === game.players[game.turn === "X" ? 0 : 1]) {
            game.board[index] = game.turn;
            let boxKey = playerIndex == 0 ? "X" : "O";
            game.playerBoxes[boxKey].push(index);
            game.boxesFilled++;

            // Sending to Opponent
            socket.to(roomId).emit("opponentMove", moveData);

            handleCheckWinner(game, roomId, boxKey);

        } else {
            socket.emit('wrongMove');
        }
    })
}

// Handle Round Calling
async function handleRound(game, roomId) {

    const room = rooms[roomId];

    console.log("Round Board emitted");

    io.to(roomId).emit('callRound', room.roundNumber);
    game.roundNumber++; // increase roundNumber
    displayTurn(roomId);
}

// Handle Ready State
function handleStartRound(socket) {
    socket.on('ready', () => {
        const roomId = getRoomId(socket);
        const game = rooms[roomId];
        game.ready.push(socket.id);
        if (game.ready.length === 2) {

            io.to(roomId).emit('score', { "X": game.playerXWin, "O": game.playerOWin });
            if (game.roundNumber <= 3)
                handleRound(game, roomId);
            else {
                let winner;
                if (game.playerOWin == game.playerXWin) winner = "draw";
                else if (game.playerOWin > game.playerXWin) winner = "O";
                else winner = "X";
                io.to(roomId).emit('gameOver', winner);
                return;
            }
        }
    })
}

function handlePlayerName(socket) {
    socket.on('username', (username) => {
        const roomId = getRoomId(socket);
        const room = rooms[roomId];
        username = username.trim().split(" ")[0];
        room.playerNames.push(username);

        if (room.playerNames.length === 2) {
            let s1 = "X";
            let s2 = "O";
            //other player who joined earlier
            socket.to(roomId).emit('gameData', { symbol: s1, opponentName: username || "Anonymous" });
            socket.emit('gameData', { symbol: s2, opponentName: room.playerNames[0] || "Anonymous" });
        }
    })
}

// assign Room and both player connected
function assignRoom(socket) {
    let assignedRoom = null;

    //  first check if socket is connected to any room
    if (socket.rooms.size > 1) return;

    //Find an existing Room with space for a second player
    for (let roomId in rooms) {
        if (rooms[roomId].players.length === 1) {
            assignedRoom = roomId;
            break;
        }
    }

    // If no available room, create a room
    if (!assignedRoom) {
        assignedRoom = generateRoomId();
        createRoom(assignedRoom);
        console.log("room created")
    }

    // Join the room
    socket.join(assignedRoom);
    const room = rooms[assignedRoom];
    room.players.push(socket.id);
    console.log(`${socket.id} joined ${assignedRoom}\n`);

    if (room.players.length == 2) {
        // Two players joined
        io.to(assignedRoom).emit('playerJoined');
    }
}

// Get roomId
function getRoomId(socket) {
    const socketRooms = [...socket.rooms].filter(room => room !== socket.id); // Get all rooms the socket is in
    return socketRooms.length > 0 ? socketRooms[0] : null;// The first is the socket ID, the second is the assigned roomId
}

// Generate New Room Id
function generateRoomId() {
    return `room-${roomCount++}`;
}

// Function to initialise  a new room
function createRoom(roomId) {
    rooms[roomId] = {
        board: Array(9).fill(null),
        players: [],
        playerNames: [],
        winner: null,
        turn: "X", // or true
        roundNumber: 1,
        playerXWin: 0,
        playerOWin: 0,
        ready: [],
        boxesFilled: 0,
        playerBoxes: { "X": [], "O": [] },
    };
}

// Handle Join room
function handleJoinRoom(socket) {
    // If reconnecting we work with roomId
    socket.on('joinRoom', () => {
        // Assign room to Players
        console.log("Player asked to join game");
        assignRoom(socket);
    })
}

// On New Connection
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    handleJoinRoom(socket);
    handlePlayerName(socket);
    handleStartRound(socket);
    handlePlayerMove(socket);
    // handleDisconnection(socket);

    // tell server a client is disconnected
    io.on('disconnect', () => console.log('client disconnected'));

    // tell server about error
    io.on('error', (error) => console.error("websocket error:", error));
});


console.log('WebSocket server running on ws')

server.listen(PORT, () => console.log(`Server Started at: ${PORT}`));