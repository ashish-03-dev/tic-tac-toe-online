const express = require('express');
const http = require('http');
const PORT = process.env.PORT || 3000;
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cookie = require("cookie");
const cors = require('cors');

let nanoid;
(async () => {
    const nanoidModule = await import('nanoid');
    nanoid = nanoidModule.nanoid;
})();
const { v4: uuidv4 } = require('uuid');


const app = express();
const server = http.createServer(app);
// const frontendURL = ["http://127.0.0.1:5500", "https://toe-online-wars.vercel.app/"];
const frontendURL = "https://toe-online-wars.vercel.app/";
const io = new Server(server, {
    cors: {
        origin: frontendURL,
        methods: ["GET", "POST"],
        credentials: true,
    }
});


app.use(cors({ origin: frontendURL, credentials: true }));
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send("Server is live");
})
app.get('/set-cookie', (req, res) => {
    let userId = req.cookies.userId;

    if (!userId) {
        const sessionId = uuidv4();
        res.cookie("userId", sessionId, {
            maxAge: 86400000,
            httpOnly: true,
            secure:true,
            // secure: false, // for local 
            sameSite: "None",
        })
        console.log("new cookie sent\n")
    }
    res.send({ "UserId:": userId });
})



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

let rooms = {};
const players = {};
let roomCount = 1;
let userSocketMap = {};

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
async function updateYourTurn(roomId) {
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
        updateYourTurn(roomId);
    }
}

// Handle Move
function handlePlayerMove(socket) {

    socket.on('move', (moveData) => {

        const roomId = getRoomId(socket);

        if (!roomId || !rooms[roomId]) return; // Room not found

        const game = rooms[roomId];

        const playerIndex = game.users.indexOf(socket.data.userId);
        if (playerIndex === -1) return; // PLayer not in this room

        let index = Number(moveData.position);

        if (!game) return;
        if (game.board[index] === null && socket.data.userId === game.users[game.turn === "X" ? 0 : 1]) {
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


// Handle Player Disconnections
function handleDisconnection(socket) {
    socket.on('disconnecting', () => {
        // Find and remove player from room
        const roomId = getRoomId(socket);
        console.log(`Player disconnected: ${socket.id} from Room: ${roomId}`);
        const room = rooms[roomId];
        if (roomId && room) {
            room.activeUsers = room.activeUsers.filter(id => id !== socket.data.userId);
            if (room.activeUsers.length === 0) {
                delete rooms[roomId]; // Remove empty rooms
                console.log("room deleted");
            }
            // else
            // io.to(roomId).emit("playerLeft", { message: "your Opponent Left" });
        }
    })
}

// handle clear room
async function handleClearRoom(roomId) {
    //disconnecting both
    io.of('/').in(roomId).fetchSockets().then((sockets) => {
        // console.log("Sockets :", sockets);
        sockets.forEach((socket) => {
            socket.disconnect(true);
        })
    }).catch((err) => {
        console.log("Error Disconnecting Socket", err);
    })
}

// Handle Round Calling
async function handleRound(game, roomId) {

    const room = rooms[roomId];

    console.log("Round Board emitted");

    io.to(roomId).emit('callRound', room.roundNumber);
    room.gameStarted = true;
    game.roundNumber++; // increase roundNumber
    setTimeout(async () => {
        updateYourTurn(roomId);
    }, 1300);
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
                handleClearRoom(roomId); // clear room
            }
        }
    })
}


function generateGameData(userId) {
    const roomId = findRoom(userId);
    const room = rooms[roomId];
    const symbol = room.users[0] === userId ? "X" : "O";

    const username = room.playerNames.find(player => player.userId === userId)?.username;
    const opponentName = room.playerNames.find(player => player.userId !== userId)?.username;

    return { symbol, names: { username: username || "Anonymous", opponentName: opponentName || "Anonymous" } };
}

