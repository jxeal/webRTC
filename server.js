const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// Store for active rooms with their creation timestamps
const activeRooms = new Map();

// Function to clean expired rooms (older than 24 hours)
function cleanExpiredRooms() {
  const now = Date.now();
  for (const [code, timestamp] of activeRooms.entries()) {
    if (now - timestamp > 24 * 60 * 60 * 1000) {
      // 24 hours in milliseconds
      activeRooms.delete(code);
    }
  }
}

// Clean expired rooms every hour
setInterval(cleanExpiredRooms, 60 * 60 * 1000);

io.on("connection", (socket) => {
  console.log("User connected"); // Debug log

  socket.on("create-room", (code) => {
    activeRooms.set(code, Date.now());
    socket.join(code);
    socket.emit("room-created", code);
    console.log("Room created:", code);
  });

  socket.on("join-room", (code) => {
    if (activeRooms.has(code)) {
      const room = io.sockets.adapter.rooms.get(code);
      const numMembers = room ? room.size : 0;

      if (numMembers < 2) {
        socket.join(code);
        socket.emit("room-joined", code);
        console.log("Room joined:", code);
      } else {
        socket.emit("join-error", "Room is full");
        console.log("Join attempt failed: Room is full");
      }
    } else {
      socket.emit("join-error", "Room does not exist or has expired");
    }
  });

  socket.on("send-object", ({ room, data }) => {
    if (activeRooms.has(room)) {
      socket.to(room).emit("receive-object", data);
      console.log("Object sent in room:", room);
    }
  });

  socket.on("send-message", ({ room, message }) => {
    if (activeRooms.has(room)) {
      socket.to(room).emit("receive-message", message);
      console.log("Message sent in room:", room);
    }
  });

  socket.on("check-room-members", (code) => {
    const room = io.sockets.adapter.rooms.get(code);
    const numMembers = room ? room.size : 0;
    socket.emit("room-members-count", { room: code, count: numMembers });
    // console.log(`Room ${code} has ${numMembers} members`);
  });

  socket.on("send-offer-sdp", ({ room, offerSDP }) => {
    // Emit the offerSDP to all members in the specified room
    socket.to(room).emit("receive-offer-sdp", offerSDP);
    // console.log(`Offer SDP sent to room ${room}:`);
  });

  socket.on("send-answer-sdp", ({ room, answerSDP }) => {
    // Emit the answerSDP to all members in the specified room
    socket.to(room).emit("receive-answer-sdp", answerSDP);
    // console.log(`answer SDP sent to room ${room}:`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

http.listen(PORT, () => {
  console.log("Server running on port 3000");
});
