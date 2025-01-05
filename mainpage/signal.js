import {
  handleCreate,
  handleAnswer,
  handleJoin,
  offerSDParray,
} from "./webrtc.js";
import { currentRoom } from "./client.js";

const socket = io();

export async function sendOfferSDP(roomCode) {
  socket.emit("check-room-members", roomCode);
  const offerSDP = await handleCreate();
  console.log("OfferSDP", offerSDP);
  // let offerSDP = offerSDParray[0]
  //   socket.on("room-members-count", ({ room, count }) => {
  //     console.log(`Room ${room} has ${count} members`);
  //     if (count == 2) {
  socket.emit("send-offer-sdp", { room: roomCode, offerSDP });
  console.log("Sending Offer SDP:", offerSDP);
  //   setTimeout(() => {
  //   }, 2000);
}
//   });
// }

socket.on("receive-offer-sdp", (offerSDP) => {
  console.log("Received Offer SDP:", offerSDP);
  let answerSDP = handleJoin(offerSDP);
  sendAnswerSDP(currentRoom, answerSDP);
});

function sendAnswerSDP(roomCode, answerSDP) {
  setTimeout(() => {
    socket.emit("send-answer-sdp", { room: roomCode, answerSDP });
    console.log("Sending Answer SDP:", offerSDP);
  }, 500);
}

socket.on("receive-answer-sdp", (answerSDP) => {
  console.log("Received answer SDP:", answerSDP);
  handleAnswer(answerSDP);
});

function sendMessage(message) {
  if (currentRoom) {
    socket.emit("send-message", {
      room: currentRoom,
      message: message,
    });
    console.log("You: " + message);
  } else {
    showToast("Join a room first!", "error");
  }
}

socket.on("receive-message", (message) => {
  console.log("Received: " + message);
});

function sendObject(obj) {
  if (currentRoom) {
    socket.emit("send-object", {
      room: currentRoom,
      data: obj,
    });
    console.log("You sent:", obj);
  } else {
    showToast("Join a room first!", "error");
  }
}

socket.on("receive-object", (data) => {
  console.log("Received object:", { ...data });
  console.dir(data);
  receivedObjects.push(data);
  console.log("Received object as string:", JSON.stringify(data, null, 2));
});