function handlePlayerName(socket) {
    socket.on('username', (username) => {
        const userId = socket.data.userId;
        const roomId = getRoomId(socket);
        const room = rooms[roomId];
        username = username.trim().split(" ")[0];
        room.playerNames.push({ userId, username });

        if (room.playerNames.length === 2) {
            let s1 = "X";
            let s2 = "O";

            const userId1 = room.users[0];
            const userId2 = room.users[1];

            const socket1 = userSocketMap[userId1];
            const socket2 = userSocketMap[userId2];

            const gameData1 = generateGameData(userId1);
            const gameDate2 = generateGameData(userId2);

            io.to(socket1).emit('gameData', gameData1);
            io.to(socket2).emit('gameData', gameDate2);
        }
    })
}

// find room
function findRoom(userId) {
    for (const roomId in rooms) {
        if (rooms[roomId].users.includes(userId)) {
            return roomId;
        }
    }
    return null;
}

// Get roomId
function getRoomId(socket) {
    const socketRooms = [...socket.rooms].filter(room => room !== socket.id); // Get all rooms the socket is in
    return socketRooms.length > 0 ? socketRooms[0] : null;// The first is the socket ID, the second is the assigned roomId
}

// Generate New Room Id
function generateRoomId() {
    return nanoid(7);
}

// Function to initialise  a new room
function createRoom(roomId) {
    rooms[roomId] = {
        board: Array(9).fill(null),
        users: [],
        playerNames: [],
        activeUsers: [],
        gameStarted: false,
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
    socket.on('joinRoom', () => {
        console.log("Player asked to join game"); // Assign room to Players

        let assignedRoom = null;

        //  first check if socket is connected to any room
        if (socket.rooms.size > 1) return;

        //Find an existing Room with space for a second player
        for (let roomId in rooms) {
            if (rooms[roomId].users.length === 1) {
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
        room.users.push(socket.data.userId);
        room.activeUsers.push(socket.data.userId);
        console.log(`${socket.id} joined ${assignedRoom}\n`);


        if (room.users.length == 2) {
            // Two players joined
            io.to(assignedRoom).emit('playerJoined');
        }
    })
}

//handle ready to resume
function handleGameResume(socket) {
    socket.on('readyResume', () => {
        const roomId = getRoomId(socket);
        const room = rooms[roomId];
        room.activeUsers = room.activeUsers.filter(id => id !== socket.data.userId);
        room.activeUsers.push(socket.data.userId);
        if (room.activeUsers.length === 2) {
            updateYourTurn(roomId);
            socket.emit('removeBlockage');
            socket.to(roomId).emit('removeWaitingForOpponent');
        }
    });
}

// tell user if previous game is exist or new game
function handleGameState(socket) {
    socket.on('tellme', () => {
        const userId = socket.data.userId;

        const roomId = findRoom(userId);

        let gameState;
        if (roomId) {
            const room = rooms[roomId];

            const gameData = generateGameData(userId);
            gameData.playerBoxes = room.playerBoxes;
            gameData.score = { "X": room.playerXWin, "O": room.playerOWin };

            gameState = { mode: "resume", gameData };
            socket.join(roomId);
            room.activeUsers = room.activeUsers.filter(id => id !== socket.data.userId);
            room.activeUsers.push(socket.data.userId);
            console.log("Previous room assigned")
            console.log(room);
        } else {
            gameState = { mode: 'new' }
        }

        socket.emit('game', gameState);
    })
}

//  Handle Cookie
function handleCookie(socket) {
    const cookies = socket.handshake.headers.cookie ?
        cookie.parse(socket.handshake.headers.cookie) : null;
    console.log("Cookies Recieved in WebSocket ", cookies);
    const userId = cookies.userId;
    socket.data.userId = userId;

    userSocketMap[userId] = socket.id; //  map socket id with userId;
}

// On New Connection
io.on('connection', async (socket) => {
    console.log('New client connected', socket.id);
    handleCookie(socket);
    handleGameState(socket);
    handleGameResume(socket);
    handleJoinRoom(socket);
    handlePlayerName(socket);
    handleStartRound(socket);
    handlePlayerMove(socket);
    handleDisconnection(socket);

    // tell server about error
    io.on('error', (error) => console.error("websocket error:", error));
});

console.log('WebSocket server running on ws')

server.listen(PORT, () => console.log(`Server Started at: ${PORT}`));