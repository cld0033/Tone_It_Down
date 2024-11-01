console.log("Content script running");

// Store the latest input text globally
let latestInputText = '';

// This function updates the latest input text and sends a message to the background
const updateInputText = (text) => {
    latestInputText = text; // Update the global variable with current input
    console.log("Input detected:", latestInputText);
    chrome.runtime.sendMessage({ action: "updateInput", input: latestInputText });
};

// This function listens for input events and logs the value of input fields
const inputHandler = (event) => {
    if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
        updateInputText(event.target.value); // Call to update input text
    }
};

// Detect highlighted text in the document
const detectHighlightedText = () => {
    const selectedText = window.getSelection().toString(); // Get the highlighted text
    if (selectedText) {
        updateInputText(selectedText); // Update latest input text with selected text
    }
};

// Asynchronous function to send messages to the background script
function sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

// Example of detecting input and sending a message
document.addEventListener('input', inputHandler);

// Add event listeners to all input elements on the page
const inputs = document.querySelectorAll("input, textarea");
inputs.forEach(input => {
    input.addEventListener("input", inputHandler);
});

// Button for summarization
const summarizeButton = document.createElement('button');
summarizeButton.innerText = 'Get Summary';
summarizeButton.id = 'get-summary-button';
document.body.appendChild(summarizeButton); // Add button to the body or any specific element

summarizeButton.addEventListener('click', async () => {
    // Use the latest input text stored in the global variable
    const inputText = latestInputText;

    console.log("Input text captured for summarization:", inputText); // Debugging line

    if (inputText) {
        try {
            const response = await sendMessageAsync({ action: "summarize", input: inputText });
            console.log("Summary from background:", response.summary);
            // Optionally, display the summary in the UI
        } catch (error) {
            console.error("Error sending message:", error);
        }
    } else {
        console.warn("No input text to summarize."); // This will log if inputText is empty
    }
});

// Optionally, you could set up a mutation observer to handle dynamically added input fields
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
                    node.addEventListener("input", inputHandler);
                }
            });
        }
    });
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Add a mouseup event listener to detect when text is highlighted
document.addEventListener('mouseup', detectHighlightedText);
