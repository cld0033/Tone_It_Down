import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [summary, setSummary] = useState('Rewording...');
  const [inputText, setInputText] = useState('');
  const [tone, setTone] = useState('business');
  const [isFriendlyTone, setIsFriendlyTone] = useState(false); // dynamically changes tone sent in request

  // Listen for incoming messages from background.js
  useEffect(() => {
    console.log('useEffect - setting up message listener');

    const messageListener = (request, sender, sendResponse) => {
      console.log('Received message in listener:', request);
      if (request.action === 'openPopup' && request.text) {
        console.log('Populating input text with highlighted text:', request.text);
        setInputText(request.text); // Update the input field
        sendResponse({ status: 'Input text updated in popup' });
      } else if (request.reply) {
        setSummary((prev) => ' ' + request.reply);
      }
      if (request.action === "sendToPopup" && request.text) {
        setInputText(request.text); // Populate the inputText with the highlighted text
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      console.log('Cleaning up message listener');
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    setTone(isFriendlyTone ? 'friendly' : 'business');
  }, [isFriendlyTone]);

  // Handle the "Adjust Tone" button click
  const handleResponse = () => {
    console.log('Sending message to background script for tone adjustment...');
    setSummary('Please wait....');
    console.log('set new summary: ', summary);

    // Send the input text and tone to the background script
    chrome.runtime.sendMessage(
      {
        action: 'processInput',
        input: inputText,
        tone: tone,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('sendMessage error:', chrome.runtime.lastError);
        } else {
          console.log('Direct callback response:', response);
          setSummary(response.reply);
        }
      }
    );
  };

  return (
    <div className="popup-container">
      <textarea
        id="inputText"
        placeholder="Enter text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>
      <div className="tone-options">
        <span id="toneLabel">
          {isFriendlyTone ? 'Bestie Mode' : 'Serious but Not Scary'}
        </span>
        <label className="switch">
          <input
            type="checkbox"
            id="toneToggle"
            checked={isFriendlyTone}
            onChange={(e) => setIsFriendlyTone(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>
      <button id="adjustToneButton" onClick={handleResponse}>
        Tone It Down..
      </button>
      <div id="outputContainer">
        <h2>{isFriendlyTone ? 'Friendly Version:' : 'Business Version:'}</h2>
        <p id="outputText">{summary}</p>
      </div>
    </div>
  );
}

export default App;
