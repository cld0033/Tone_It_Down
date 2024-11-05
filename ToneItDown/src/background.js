// Start by checking if it's possible to create a session based on the availability of the model, and the characteristics of the device.
const initializeSession = async () => {
    const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();

    if (available !== "no") {
        const session = await ai.languageModel.create();
    } else{
        console.error("prompt API didn't work");
    }
}

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // Handle input processing and summarization
    if (request.input) {
      console.log("Received input:", request.input);
      
        const result = await session.prompt("Write me a poem");
        console.log(result);
      // Return true to indicate you want to send a response asynchronously
      return true;
    }
  });
