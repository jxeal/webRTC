export const socket = io();
let pc = null;

let localStream = null;
let remoteStream = null;
let roomCode; 

document
.getElementById("Camera")
.addEventListener("click", handleCameraClick);

document
.getElementById("Audio")
.addEventListener("click", handleAudio);

document
.getElementById("Start")
.addEventListener("click", handleCreate);

document
.getElementById("Stop")
.addEventListener("click", handleStopVC);

const videoElementLocal = document.querySelector("video#localVideo");
const videoElementRemote = document.querySelector("video#remoteVideo");

let videoCameraFlag = 0;
async function startCamera() {
  try {
      pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" }, // Google STUN server
            { urls: "stun:stun1.l.google.com:19302" }, // Another Google STUN server
            { urls: "stun:stun2.l.google.com:19302" }, // Another Google STUN server
            { urls: "stun:stun3.l.google.com:19302" }, // Another Google STUN server
          ],
        });
      const constraints = {
        video:
          // true,
          {
            height: 384,
            width: 512,
          },
        audio: true,
      };
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      remoteStream = new MediaStream();
      videoElementLocal.srcObject = localStream;
      videoElementRemote.srcObject = remoteStream;
      videoElementLocal.controls = false;
      videoElementRemote.controls = false;
      videoCameraFlag = 1;
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  
      pc.ontrack = (event) => {
        remoteStream.addTrack(event.track);
        const remoteVideo = document.querySelector("video#remoteVideo");
        remoteVideo.srcObject = remoteStream;
      };
    } catch (e) {
      console.error("Error opening camera. ", e);
    }
  }
  
  function toggleVideoFromCamera() {
    const videoElement = document.querySelector("video#localVideo");
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks[0].enabled = !videoTracks[0].enabled; // Disable the track instead of stopping it
      videoElement.srcObject =
        videoElement.srcObject == null ? localStream : null;
    }
  }
  
  function handleCameraClick() {
    if (!videoCameraFlag) startCamera(); //Start the camera
    else toggleVideoFromCamera(); //Toggle the Camera on/off
  }

  function handleAudio(){
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks[0].enabled = !audioTracks[0].enabled; // Disable the track instead of stopping it
    }
  }

//Not working. Idk why. F Me
  let callFlag = 0;
  function StartorStop(){
    if (!callFlag) {
      handleCreate(); 
      // console.log("Calling create function");
    } else{
      handleStopVC();
      // console.log("Calling stop function");
    }
  }
  
  function handleCreate() {
    let SDPstring, offerSDP;
  
    pc.onicecandidate = (e) => {
      SDPstring = JSON.stringify(pc.localDescription);
      offerSDP = pc.localDescription; 
      roomCode = document.getElementById('roomCode').value;
      socket.emit("send-offer-sdp", { room: roomCode, offerSDP });
    };
  
    pc.createOffer()
      .then((e) => pc.setLocalDescription(e));
      // .then((e) => console.log("Offer Set successfully!"));
  }
  
  socket.on("receive-answer-sdp", (answerSDP) => {
    // console.log("Received answer SDP:");
    handleAnswer(answerSDP);
  });
  
  // Accept the answer SDP from peer 2
  function handleAnswer(answer) {
    pc.setRemoteDescription(answer);
    // document
    //     .getElementById("StartStop")
    //     .innerText = "Stop VC";
    //     callFlag = 1;
  }
  
  socket.on("receive-offer-sdp", (offerSDP) => {
    // console.log("Received Offer SDP:");
    handleJoin(offerSDP);
    roomCode = document.getElementById('roomCode').value;
    // sendAnswerSDP(roomCode, answerSDP);
  });
  
  // Accept offer SDP and send answer SDP
  function handleJoin(offer) {
    let SDPstring, answerSDP;
    pc.onicecandidate = (e) => {
      SDPstring = JSON.stringify(pc.localDescription);
      answerSDP = pc.localDescription;
      roomCode = document.getElementById('roomCode').value;
      socket.emit("send-answer-sdp", { room: roomCode, answerSDP });
    };
    pc.setRemoteDescription(offer).then((e) => console.log("Offer set!"));
    pc.createAnswer()
      .then((a) => pc.setLocalDescription(a));
      // .then((a) => console.log("Answer Created"));
    // document
    //   .getElementById("StartStop")
    //   .innerText = "Stop VC";
    //   callFlag = 1;    
  }

  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 2500);
  }

  socket.on("vc-stopped", (message)=>{
    handleRemoveTracks();
    showToast(message, 'error');
  })

  function handleStopVC(){
    socket.emit("stop-vc", roomCode);
    handleRemoveTracks();
  }

  function handleRemoveTracks() {
    // Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  
    // Close the RTCPeerConnection
    if (pc) {
      pc.close();
    }
    roomCode = document.getElementById('roomCode').value;
    // Clear the video elements
    videoElementLocal.srcObject = null;
    videoElementRemote.srcObject = null;
  
    // Reset flag
    videoCameraFlag = 0;
    callFlag = 0;
  }