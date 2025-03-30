# 🎮 Toe Online Wars

**Toe Online Wars** is a **real-time multiplayer Tic-Tac-Toe** game built with **Node.js, WebSockets, and Express.js**. It provides a seamless gaming experience with automated matchmaking, fair play enforcement, and a persistent game state.

🚀 **Live Demo:** [Toe Online Wars](https://toe-online-wars.vercel.app)

---

## 🛠️ Features

✅ **Real-time Gameplay:** Instant updates using **WebSockets**.  
✅ **Automated Matchmaking:** Players are matched in available rooms.  
✅ **Persistent Sessions:** Uses **cookies** to reconnect users to their previous game.  
✅ **Fair Play System:** Move validation and win checks are handled on the server.  
✅ **Score Tracking:** Tracks round wins and declares the final game winner.  
✅ **Responsive UI:** Works smoothly on mobile and desktop.  
✅ **Secure & Scalable:** Built with **Express.js**, **Socket.io**, and **UUID** for unique session tracking.  

---

## 🚀 Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Hosted on Vercel)
- **Backend:** Node.js, Express.js, Socket.io
- **Deployment:** Vercel (Frontend), Render/Heroku (Backend)

---

## 🏗️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ashish-03-dev/toe-online-wars.git
cd toe-online-wars
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Update Frontend & Backend URLs  

Before running locally, update the frontend and backend URLs inside **server.js**:  

```javascript
// Change this for local development
const frontendURL = "http://127.0.0.1:5500";  // Update this if using a different frontend setup
```

### 4️⃣ Start the Server 
```bash
node server.js
```
Server will start on **http://localhost:3000**

---

## 🎯 How to Play?
1️⃣ Visit the [Live Game](https://toe-online-wars.vercel.app).  
2️⃣ Enter a username and **click Start** to join a game.  
3️⃣ Get matched with an opponent automatically.  
4️⃣ Play the classic **Tic-Tac-Toe** game in real-time!  
5️⃣ The first to win **2 out of 3 rounds** wins the match.  

---

## 🖥️ API Endpoints

| Endpoint      | Method | Description                          |
|--------------|--------|--------------------------------------|
| `/`          | GET    | Check if the server is live         |
| `/set-cookie` | GET   | Assigns a unique user ID cookie     |

---

### Backend Dependencies  

- **Express.js** – Handles server routing.  
- **Socket.io** – Enables real-time communication.  
- **CORS & Cookie-Parser** – Manages cross-origin requests and user sessions.  
- **UUID & Nanoid** – Generates unique user and room IDs.  

---

## ⚡ WebSocket Events

| Event Name     | Triggered When...                         |
|---------------|----------------------------------|
| `joinRoom`    | A player joins a game room     |
| `move`        | A player makes a move          |
| `roundOver`   | A round ends                   |
| `gameOver`    | A match is completed           |
| `playerLeft`  | An opponent disconnects        |

---

## 🌎 Deployment

1️⃣ Deploy frontend on **Vercel**.  
2️⃣ Deploy backend on **Render/Heroku**.  
3️⃣ Update **CORS settings** to match your deployment.  

---

## 🤝 Contributing
Feel free to submit issues or pull requests to improve the project! 🎯

---

## 🔗 Connect with Me  

📌 **GitHub:** [@ashish-03-dev](https://github.com/ashish-03-dev)  
📌 **LinkedIn:** [Ashish Kumar](https://www.linkedin.com/in/ashish-kumar-03-dev)  

---

## 📜 License
This project is **open-source** and available under the **MIT License**.

---

🎮 **Enjoy Playing Toe Online Wars!** 🚀
