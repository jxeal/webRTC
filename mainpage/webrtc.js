const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Google STUN server
        { urls: 'stun:stun1.l.google.com:19302' }, // Another Google STUN server
        { urls: 'stun:stun2.l.google.com:19302' }, // Another Google STUN server
        { urls: 'stun:stun3.l.google.com:19302' },  // Another Google STUN server
    ]
};

const pc = new RTCPeerConnection(configuration);
let localStream = null;
let remoteStream = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('Camera').addEventListener('click', handleCameraClick);
});

let videoCameraFlag = 0;
async function startCamera() {
    try {
        const constraints = {
            'video':
            // true,
            {
                'height': 384,
                'width': 512,
            },
            'audio': true
        }
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        remoteStream = new MediaStream();
        const videoElementLocal = document.querySelector('video#localVideo');
        const videoElementRemote = document.querySelector('video#remoteVideo');
        videoElementLocal.srcObject = localStream;
        videoElementRemote.srcObject = remoteStream;
        videoElementLocal.controls = false;
        videoElementRemote.controls = false;
        videoCameraFlag = 1;
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        pc.ontrack = (event) => {
            remoteStream.addTrack(event.track);
            const remoteVideo = document.querySelector('video#remoteVideo');
            remoteVideo.srcObject = remoteStream;
        };
    } catch (e) {
        console.error('Error opening camera. ', e);
    }
}

function toggleVideoFromCamera() {
    const videoElement = document.querySelector('video#localVideo');
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled; // Disable the track instead of stopping it
        videoElement.srcObject = (videoElement.srcObject == null) ? localStream : null;
    }
}

function handleCameraClick() {
    if (!videoCameraFlag) startCamera(); //Start the camera 
    else toggleVideoFromCamera(); //Toggle the Camera on/off
}

//Flag for create offer and handle the create offer button click

let offerFlag = 0;
function handleOfferClick() {
    if (!offerFlag) {
        handleCreate();
        offerFlag = 1;
    } else {
        handleAnswer();
        offerFlag = 0;
    }
}

//Create offer 
let offerSDParray=[]

async function handleCreate() {
    let SDPstring;
    pc.onicecandidate = e => {
        SDPstring = JSON.stringify(pc.localDescription);
        offerSDParray.push(SDPstring);
        console.log("Ice candidate found! Reprinting SDP " + SDPstring);
        navigator.clipboard.writeText(SDPstring);
    }
    
    pc.createOffer().then(e => pc.setLocalDescription(e)).then(e =>
        console.log("Offer Set successfully!"));
        // const e= await pc.createOffer();
        // const localDesc = await pc.setLocalDescription(e);
     
}

// Accept the answer SDP from peer 2

function handleAnswer(answer) {
    // const answer = JSON.parse(document.getElementById('answer').value);
    pc.setRemoteDescription(answer);
}

// Accept offer SDP and send answer SDP

function handleJoin(offer) {
    // const offer = JSON.parse(document.getElementById('join').value);

    pc.onicecandidate = e => {
        let SDPstring = JSON.stringify(pc.localDescription);
        console.log("New Ice candidate! Reprinting SDP! " + SDPstring);
        navigator.clipboard.writeText(SDPstring)
        // return SDPstring;
    }
    pc.setRemoteDescription(offer).then(e => console.log("Offer set!"))
    pc.createAnswer().then(a => pc.setLocalDescription(a)).then(a => console.log("Answer Created"));
    // return SDPstring;
    setTimeout(()=>{
        return SDPstring;
    },1000)
}

export { handleCreate, handleAnswer, handleJoin, offerSDParray };
