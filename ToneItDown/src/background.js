let session;

const initializeSession = async () => {
    const { available } = await ai.languageModel.capabilities();
    if (available !== "no") {
        session = await ai.languageModel.create();
        console.log("Session initialized: AILanguageModel");
    } else {
        console.error("Prompt API is not available");
    }
};

// Initialize the session when the background script starts
initializeSession();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.input && session) {
        console.log("Processing input:", request.input);
        try {
            const result = await session.prompt(request.input);
            console.log("Full prompt result:", result);
            const replyText = result.reply;

            sendResponse({ reply: replyText || "No reply text returned." });
        } catch (error) {
            console.error("Error fetching reply:", error);
            sendResponse({ reply: `Error: ${error.message}` });
        }
    } else {
        if (request.action === "processInput") {
            const { input, tone } = request;
        
            // Call your API and get the result
            getAPIResponse(input, tone).then((response) => {
              // After processing, send the response back to the popup
              chrome.runtime.sendMessage({ reply: response });
            }).catch((error) => {
              console.error("Error fetching response:", error);
              chrome.runtime.sendMessage({ reply: `Error: ${error.message}` });
            });
          
        } else {
            sendResponse({ reply: "No active session or invalid input." });
        }
    }
    // Return true to keep the channel open while awaiting the async operation
    return true;
});

