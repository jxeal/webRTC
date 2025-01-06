const pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }, // Google STUN server
      { urls: "stun:stun1.l.google.com:19302" }, // Another Google STUN server
      { urls: "stun:stun2.l.google.com:19302" }, // Another Google STUN server
      { urls: "stun:stun3.l.google.com:19302" }, // Another Google STUN server
    ],
  });
  export const socket = io();
  
  let localStream = null;
  let remoteStream = null;
  
  document
    .getElementById("Camera")
    .addEventListener("click", handleCameraClick);
  
  document
    .getElementById("offerButton")
    .addEventListener("click", handleCreate);
  
  let videoCameraFlag = 0;
  async function startCamera() {
    try {
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
      const videoElementLocal = document.querySelector("video#localVideo");
      const videoElementRemote = document.querySelector("video#remoteVideo");
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
  
  let roomCode; 
  
  function handleCreate() {
    let SDPstring, offerSDP;
  
    pc.onicecandidate = (e) => {
      SDPstring = JSON.stringify(pc.localDescription);
      offerSDP = pc.localDescription; 
      navigator.clipboard.writeText(SDPstring);
      roomCode = document.getElementById('roomCode').value;
      socket.emit("send-offer-sdp", { room: roomCode, offerSDP });
      console.log("Sending Offer SDP:");
    };
  
    pc.createOffer()
      .then((e) => pc.setLocalDescription(e))
      .then((e) => console.log("Offer Set successfully!"));
  }
  
  socket.on("receive-answer-sdp", (answerSDP) => {
    console.log("Received answer SDP:");
    handleAnswer(answerSDP);
  });
  
  // Accept the answer SDP from peer 2
  function handleAnswer(answer) {
    pc.setRemoteDescription(answer);
  }
  
  socket.on("receive-offer-sdp", (offerSDP) => {
    console.log("Received Offer SDP:");
    handleJoin(offerSDP);
    roomCode = document.getElementById('roomCode').value;
    sendAnswerSDP(roomCode, answerSDP);
  });
  
  // Accept offer SDP and send answer SDP
  function handleJoin(offer) {
    let SDPstring, answerSDP;
    pc.onicecandidate = (e) => {
      SDPstring = JSON.stringify(pc.localDescription);
      answerSDP = pc.localDescription;
      navigator.clipboard.writeText(SDPstring);
      roomCode = document.getElementById('roomCode').value;
      socket.emit("send-answer-sdp", { room: roomCode, answerSDP });
      console.log("Sending Answer SDP:");
    };
    pc.setRemoteDescription(offer).then((e) => console.log("Offer set!"));
    pc.createAnswer()
      .then((a) => pc.setLocalDescription(a))
      .then((a) => console.log("Answer Created"));
  }