// === 1. FIREBASE CONFIGURATION (DO NOT CHANGE) ===
const firebaseConfig = {
  apiKey: "AIzaSyB0k8fWBMP6_bQB-vsUB7qtzKDlV2T_krs",
  authDomain: "news-589b8.firebaseapp.com",
  databaseURL: "https://news-589b8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "news-589b8",
  storageBucket: "news-589b8.firebasestorage.app",
  messagingSenderId: "246626296129",
  appId: "1:246626296129:web:69f5897d29a9bbfc27c1c0",
  measurementId: "G-0MFZ1FGZPR"
};

// Initialize
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// === 2. VARIABLES ===
const trigger = document.getElementById('secret-trigger');
const decoy = document.getElementById('decoy-view');
const chat = document.getElementById('chat-view');
const loginOverlay = document.getElementById('login-overlay');
const msgList = document.getElementById('messages-list');
const msgInput = document.getElementById('msg-input');
const stickerPanel = document.getElementById('sticker-panel');

let username = localStorage.getItem('chat_username') || '';
let pressTimer;

// === 3. STEALTH TRIGGER ===
const unlockChat = () => {
    decoy.classList.add('hidden');
    chat.classList.remove('hidden');
    if(username) loginOverlay.classList.add('hidden');
};

trigger.addEventListener('touchstart', (e) => { pressTimer = setTimeout(unlockChat, 2000); });
trigger.addEventListener('touchend', () => clearTimeout(pressTimer));
trigger.addEventListener('mousedown', () => pressTimer = setTimeout(unlockChat, 2000));
trigger.addEventListener('mouseup', () => clearTimeout(pressTimer));

document.getElementById('close-chat').addEventListener('click', () => {
    chat.classList.add('hidden');
    decoy.classList.remove('hidden');
});

// === 4. CHAT LOGIC ===

// Login
document.getElementById('join-btn').addEventListener('click', () => {
    const name = document.getElementById('username-input').value.trim();
    if(name) {
        username = name;
        localStorage.setItem('chat_username', username);
        loginOverlay.classList.add('hidden');
    }
});

// Send Message
const sendMessage = (content, type = 'text') => {
    if(!username) return;
    
    // Get Time HH:MM
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.ref('messages').push({
        user: username,
        content: content,
        type: type, // 'text' or 'sticker'
        time: timeString,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    msgInput.value = '';
    stickerPanel.classList.add('hidden'); // Close sticker panel after sending
};

// Event Listeners
document.getElementById('send-btn').addEventListener('click', () => {
    const text = msgInput.value.trim();
    if(text) sendMessage(text, 'text');
});

msgInput.addEventListener('keypress', (e) => { 
    if(e.key === 'Enter') {
        const text = msgInput.value.trim();
        if(text) sendMessage(text, 'text');
    }
});

// Sticker Button
document.getElementById('sticker-btn').addEventListener('click', () => {
    stickerPanel.classList.toggle('hidden');
});

window.sendSticker = (emoji) => {
    sendMessage(emoji, 'sticker');
};

// === 5. RECEIVE MESSAGES (With Ticks & Time) ===
db.ref('messages').limitToLast(50).on('child_added', (snapshot) => {
    const data = snapshot.val();
    const isMe = data.user === username;
    
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'sent' : 'received'}`;
    
    // Check Content Type
    let contentHtml = '';
    if (data.type === 'sticker') {
        contentHtml = `<div style="font-size: 40px;">${data.content}</div>`;
    } else {
        contentHtml = `<span class="msg-text">${data.content}</span>`;
    }

    // Add Metadata (Time + Ticks)
    // Only show ticks for "Sent" messages
    const ticks = isMe ? '<i class="fas fa-check-double" style="color: #add8e6;"></i>' : '';

    div.innerHTML = `
        ${contentHtml}
        <div class="msg-meta">
            <span>${data.time}</span>
            ${ticks}
        </div>
    `;
    
    msgList.appendChild(div);
    msgList.scrollTo({ top: msgList.scrollHeight, behavior: 'smooth' });
});
