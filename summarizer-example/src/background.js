let summarizer; // Declare summarizer in the global scope

// Check if the summarizer can be used
const initializeSummarizer = async () => {
  const canSummarize = await ai.summarizer.capabilities();

  if (canSummarize && canSummarize.available !== 'no') {
    if (canSummarize.available === 'readily') {
      // The summarizer can immediately be used.
      summarizer = await ai.summarizer.create();
    } else {
      // The summarizer can be used after the model download.
      summarizer = await ai.summarizer.create();
      summarizer.addEventListener('downloadprogress', (e) => {
        console.log(`Download progress: ${e.loaded}/${e.total}`);
      });
      await summarizer.ready;
    }
  } else {
    console.error("The summarizer can't be used at all.");
  }
};

// Listen for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");

  // Initialize the summarizer when the extension is installed
  initializeSummarizer().then(() => {
    console.log("Summarizer initialized successfully.");
  }).catch(error => {
    console.error("Error initializing summarizer:", error);
  });

  // Check if the side panel API is available
  if (chrome.sidePanel) {
    chrome.sidePanel.setOptions({
      path: 'index.html' // Ensure this points to your side panel HTML
    });
  } else {
    console.error("Side panel API is not available. Ensure you are using Chrome Canary.");
  }
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectContent") {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ['content.js'],
    }, () => {
      console.log("Content script injected.");
    });
  }

  // Handle input processing and summarization
  if (request.input) {
    console.log("Received input for summarization:", request.input);


    // Check if the summarizer is available
    if (summarizer) {
      summarizer.summarize(request.input)
        .then(result => {
          console.log("Summarization result:", result);
          // Send back the summarization result to the sender
          sendResponse({ summary: result });
        })
        .catch(error => {
          console.error("Error during summarization:", error);
          sendResponse({ error: "Summarization failed." });
        });
    } else {
      console.error("Summarizer is not initialized or available.");
      sendResponse({ error: "Summarizer not available." });
    }

    // Return true to indicate you want to send a response asynchronously
    return true;
  }
});
