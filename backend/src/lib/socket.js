const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});


module.exports.getReceiverSocketId = ( userId ) => {
  return userSocketMap[userId];
}

const userSocketMap = {};
io.on("connection", ( socket ) => {

    console.log("The user connected: ", socket.id);

    const userId = socket.handshake.query.userId;

    if(userId) userSocketMap[userId] = socket.id;
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));


    socket.on("disconnect", () => {

        console.log("The user disconnected: ", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        console.log("Remaining users online", userSocketMap);

    })


});

module.exports.app = app;
module.exports.server = server;
module.exports.io = io;

