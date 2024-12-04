// Function to initialize the session
let session;

const initializeSession = async () => {
  console.log('Initializing background');
  try {
    const { available } = await ai.languageModel.capabilities();

    if (available !== 'no') {
      session = await ai.languageModel.create({
        systemPrompt:
          'Pretend to be an executive assistant that is ' +
          'adjusting the subtext and nuance in a message based on the intended tone. ' +
          'Respond only with the rewritten message, and limit the rewritten message to a ' +
          'length similar to the original message. Also, be sure you are rewriting the message and not replying to it.',
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "highlightToPopup",
    title: "Rewrite this text with AI",
    contexts: ["selection"], // Show this only when text is selected
  });
  
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "highlightToPopup") {
    // Send the selected text to the popup
    chrome.runtime.sendMessage({
      action: "sendToPopup",
      text: info.selectionText,
    });
  }
});


// Listener for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processInput') {
    console.log('Received processInput request:', request);

    (async () => {
      try {
        const response = await getAPIResponse(request.input, request.tone);
        console.log('Background listener got this response:', response);
        sendResponse({ reply: response });
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

// Adjusted this section for tone, can get more detailed but should be in a separate function.
async function getAPIResponse(input, tone) {
  try {
    if (tone === 'business') {
      console.log('Business mode');
      input =
        `The intended tone is meant to be serious and for a work colleague. Avoid anything problematic but don\'t be too casual. 
        Here are some examples: 
        >[Oh, that's totally not obvious at all.] would become [That could be clearer.]
        >[Hey, I'm not sure if you're aware of this, but...] would become [Just a heads up, ...]
        >[Please respond as soon as you can.] would become [Please respond at your earliest convenience, if that's alright.]
        >[It\'s not rocket science.] would become [It\'s fairly straightforward]
        >[I\'l let you figure it out.] would become [Feel free to take a lead on this!]
        Here is the sentence: ` +
        input;
    } else {
      console.log('Friendly mode');
      input =
        `The intended tone is meant to be friendly. Include occasional exclamation marks, emojis, and casual language so the recipient feels comfortable. 
        Here are some examples: 
        >[Can we discuss this?] would become [Hey, I hope I'm not bothering you, but can we chat about this?]
        >[Ok.] would become [Okay! 😊]
        >[Sure.] would become [Absolutely!]
        >[I\'m not sure.] would become [I'm not sure, but I think...]
        >[You\'re wrong.] would become [Hey I think you might have missed something here!]
        >[I\'m very upset with you.] would become [I'm a bit upset, but I think we can work this out.]
        Here is the sentence: ` +
        input;
    }
    const result = await session.prompt(input);
    console.log('getAPIResponse got this result: ', result);
    return result || 'No reply returned by API.';
  } catch (error) {
    console.error('Error calling Gemini Nano API:', error);
    throw new Error('API call failed: ' + error.message);
  }
}
