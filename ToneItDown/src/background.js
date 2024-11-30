import { pipeline } from '@xenova/transformers';
import { env } from '@huggingface/transformers';


// Function to initialize the session
let session;
let toneClassifier;

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

async function initializeModel() {
  // Specify a custom location for models (defaults to '/models/').
  env.localModelPath = './models/';

  // Disable the loading of remote models from the Hugging Face Hub:
  env.allowRemoteModels = false;

  // Set location of .wasm files. Defaults to use a CDN.
  env.backends.onnx.wasm.wasmPaths = './models/onnx';
  try {
    console.log("Loading T5 tone classification model...");

    // Initialize the pipeline with local paths to model and tokenizer
    toneClassifier = await pipeline('text-classification', null, {
        model: './models', // Path to the model files
        tokenizer: './models', // Path to the tokenizer files
    });

    console.log("Model loaded successfully.");
} catch (error) {
    console.error("Error loading the model:", error);
}
}
initializeModel();

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
};

async function predictTone(sentence) {
  if (!toneClassifier) {
      throw new Error("Tone classifier is not initialized.");
  }
  try {
      const predictions = await toneClassifier(sentence);
      console.log("Tone prediction result:", predictions);
      return predictions[0]?.label || "Unknown tone";
  } catch (error) {
      console.error("Error predicting tone:", error);
      return "Error in tone prediction";
  }
}

// Example: Call predictTone to test functionality
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processTone") {
      predictTone(request.sentence)
          .then((tone) => sendResponse({ tone }))
          .catch((err) => sendResponse({ error: err.message }));
      return true; // Keeps the message channel open for async response
  }
});