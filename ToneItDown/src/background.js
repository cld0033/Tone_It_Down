import { pipeline, env } from '@xenova/transformers';

// Set the cache directory and model path
env.cache_dir = 'models'; 

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
  try {
    console.log("Loading T5 tone classification model...");

    // Fetch the ONNX model file
    const modelUrl = chrome.runtime.getURL('models/onnx/model.onnx');
    const modelResponse = await fetch(modelUrl);
    const modelArrayBuffer = await modelResponse.arrayBuffer();

    // Initialize the tokenizer using the path to the model folder
    const tokenizerUrl = chrome.runtime.getURL('models');  // Folder containing the tokenizer files

    // Initialize the pipeline with the correct model and tokenizer
    toneClassifier = await pipeline('text-classification', {
      model: new Uint8Array(modelArrayBuffer),
      tokenizer: tokenizerUrl,  // Point to the folder containing tokenizer files
      backend: 'onnx',
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
        const result = await toneClassifier(request.input);
        console.log("background listener got this response:", result);
        sendResponse({ reply: result });
      } catch (error) {
        console.error("Error in getAPIResponse:", error);
      }
    })();

    return true; // Keep the message channel open for async sendResponse
  }
});

// Adjusted this section for tone, can get more detailed but should be in a separate function.
async function getAPIResponse(input, tone) {
  try {
    if (tone === "business") {
      console.log("business mode");
      input = "The intended tone is meant to be serious and for a work colleague. Avoid anything problematic but don't be too casual. Here is the sentence: " + input;
    } else {
      console.log("friendly mode");
      input = "The intended tone is meant to be friendly. Include occasional exclamation marks and casual language so the recipient feels comfortable. Here is the sentence: " + input;
    }
    const result = await predictTone(input);
    return result;
  } catch (error) {
    console.error("Error in getAPIResponse:", error);
    return "Error in API response";
  }
}
 

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