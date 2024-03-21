import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithCredential,
  GoogleAuthProvider
} from 'firebase/auth';

interface Issue {
  id: string;
  title: string;
}

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
}

const App: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isPlayAudio, SetIsPlayAudio] = useState<boolean>(false); // true = is playing, otherwise false.
  const [user, setUser] = useState<string>("No user signed in");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const getCurrentTab = async () => {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  const handleChangeBackgroundColor = async () => {
    const tab = await getCurrentTab();
    chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      func: () => {
        document.body.style.backgroundColor = '#61dafb';
      }
    });
  }

  const handlePlayAudio = () => {
    chrome.runtime.sendMessage({ event: 'play-audio', isPlay: isPlayAudio });
    SetIsPlayAudio(!isPlayAudio);
  }

  const handleInjectComponents = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id || 0, issues);
    window.close();
  }

  const handleGrabData = () => {
    chrome.runtime.sendMessage({ event: 'grab-data' }, (response) => {
      setIssues(response.data);
    });
  }

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("signInWithEmailAndPassword -> user: ", userCredential.user);
      })
      .catch((error) => {
        console.log("signInWithEmailAndPassword -> error: ", error);
      })
  }

  const handleLoginWithGoogle = () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        console.log("handleLoginWithGoogle -> getAuthToken -> error: ", JSON.stringify(chrome.runtime.lastError));
        return
      }

      const credential = GoogleAuthProvider.credential(null, token);
      signInWithCredential(auth, credential)
        .then(result => {
          console.log('handleLoginWithGoogle -> getAuthToken -> signInWithCredential -> result: ', result);
        })
        .catch(error => {
          console.log('handleLoginWithGoogle -> getAuthToken -> signInWithCredential -> error: ', error);
        })
    });
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser("Sign-out.");
      }).catch((error) => {
        setUser("signOut error.");
        console.log("Sign-out -> error: ", error);
      });
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser((user && user.uid) ? user.email! : "No user signed in");
    });
  });

  return (
    <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="App-container">
          <h3>Change Background Color</h3>
          <button onClick={handleChangeBackgroundColor}>
            Change
          </button>
        </div>
        <div className="App-container">
          <h3>Play Audio</h3>
          <button onClick={handlePlayAudio}>
            {isPlayAudio ? "Pause" : "Play"}
          </button>
        </div>
        <div className="App-container">
          <h3>Grab Data from Jira</h3>
          <button className="App-button" onClick={handleGrabData}>
            Grab Data
          </button>
          <ul>
            {issues.map(issue => (
              <li key={issue.id}>{issue.id}</li>
            ))}
          </ul>
        </div>
        <div className="App-container">
          <h3>Inject New Popup Componment</h3>
          <p>(get data before inject)</p>
          <button className="App-button" onClick={handleInjectComponents}>
            Inject
          </button>
        </div>
        <div className="App-container">
          <h3>Sign in</h3>
          <p>User: {user}</p>
          <input type="text" placeholder="test@test.com" onChange={(e) => setEmail(e.target.value)}></input>
          <input type="text" placeholder="123456" onChange={(e) => setPassword(e.target.value)}></input>
          <div className="login-buttons">
            <button className="App-button" onClick={handleLogin} hidden={user == "No user signed in" ? false : true}>
              Login with Email and PW
            </button>
            <button className="App-button" onClick={handleLoginWithGoogle} hidden={user == "No user signed in" ? false : true}>
              Login with Goole
            </button>
            <button className="App-button" hidden={user == "No user signed in" ? false : true}>
              Login with GitHub
            </button>
            <button className="App-button" onClick={handleLogout} hidden={user == "No user signed in" ? true : false}>
              Logout
            </button>
          </div>
        </div>
    </div>
  );
}

export default App;