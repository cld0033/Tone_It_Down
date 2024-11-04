// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const toneToggle = document.getElementById('toneToggle');
    const adjustToneButton = document.getElementById('adjustToneButton');
    const outputContainer = document.getElementById('outputContainer');
    const outputText = document.getElementById('outputText');

    adjustToneButton.addEventListener('click', async () => {
        const message = inputText.value;
        const tonePreference = toneToggle.value;

        if (message.trim() === '') {
            alert('Please enter a message to adjust.');
            return;
        }

        // Placeholder for API call
        try {
            const adjustedMessage = await adjustTone(message, tonePreference);
            outputText.textContent = adjustedMessage;
            outputContainer.style.display = 'block';
        } catch (error) {
            console.error('Error adjusting tone:', error);
            alert('There was an error processing your request. Please try again later.');
        }
    });

    // Function to simulate API call - replace this with actual API integration
    async function adjustTone(message, tone) {
        // Simulate a delay to represent a network call
        return new Promise((resolve) => {
            setTimeout(() => {
                if (tone === 'business') {
                    resolve(`(Business Tone) ${message}`);
                } else {
                    resolve(`(Friendly Tone) ${message}`);
                }
            }, 1000);
        });
    }
});
