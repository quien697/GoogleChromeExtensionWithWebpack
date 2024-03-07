import React from 'react';
import logo from './logo.svg';
import './App.css';

const App: React.FC = () => {
  const handleChangeBackgroundColor = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      func: () => {
        document.body.style.backgroundColor = '#61dafb';
      }
    });
  }

  const handleInjectComponents = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id || 0, "Component A");
    window.close();
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
        <button className="App-button" onClick={handleInjectComponents}>
          Inject Components A
        </button>
      </header>
    </div>
  );
}

export default App;
