// === CONFIGURATION ===
const LONG_PRESS_DURATION = 2000; // 2000ms = 2 seconds

// === DOM ELEMENTS ===
const decoyView = document.getElementById('decoy-view');
const chatView = document.getElementById('chat-view');
const secretTrigger = document.getElementById('secret-trigger');
const closeChatBtn = document.getElementById('close-chat');

// Login Elements
const loginScreen = document.getElementById('login-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');

// Chat Elements
const messageContainer = document.getElementById('message-container');
const messagesList = document.getElementById('messages-list');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');

let currentUser = '';
let pressTimer;

// === 1. STEALTH TRIGGER LOGIC ===

function unlockChat() {
    console.log("Unlocking Chat Interface...");
    decoyView.classList.add('hidden');
    chatView.classList.remove('hidden');
    // Optional: Vibrate phone to indicate success (if supported)
    if (navigator.vibrate) navigator.vibrate(200);
}

const startPress = (e) => {
    // Prevent default browser context menu on long press
    if(e.type === 'touchstart') {
       // e.preventDefault(); // Uncomment if scrolling interferes
    }
    pressTimer = setTimeout(unlockChat, LONG_PRESS_DURATION);
};

const cancelPress = () => {
    clearTimeout(pressTimer);
};

// Listeners for Touch (Mobile)
secretTrigger.addEventListener('touchstart', startPress);
secretTrigger.addEventListener('touchend', cancelPress);
secretTrigger.addEventListener('touchmove', cancelPress); // Cancel if they scroll

// Listeners for Mouse (Laptop)
secretTrigger.addEventListener('mousedown', startPress);
secretTrigger.addEventListener('mouseup', cancelPress);
secretTrigger.addEventListener('mouseleave', cancelPress);

// Exit Button (Hides chat, shows decoy again)
closeChatBtn.addEventListener('click', () => {
    chatView.classList.add('hidden');
    decoyView.classList.remove('hidden');
});

// === 2. CHAT UI LOGIC ===

joinBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name) {
        currentUser = name;
        loginScreen.classList.add('hidden');
        messageContainer.classList.remove('hidden');
        addMessage('System', `Welcome, ${currentUser}.`, 'system');
    }
});

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const text = msgInput.value.trim();
    if (text && currentUser) {
        // 1. Add message to your own screen
        addMessage(currentUser, text, 'sent');
        
        // 2. Clear input
        msgInput.value = '';

        // NOTE: Here is where you would send the data to your database/server
        // example: database.ref('chats').push({ user: currentUser, text: text });
        
        // Simulate a reply for demo purposes
        // setTimeout(() => {
        //    addMessage('Partner', 'This is a simulated reply.', 'received');
        // }, 1000);
    }
}

function addMessage(user, text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    
    // Add user name if needed, or just text
    if (type === 'received') {
        msgDiv.innerText = `${user}: ${text}`;
    } else {
        msgDiv.innerText = text;
    }
    
    messagesList.appendChild(msgDiv);
    // Auto-scroll to bottom
    messagesList.scrollTop = messagesList.scrollHeight;
}
