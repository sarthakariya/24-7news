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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const trigger = document.getElementById('secret-trigger');
const decoy = document.getElementById('decoy-view');
const chat = document.getElementById('chat-view');
const msgList = document.getElementById('messages-list');
const msgInput = document.getElementById('msg-input');
const mediaInput = document.getElementById('media-input');
const micBtn = document.getElementById('mic-btn');
const sendBtn = document.getElementById('send-btn');
const loginOverlay = document.getElementById('login-overlay');

let username = '';
let pressTimer;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// TRIGGER (2 seconds)
const unlockChat = () => {
    decoy.classList.add('hidden');
    chat.classList.remove('hidden');
    loginOverlay.classList.remove('hidden');
    document.getElementById('username-input').value = '';
};

const startPress = (e) => {
    // Prevent default context menu
    if (e.type === 'touchstart') {
       // e.preventDefault(); 
    }
    pressTimer = setTimeout(unlockChat, 2000);
};
const cancelPress = () => clearTimeout(pressTimer);

trigger.addEventListener('touchstart', startPress);
trigger.addEventListener('touchend', cancelPress);
trigger.addEventListener('mousedown', startPress);
trigger.addEventListener('mouseup', cancelPress);
// Prevent Copying Context Menu
trigger.addEventListener('contextmenu', event => event.preventDefault());

document.getElementById('close-chat').addEventListener('click', () => {
    chat.classList.add('hidden');
    decoy.classList.remove('hidden');
    username = '';
});

// LOGIN
document.getElementById('join-btn').addEventListener('click', () => {
    const name = document.getElementById('username-input').value.trim();
    if(name) {
        username = name;
        loginOverlay.classList.add('hidden');
    }
});

// INPUT HANDLER
msgInput.addEventListener('input', () => {
    if(msgInput.value.trim().length > 0) {
        micBtn.classList.add('hidden');
        sendBtn.classList.remove('hidden');
    } else {
        micBtn.classList.remove('hidden');
        sendBtn.classList.add('hidden');
    }
});

// SEND MESSAGE
const sendMessage = (content, type = 'text') => {
    if(!username) return;
    db.ref('messages').push({
        user: username,
        content: content,
        type: type,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        likes: false
    });
    msgInput.value = '';
    micBtn.classList.remove('hidden');
    sendBtn.classList.add('hidden');
};

sendBtn.addEventListener('click', () => sendMessage(msgInput.value.trim()));

// SEND MEDIA
document.getElementById('media-btn').addEventListener('click', () => mediaInput.click());
mediaInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if(file.size > 1000000) { alert("File too large. Please send smaller images/videos."); return; }
        const reader = new FileReader();
        reader.onload = (event) => {
            const type = file.type.startsWith('image') ? 'image' : 'video';
            sendMessage(event.target.result, type);
        };
        reader.readAsDataURL(file);
    }
});

// RECORD AUDIO
micBtn.addEventListener('click', async () => {
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            isRecording = true;
            micBtn.classList.add('recording');
            audioChunks = [];
            mediaRecorder.addEventListener("dataavailable", event => audioChunks.push(event.data));
            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks);
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => sendMessage(reader.result, 'audio');
            });
        } catch(err) { alert("Microphone access denied"); }
    } else {
        mediaRecorder.stop();
        isRecording = false;
        micBtn.classList.remove('recording');
    }
});

// RECEIVE MESSAGES
db.ref('messages').limitToLast(50).on('child_added', (snapshot) => {
    const data = snapshot.val();
    const key = snapshot.key;
    const isMe = data.user === username;
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'sent' : 'received'}`;
    div.id = key;
    div.addEventListener('dblclick', () => db.ref(`messages/${key}/likes`).set(!data.likes));

    let contentHtml = '';
    if(data.type === 'text') contentHtml = data.content;
    else if(data.type === 'image') contentHtml = `<div class="media-content"><img src="${data.content}"></div>`;
    else if(data.type === 'video') contentHtml = `<div class="media-content"><video src="${data.content}" controls></video></div>`;
    else if(data.type === 'audio') contentHtml = `<div class="audio-player"><audio src="${data.content}" controls></audio></div>`;

    const heartHtml = data.likes ? `<div class="reaction-heart">❤️</div>` : '';
    div.innerHTML = `${contentHtml}${heartHtml}`;
    msgList.appendChild(div);
    msgList.scrollTo(0, msgList.scrollHeight);
});

db.ref('messages').limitToLast(50).on('child_changed', (snapshot) => {
    const data = snapshot.val();
    const div = document.getElementById(snapshot.key);
    if(div) {
        const existingHeart = div.querySelector('.reaction-heart');
        if(data.likes && !existingHeart) div.insertAdjacentHTML('beforeend', `<div class="reaction-heart">❤️</div>`);
        else if(!data.likes && existingHeart) existingHeart.remove();
    }
});
