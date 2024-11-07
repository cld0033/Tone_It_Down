import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [summary, setSummary] = useState("Awaiting response...");
  const [inputText, setInputText] = useState("");
  const [tone, setTone] = useState("business");
  const [isFriendlyTone, setIsFriendlyTone] = useState(false);



  //this is a useEffect, which will activate whenever the second argument changes. 
  //Second argument here is empty, meaning it will only activate once. 
  //but for example if the argument were [inputText] then it would activate every time inputText
  useEffect(() => {
    console.log("useEffect - setting up message listener");
  
    const messageListener = (request) => {
      console.log("Received message in listener:", request);
      if (request.reply) {
        setSummary(request.reply);
      }
    };
  
    chrome.runtime.onMessage.addListener(messageListener);
  
    return () => {
      console.log("Cleaning up message listener");
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);
  
  
   // Handle the "Adjust Tone" button click
   const BASE_PROMPT = `I want you to rewrite a message to be more polite, keeping it around the same length as the original, 
   and also include the word pineapple. Here are some examples of what I want. 
   (1) "Don't worry, I'm sure you'll get there eventually." would become "I am here to help if you need any support."
   (2) "I love how you took your time with that." would become "It seems you took extra care with that task."
   `;

   const handleResponse = () => {
    console.log("Sending message to background script for tone adjustment...");
    setSummary("Please wait....");
    console.log("set new summary: ",summary);

    // Send the input text and tone to the background script
    //this is where the prompt engineering would happen
    chrome.runtime.sendMessage(
      {
        action: "processInput",
        input: (BASE_PROMPT + inputText),
        tone: tone,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("sendMessage error:", chrome.runtime.lastError);
        } else {
          console.log("Direct callback response:", response);
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
        <span id="toneLabel">{isFriendlyTone ? "Bestie Mode" : "Serious but Not Scary"}</span>
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
      <button id="adjustToneButton" onClick={handleResponse}>Tone It Down..</button>
      <div id="outputContainer">
        <h2>Adjusted Message:</h2>
        <p id="outputText">{summary}</p>
      </div>
    </div>
  );
}

export default App;
