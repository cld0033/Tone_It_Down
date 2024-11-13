// Function to initialize the session

let session;
const initializeSession = async () => {
  console.log('initializing background');
  try {
    const { available } = await ai.languageModel.capabilities();

    if (available !== 'no') {
      session = await ai.languageModel.create({
        systemPrompt:
          'Pretend to be an executive assistant that is ' +
          'toning down the subtext and nuance in an message to another employee, ' +
          'respond only with the rewritten message, and limit rewritten message to a ' +
          'resonable length',
      });

      console.log('Session initialized: AILanguageModel');
    } else {
      console.error('Prompt API is not available');
    }
  } catch (err) {
    console.error('Error initializing session:', err);
  }
};
initializeSession();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processInput") {
      console.log("Received processInput request:", request);

      (async () => {
          try {
              const response = await getAPIResponse(request.input);
              console.log("background listener got this response:", response);
              sendResponse({ reply: response });
          } catch (error) {
              console.error("Error in getAPIResponse:", error);
              sendResponse({ reply: `Error: ${error.message}` });
          }
      })();

      return true;  // Keeps the message channel open for async sendResponse
  }

  console.log("No valid action or session/input received.");
  sendResponse({ reply: "No valid action or session/input received." });
  return true;
});


//this will just return a response, can adjust for tone later.
async function getAPIResponse(input) {
  try {
    const result = await session.prompt(input);
    console.log('getAPIResponse got this result: ', result);
    return result || 'No reply returned by API.';
  } catch (error) {
    console.error('Error calling Gemini Nano API:', error);
    throw new Error('API call failed: ' + error.message);
  }
}
