// pages/index.js
import { useState, useEffect } from "react";
import { auth, database } from "../firebaseConfig";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        loadMessages();
      } else {
        setCurrentUser(null);
      }
    });
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );
      setCurrentUser(userCredential.user);
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました。");
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  const sendMessage = async () => {
    if (!message) return;
    const timestamp = Date.now();
    const userData = (
      await database.ref(`users/${currentUser.uid}`).once("value")
    ).val();
    await database.ref("messages").push({
      uid: currentUser.uid,
      name: userData.name,
      message,
      timestamp,
    });
    setMessage("");
  };

  const loadMessages = () => {
    database.ref("messages").on("value", (snapshot) => {
      const messagesData = snapshot.val();
      const messagesArray = messagesData ? Object.values(messagesData) : [];
      setMessages(messagesArray);
    });
  };

  return (
    <div className={styles.container}>
      <h1 className="text-4xl font-bold mb-8 text-center">web chat</h1>
      {!currentUser ? (
        <div id="login-container" className="text-center">
          <h2 className="text-2xl mb-4">ログイン</h2>
          <input
            type="email"
            id="login-email"
            placeholder="メールアドレス"
            className="w-full mb-2 p-2 rounded"
          />
          <input
            type="password"
            id="login-password"
            placeholder="パスワード"
            className="w-full mb-4 p-2 rounded"
          />
          <button
            onClick={() =>
              login(
                document.getElementById("login-email").value,
                document.getElementById("login-password").value
              )
            }
            className="btn mb-2"
          >
            ログイン
          </button>
        </div>
      ) : (
        <div id="chat-container">
          <button onClick={logout} className="btn mb-4">
            ログアウト
          </button>
          <div id="output">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <strong>{msg.name}</strong>: {msg.message}
              </div>
            ))}
          </div>
          <input
            type="text"
            id="message"
            placeholder="メッセージ"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full mb-2 p-2 rounded"
          />
          <button onClick={sendMessage} className="btn">
            送信
          </button>
        </div>
      )}
    </div>
  );
}
