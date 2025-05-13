import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";
const app = express();
const server = createServer(app);
let users = [];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:8081",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);
  users.push(socket.id);
  io.emit("users:list", users);

  // Mensaje global
  socket.on("globalMessage", ({ from: userID, message }) => {
    console.log(message);
    io.emit("globalMessage", `[Global] ${userID} ${message}`);
  });

  //Lista de usuarios conectados

  // Mensaje privado
  socket.on("joinPrivateRoom", ({ userId1, userId2 }) => {
    const roomName = [userId1, userId2].sort().join("-");
    socket.join(roomName);
  });

  socket.on("privateMessage", ({ from, to, message }) => {
    io.to([from, to]).emit("privateMessage", { from, message });
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    users = users.filter((user) => user !== socket.id);
    io.emit("users:list", users);
  });
});

server.listen(3000, "172.18.20.65", () => {
  console.log("Server connected to http://172.18.20.65:3000");
});
