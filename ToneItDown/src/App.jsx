import { useState } from 'react'
import './App.css'

console.log("App.jsx running");
function App() {
  const [count, setCount] = useState(0)

  const handleResponse = async () => {
    // Call the background script for summarization
    const response = await chrome.runtime.sendMessage({ action: 'summarize', input: inputText });
    setSummary(response.summary || 'Error: No summary returned.');
  };

  return (
    <div className="popup-container">
      <h1>Tone it Down..</h1>
      <textarea id="inputText" placeholder="Enter text here..."></textarea>
      <div className="tone-options">
        <label htmlFor="toneToggle">Tone Preference:</label>
        <select id="toneToggle">
          <option value="business">Serious but Not Scary</option>
          <option value="friendly">Bestie Mode</option>
        </select>
      </div>
      <button id="adjustToneButton">Adjust Tone</button>
      <div id="outputContainer">
        <h2>Adjusted Message:</h2>
        <p id="outputText"></p>
      </div>
      <button className="response-button" onClick={handleResponse}>Response</button>
    </div>
  );
}

export default App
