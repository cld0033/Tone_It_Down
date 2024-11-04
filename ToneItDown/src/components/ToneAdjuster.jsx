
import React, { useState } from 'react';

function ToneAdjuster() {
  const [message, setMessage] = useState('');
  const [adjustedMessage, setAdjustedMessage] = useState('');
  const [tone, setTone] = useState('friendly');

  const handleAdjustTone = async () => {
    const mockResponse = `Adjusted message in ${tone} tone`;
    setAdjustedMessage(mockResponse);
  };

  return (
    <div className="tone-adjuster">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message here"
      />
      <select onChange={(e) => setTone(e.target.value)} value={tone}>
        <option value="friendly">Friendly</option>
        <option value="neutral">Neutral</option>
        <option value="professional">Professional</option>
      </select>
      <button onClick={handleAdjustTone}>Adjust Tone</button>

      {adjustedMessage && (
        <div className="adjusted-message">
          <h2>Suggested Message:</h2>
          <p>{adjustedMessage}</p>
        </div>
      )}
    </div>
  );
}

export default ToneAdjuster;
