import { pipeline, env } from '@xenova/transformers';

// Set the cache directory and model path
env.cache_dir = chrome.runtime.getURL('models');

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
    console.log("Loading quantized ONNX model...");

    const modelUrl = chrome.runtime.getURL('models/model-quantized.onnx');
    const modelResponse = await fetch(modelUrl);
    if (!modelResponse.ok) {
      throw new Error(`Failed to fetch ONNX model: ${modelResponse.statusText}`);
    }
    const modelArrayBuffer = await modelResponse.arrayBuffer();
    console.log("Model loaded.");

    // Fetch tokenizer files
    const tokenizerUrl = chrome.runtime.getURL('models/tokenizer.json');
    const tokenizerConfigUrl = chrome.runtime.getURL('models/tokenizer_config.json');
    const specialTokensUrl = chrome.runtime.getURL('models/special-tokens_map.json');

    const tokenizerResponse = await fetch(tokenizerUrl);
    if (!tokenizerResponse.ok) {
      throw new Error(`Failed to fetch tokenizer: ${tokenizerResponse.statusText}`);
    }
    const tokenizerData = await tokenizerResponse.json();
    console.log("Tokenizer loaded.");

    const tokenizerConfigResponse = await fetch(tokenizerConfigUrl);
    if (!tokenizerConfigResponse.ok) {
      throw new Error(`Failed to fetch tokenizer config: ${tokenizerConfigResponse.statusText}`);
    }
    const tokenizerConfigData = await tokenizerConfigResponse.json();
    console.log("Tokenizer config loaded.");

    const specialTokensResponse = await fetch(specialTokensUrl);
    if (!specialTokensResponse.ok) {
      throw new Error(`Failed to fetch special tokens map: ${specialTokensResponse.statusText}`);
    }
    const specialTokensData = await specialTokensResponse.json();
    console.log("Special tokens map loaded.");

    // Initialize the pipeline after all files are loaded
    const tokenizer = {
      tokenizer: tokenizerData,
      tokenizerConfig: tokenizerConfigData,
      specialTokens: specialTokensData
    };

    toneClassifier = await pipeline('text-classification', {
      model: new Uint8Array(modelArrayBuffer),
      tokenizer: tokenizer,
      backend: 'onnx',
    });

    console.log("Pipeline initialized:", toneClassifier);

  } catch (error) {
    console.error("Error during pipeline initialization:", error);
  }
}

initializeModel();


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processInput") {
    console.log("Received processInput request:", request);

    (async () => {
      try {
        if (typeof toneClassifier !== 'function') {
          throw new Error("toneClassifier is not a function");
        }
        const result = await toneClassifier(request.input);
        console.log("background listener got this response:", result);
        sendResponse({ reply: result });
      } catch (error) {
        console.error("Error in getAPIResponse:", error);
        sendResponse({ error: error.message });
      }
    })();

    return true; // Keep the message channel open for async sendResponse
  }
});

// Adjusted this section for tone, can get more detailed but should be in a separate function.
async function getAPIResponse(input, tone) {
  try {
    if (!toneClassifier) {
      throw new Error("Tone classifier is not ready. Please wait for the model to load.");
    }

    if (tone === "business") {
      input = `The intended tone is serious and for a work colleague. Avoid being too casual. Here is the sentence: ${input}`;
    } else {
      input = `The intended tone is friendly. Use casual language to make the recipient feel comfortable. Here is the sentence: ${input}`;
    }

    const result = await predictTone(input);
    return result;
  } catch (error) {
    console.error("Error in getAPIResponse:", error);
    return "Error in API response";
  }
}
 

async function predictTone(sentence) {
  try {
    if (!toneClassifier) {
      console.warn("Tone classifier is not ready. Waiting...");
      return "Model is still loading. Please try again later.";
    }

    // Ensure input is a string
    if (typeof sentence !== 'string') {
      throw new Error("Input must be a string");
    }

    const predictions = await toneClassifier(sentence); // Ensure proper usage
    console.log("Tone prediction result:", predictions);
    return predictions[0]?.label || "Unknown tone";
  } catch (error) {
    console.error("Error predicting tone:", error);
    return "Error in tone prediction";
  }
}
