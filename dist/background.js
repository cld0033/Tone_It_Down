let n;const a=async()=>{console.log("Initializing background");try{const{available:e}=await ai.languageModel.capabilities();e!=="no"?(n=await ai.languageModel.create({systemPrompt:"Pretend to be an executive assistant that is adjusting the subtext and nuance in a message based on the intended tone. Respond only with the rewritten message, and limit the rewritten message to a reasonable length."}),console.log("Session initialized: AILanguageModel")):console.error("Prompt API is not available")}catch(e){console.error("Error initializing session:",e)}};a();chrome.runtime.onInstalled.addListener(()=>{chrome.contextMenus.create({id:"highlightToPopup",title:"Rewrite this text with AI",contexts:["selection"]})});chrome.contextMenus.onClicked.addListener((e,s)=>{e.menuItemId==="highlightToPopup"&&chrome.runtime.sendMessage({action:"sendToPopup",text:e.selectionText})});chrome.runtime.onMessage.addListener((e,s,o)=>e.action==="processInput"?(console.log("Received processInput request:",e),(async()=>{try{const t=await i(e.input,e.tone);console.log("Background listener got this response:",t),o({reply:t})}catch(t){console.error("Error in getAPIResponse:",t),o({reply:`Error: ${t.message}`})}})(),!0):(console.log("No valid action or session/input received."),o({reply:"No valid action or session/input received."}),!0));async function i(e,s){try{s==="business"?(console.log("Business mode"),e=`The intended tone is meant to be serious and for a work colleague. Avoid anything problematic but don't be too casual. 
        Here are some examples: 
        >[Oh, that's totally not obvious at all.] would become [That could be clearer.]
        >[Hey, I'm not sure if you're aware of this, but...] would become [Just a heads up, ...]
        >[Please respond as soon as you can.] would become [Please respond at your earliest convenience, if that's alright.]
        >[It's not rocket science.] would become [It's fairly straightforward]
        >[I'l let you figure it out.] would become [Feel free to take a lead on this!]
        Here is the sentence: `+e):(console.log("Friendly mode"),e=`The intended tone is meant to be friendly. Include occasional exclamation marks, emojis, and casual language so the recipient feels comfortable. 
        Here are some examples: 
        >[Can we discuss this?] would become [Hey, I hope I'm not bothering you, but can we chat about this?]
        >[Ok.] would become [Okay! 😊]
        >[Sure.] would become [Absolutely!]
        >[I'm not sure.] would become [I'm not sure, but I think...]
        >[You're wrong.] would become [Hey I think you might have missed something here!]
        >[I'm very upset with you.] would become [I'm a bit upset, but I think we can work this out.]
        Here is the sentence: `+e);const o=await n.prompt(e);return console.log("getAPIResponse got this result: ",o),o||"No reply returned by API."}catch(o){throw console.error("Error calling Gemini Nano API:",o),new Error("API call failed: "+o.message)}}
