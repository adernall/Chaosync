const { Server } = require("colyseus");
const { monitor } = require("@colyseus/monitor");
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { GameRoom } = require("./rooms/GameRoom");

const PORT = process.env.PORT || 2567;

const app = express();
app.use(cors());
app.use(express.json());

// Serve built client in production (vite builds to server/public/)
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../public");
  app.use(express.static(clientPath));
  app.get(/^(?!\/colyseus|\/health).*/, (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const server = http.createServer(app);
const gameServer = new Server({ server });

gameServer.define("game_room", GameRoom);

if (process.env.NODE_ENV !== "production") {
  app.use("/colyseus", monitor());
}

app.get("/health", (req, res) => res.json({ status: "ok" }));

gameServer.listen(PORT).then(() => {
  console.log("🎮 Chaosync server running on port " + PORT);
});