import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

interface Issue {
  id: string;
  title: string;
}

const App: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);

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
          <h3>Sign in with email and password</h3>
          <p>User: {user}</p>
          <div className="buttons">
            <button className="App-button" onClick={handleLogin}>
              Login
            </button>
            <button className="App-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
    </div>
  );
}

export default App;
