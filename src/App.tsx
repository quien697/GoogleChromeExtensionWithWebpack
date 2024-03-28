import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { MessageAction, LoginType } from './enum';
import { IssueProps } from './interface';

const App: React.FC = () => {
  const logoutMessage: string = "No user signed in";
  const [issues, setIssues] = useState<IssueProps[]>([]);
  const [isPlayAudio, SetIsPlayAudio] = useState<boolean>(false);
  const [user, setUser] = useState<string>(logoutMessage);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
    chrome.runtime.sendMessage({
      action: MessageAction.PlayAudio,
      isPlay: isPlayAudio
    });
    SetIsPlayAudio(!isPlayAudio);
  }

  const handleGrabData = () => {
    chrome.runtime.sendMessage({
      action: MessageAction.GrabDataFromJira
    }, (response) => {
      setIssues(response.data);
    });
  }

  const handleInjectComponents = async () => {
    const tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id || 0, issues);
    window.close();
  }

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("App -> handleLogin -> user: ", userCredential.user);
      })
      .catch((error) => {
        console.log("App -> handleLogin -> error: ", error);
      })
  }

  const handleThreePartyLogin = (type: LoginType) => {
    chrome.runtime.sendMessage({
      action: MessageAction.SignIn,
      loginType: type
    });
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("handleLogout -> Successed");
      }).catch((error) => {
        console.log("handleLogout -> error: ", error);
      });
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser((user && user.uid) ? user.email! : logoutMessage);
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
            <button className="App-button" onClick={handleLogin} hidden={user == logoutMessage ? false : true}>
              Login with Email and PW
            </button>
            <button
              className="App-button"
              onClick={() => handleThreePartyLogin(LoginType.Google)}
              hidden={user == logoutMessage ? false : true}>
              Login with Goole
            </button>
            <button
              className="App-button"
              onClick={() => handleThreePartyLogin(LoginType.GitHub)}
              hidden={user == logoutMessage ? false : true}>
              Login with GitHub
            </button>
            <button
              className="App-button"
              onClick={() => handleThreePartyLogin(LoginType.Spotify)}
              hidden={user == logoutMessage ? false : true}>
              Login with Spotify (No Firebase)
            </button>
            <button
              className="App-button"
              onClick={handleLogout}
              hidden={user == logoutMessage ? true : false}>
              Logout
            </button>
          </div>
        </div>
    </div>
  );
}

export default App;