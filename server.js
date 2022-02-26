const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = [];

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

function getActiveRooms(io) {
  // Convert map into 2D list:
  // ==> [['4ziBKG9XFS06NdtVAAAH', Set(1)], ['room1', Set(2)], ...]
  const arr = Array.from(io.sockets.adapter.rooms);
  // Filter rooms whose name exist in set:
  // ==> [['room1', Set(2)], ['room2', Set(2)]]
  const filtered = arr.filter((room) => !room[1].has(room[0]));
  // Return only the room name:
  // ==> ['room1', 'room2']
  const res = filtered.map((i) => i[0]);
  return res;
}

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    socket.broadcast.emit("all", "someone is disconnected");
  });

  socket.on("join-room", ({ room_name, user_name }) => {
    socket.broadcast.emit("all", user_name + " is connected");
    socket.join(room_name);
    if (!users.includes(user_name)) {
      users.push(user_name);
    }

    io.to(room_name).emit(
      "welcome",
      "welcome " + user_name + " to the room: " + room_name
    );
  });

  socket.on("get-rooms", function () {
    socket.emit("rooms", getActiveRooms(io));
  });

  socket.on("chat", ({ user_name, room, msg }) => {
    socket.broadcast.to(room).emit("message", { user_name, msg });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
