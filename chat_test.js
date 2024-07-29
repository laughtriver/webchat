// Firebaseの設定
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREVASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();
let messagesRef;
let currentUser;

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("ログイン成功");
      currentUser = userCredential.user;
      showChatInterface();
    })
    .catch((error) => {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました。");
    });
}

function logout() {
  auth
    .signOut()
    .then(() => {
      console.log("ログアウト成功");
      currentUser = null;
      showLoginInterface();
    })
    .catch((error) => {
      console.error("ログアウトエラー:", error);
    });
}

function showLoginInterface() {
  document.getElementById("login-container").style.display = "block";
  document.getElementById("chat-container").style.display = "none";
  if (messagesRef) {
    messagesRef.off();
    messagesRef = null;
  }
}

function showChatInterface() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("chat-container").style.display = "block";
  loadMessages();
}

function sendMessage() {
  const message = document.getElementById("message").value;
  const timestamp = Date.now();

  database
    .ref("users/" + currentUser.uid)
    .once("value")
    .then((snapshot) => {
      const userData = snapshot.val();
      return database.ref("messages").push({
        uid: currentUser.uid,
        name: userData.name,
        message: message,
        timestamp: timestamp,
      });
    })
    .then(() => {
      document.getElementById("message").value = "";
    })
    .catch((error) => {
      console.error("メッセージ送信エラー:", error);
    });
}

function loadMessages() {
  const output = document.getElementById("output");
  output.innerHTML = ""; // Clear existing messages

  if (messagesRef) {
    messagesRef.off();
  }

  messagesRef = database.ref("messages").orderByChild("timestamp");
  messagesRef.on("child_added", (snapshot) => {
    const message = snapshot.val();
    const messageElement = document.createElement("div");
    messageElement.className = "message";
    messageElement.innerHTML = `<strong>${message.name}:</strong> ${message.message}`;
    output.appendChild(messageElement);
    output.scrollTop = output.scrollHeight;
  });
}

auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    showChatInterface();
  } else {
    showLoginInterface();
  }
});
