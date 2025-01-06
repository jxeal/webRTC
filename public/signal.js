// import {socket} from "./webrtc.js";

// function sendMessage(message) {
//   if (currentRoom) {
//     socket.emit("send-message", {
//       room: currentRoom,
//       message: message,
//     });
//     console.log("You: " + message);
//   } else {
//     showToast("Join a room first!", "error");
//   }
// }

// socket.on("receive-message", (message) => {
//   console.log("Received: " + message);
// });

// function sendObject(obj) {
//   if (currentRoom) {
//     socket.emit("send-object", {
//       room: currentRoom,
//       data: obj,
//     });
//     console.log("You sent:", obj);
//   } else {
//     showToast("Join a room first!", "error");
//   }
// }

// socket.on("receive-object", (data) => {
//   console.log("Received object:", { ...data });
//   console.dir(data);
//   receivedObjects.push(data);
//   console.log("Received object as string:", JSON.stringify(data, null, 2));
// });
