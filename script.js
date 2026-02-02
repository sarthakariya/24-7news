// === 1. FIREBASE CONFIGURATION (Your Specific Keys) ===
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

// Initialize Firebase (Compat Version)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// === 2. UI VARIABLES ===
const trigger = document.getElementById('secret-trigger');
const decoy = document.getElementById('decoy-view');
const chat = document.getElementById('chat-view');
const loginOverlay = document.getElementById('login-overlay');
const msgList = document.getElementById('messages-list');
const msgInput = document.getElementById('msg-input');

let username = localStorage.getItem('chat_username') || '';
let pressTimer;

// === 3. STEALTH TRIGGER (Long Press) ===
const unlockChat = () => {
    decoy.style.filter = 'blur(10px)'; // Blur effect
    setTimeout(() => {
        decoy.classList.add('hidden');
        chat.classList.remove('hidden');
        if(username) loginOverlay.classList.add('hidden'); // Auto-skip login if known
    }, 300);
};

// Touch events (Mobile)
trigger.addEventListener('touchstart', (e) => {
    // e.preventDefault(); 
    pressTimer = setTimeout(unlockChat, 2000); // 2 seconds
});
trigger.addEventListener('touchend', () => clearTimeout(pressTimer));

// Mouse events (Laptop/PC)
trigger.addEventListener('mousedown', () => pressTimer = setTimeout(unlockChat, 2000));
trigger.addEventListener('mouseup', () => clearTimeout(pressTimer));

// Close Button (Return to Decoy)
document.getElementById('close-chat').addEventListener('click', () => {
    chat.classList.add('hidden');
    decoy.classList.remove('hidden');
    decoy.style.filter = 'none';
});

// === 4. CHAT LOGIC ===

// Join Room
document.getElementById('join-btn').addEventListener('click', () => {
    const inputName = document.getElementById('username-input').value.trim();
    if (inputName) {
        username = inputName;
        localStorage.setItem('chat_username', username);
        loginOverlay.classList.add('hidden');
    }
});

// Send Message
const sendMessage = () => {
    const text = msgInput.value.trim();
    if (text && username) {
        // Send to Firebase
        db.ref('messages').push({
            user: username,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        msgInput.value = '';
    }
};

document.getElementById('send-btn').addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });

// Receive Messages (Real-time Listener)
db.ref('messages').limitToLast(50).on('child_added', (snapshot) => {
    const data = snapshot.val();
    const isMe = data.user === username;
    
    // Create Message Bubble
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'sent' : 'received'}`;
    div.innerText = data.text;
    
    msgList.appendChild(div);
    // Auto-scroll to bottom smoothly
    msgList.scrollTo({ top: msgList.scrollHeight, behavior: 'smooth' });
});

// === 5. TYPING INDICATOR ===
let typingTimeout;
msgInput.addEventListener('input', () => {
    if(username) {
        db.ref('status/typing').set({ user: username, isTyping: true });
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            db.ref('status/typing').set({ user: username, isTyping: false });
        }, 2000);
    }
});

db.ref('status/typing').on('value', (snap) => {
    const data = snap.val();
    const indicator = document.getElementById('typing-indicator');
    // Show only if SOMEONE ELSE is typing
    if (data && data.isTyping && data.user !== username) {
        indicator.classList.remove('hidden');
    } else {
        indicator.classList.add('hidden');
    }
});
