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

//receive inputs, call the prompt API, and send back the response to App
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processInput') {
    //request is action, input, and tone
    console.log('Received processInput request:', request);

    (async () => {
      try {
        if (!session) {
          console.error('Session not initialized. Retrying...');
          await initializeSession();
        }
        if (!session) {
          throw new Error('Failed to initialize session.');
        }
        const promptMessage = `Please rewrite the following message in a'
        + ' ${request.tone} tone: "${request.input}"`;
        const response = await getAPIResponse(promptMessage); //request.input
        console.log('background listener got this response:', response);

        // Log before sending the response back
        console.log('Sending to popup...');
        sendResponse({ reply: response });
        console.log('response sent with: ', response);
      } catch (error) {
        console.error('Error in getAPIResponse:', error);
        sendResponse({ reply: `Error: ${error.message}` });
      }
    })();

    return true; // Keeps the message channel open for async sendResponse
  }

  console.log('No valid action or session/input received.');
  sendResponse({ reply: 'No valid action or session/input received.' });
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
