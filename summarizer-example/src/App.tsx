import React, { useEffect, useState } from 'react';

const App = () => {
  // define input and summary variables + setter functions
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    // Listener for messages from the background script
    const handleMessage = (request: { action: string; input: React.SetStateAction<string>; summary: React.SetStateAction<string>; }) => {
    if (request.action === "updateInput") {
      setInputText(request.input); // Update the input text
    } 
    else if (request.action === "summaryResult") {
      setSummary(request.summary); // Update the summary
    }
  };

  // Register the listener
  chrome.runtime.onMessage.addListener(handleMessage);
  // Clean up the listener on component unmount
  return () => {
    chrome.runtime.onMessage.removeListener(handleMessage);
  };
  }, []);

  const handleInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setInputText(event.target.value);
  };

  const handleSummarize = async () => {
    // Call the background script for summarization
    const response = await chrome.runtime.sendMessage({ action: 'summarize', input: inputText });
    setSummary(response.summary || 'Error: No summary returned.');
  };

  return (
    <div className="side-panel">
      <div className="side-panel-header">Tone it Down</div>
      <div className="side-panel-content">
        <p>Open me as a side panel! </p>
        <p>Try typing something into the text box, highlighting something on your page, or typing anything into the webpage you are on! </p>
        <textarea 
          value={inputText} 
          onChange={handleInputChange} 
          placeholder="Type something here..." 
        />
        <br></br>
        <button className="side-panel-button" onClick={handleSummarize}>Summarize</button>
        <h2>You typed:</h2>
        <p>{inputText}</p>
        <h2>Summary:</h2>
        <p>{summary}</p>
      </div>
    </div>
  );
};

export default App;
