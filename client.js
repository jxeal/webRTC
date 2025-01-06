// Import the socket.io-client library
const io = require("socket.io-client");

// Initialize the socket connection
const socket = io("http://localhost:3000"); // Replace with your server URL

// Function to check the number of members in a room
function checkRoomMembers(roomCode) {
  socket.emit("check-room-members", roomCode);

  socket.on("room-members-count", ({ room, count }) => {
    console.log(`Room ${room} has ${count} members`);
    // You can update the UI or handle the count as needed
  });
}

// Example usage
checkRoomMembers("8922"); // Replace '1234' with the actual room code
