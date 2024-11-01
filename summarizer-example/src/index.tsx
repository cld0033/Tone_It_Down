import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Import the App component
import './App.css';

// Create a root element
const rootElement = document.createElement('div');
rootElement.className = 'container';
document.body.appendChild(rootElement);

// Create a root and render the App component
const root = createRoot(rootElement);
root.render(<App />);
