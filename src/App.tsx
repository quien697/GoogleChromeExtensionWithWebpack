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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button className="App-button" onClick={handleChangeBackgroundColor}>
          Change Background Color
        </button>
        <button className="App-button" onClick={handleGrabData}>
          Grab Data From Jira
        </button>
        <button className="App-button" onClick={handleInjectComponents}>
          Inject New Popup Componment
        </button>
        {issues.map(issue => (
          <p id="issues" key={issue.id}>{issue.id}</p>
        ))}
      </header>
    </div>
  );
}

export default App;
