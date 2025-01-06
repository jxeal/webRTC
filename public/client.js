import {socket} from "./webrtc.js";

document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for the Generate Room button
    document.getElementById('generateRoom').addEventListener('click', generateRoom);

    // Add event listener for the Join Room button
    document.getElementById('joinRoom').addEventListener('click', joinRoom);
});

let currentRoom = null;

// Debug log for connection
socket.on('connect', () => {
    console.log('Connected to server');
});

function generateRoom() {
    const code = Math.floor(1000 + Math.random() * 9000);
    socket.emit('create-room', code.toString());
    currentRoom = code.toString();
}

function joinRoom() {
    const code = document.getElementById('roomCode').value;
    if(code.length === 4) {
        socket.emit('join-room', code);
        currentRoom = code;
    }
    // checkRoomMembers(code);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    // Hide after 2.5 seconds
    setTimeout(() => {
        toast.className = 'toast';
    }, 2500);
}

// Socket listeners
socket.on('room-created', (code) => {
    showToast(`Room created successfully`);
    document.getElementById('roomCode').value = code;
    console.log('Room created:', code);
});

socket.on('room-joined', (code) => {
    showToast(`Joined room successfully`);
    console.log('Room joined:', code);
    // sendOfferSDP(code);
});

socket.on('join-error', (message) => {
    showToast(message, 'error');
    currentRoom = null;
    document.getElementById('roomCode').value = "";
});

// Error handling for socket
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    showToast('Connection error!', 'error');
});

export {currentRoom};