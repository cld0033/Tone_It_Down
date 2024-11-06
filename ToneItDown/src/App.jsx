import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [summary, setSummary] = useState("Awaiting response...");
  const [inputText, setInputText] = useState("");
  const [tone, setTone] = useState("business");

  console.log("App rendered");
  // Listen for messages from background.js
  useEffect(() => {
    const messageListener = (request) => {
      if (request.reply) {
        console.log("App received a reply from background");
        setSummary(request.reply); // Update the summary state with the reply from background.js
      }
    };

    // Register the listener
    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleResponse = async () => {
    setSummary("Processing..."); // Set loading state

    try {
      // Send the input and tone message to the background
      chrome.runtime.sendMessage(
        { action: "processInput", input: inputText, tone: tone },
        (response) => {
          if (chrome.runtime.lastError) {
            console.log("processInput erro");
            setSummary(`Error: ${chrome.runtime.lastError.message}`);
          }
          // No need to handle response here, it's handled in the useEffect
        }
      );
    } catch (error) {
      console.log("Error 2");
      setSummary(`Error: ${error.message}`);
    }
  };

  return (
    <div className="popup-container">
      <h1>Tone it Down..</h1>
      <textarea
        id="inputText"
        placeholder="Enter text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>
      <div className="tone-options">
        <label htmlFor="toneToggle">Tone Preference:</label>
        <select
          id="toneToggle"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option value="business">Serious but Not Scary</option>
          <option value="friendly">Bestie Mode</option>
        </select>
      </div>
      <button onClick={handleResponse}>Adjust Tone</button>
      <div id="outputContainer">
        <h2>Adjusted Message:</h2>
        <p>{summary}</p>
      </div>
    </div>
  );
}

export default App;
