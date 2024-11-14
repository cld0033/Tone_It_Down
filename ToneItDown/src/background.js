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
          'adjusting the the subtext and nuance in a message based on the intended tone' +
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
              const response = await getAPIResponse(request.input,request.tone);
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


//adjusted this section for tone, can get more detailed but should be in a separate function. 
async function getAPIResponse(input, tone) {
  try {
    if (tone === "business"){
        console.log("business mode");
        input = "The intended tone is meant to be serious and for a work colleague. Avoid anything problematic but don't be too casual. Here is the sentence: " + input;
    }
    else {
      console.log("friendly mode");
      input = "The intended tone is meant to be friendly. Include occasional exclamation marks and casual language so the recipient feels comfortable. There is the sentence: " + input;
    }
    const result = await session.prompt(input);
    console.log('getAPIResponse got this result: ', result);
    return result || 'No reply returned by API.';
  } catch (error) {
    console.error('Error calling Gemini Nano API:', error);
    throw new Error('API call failed: ' + error.message);
  }
}
