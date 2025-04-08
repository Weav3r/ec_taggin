// Get the generate button and card list elements
const generateButton = document.getElementById('generate-button');
const cardList = document.getElementById('card-list');

// Add an event listener to the generate button
generateButton.addEventListener('click', generateCard);

// Function to generate a card
function generateCard() {
    // Get the input values
    const callingNumber = document.getElementById('calling-number').value;
    const incidentNumber = document.getElementById('incident-number').value;
    const name = document.getElementById('name').value;
    const reasonForCalling = document.getElementById('reason-for-calling').value;
    const findings = document.getElementById('findings').value;
    const resolution = document.getElementById('resolution').value;

    // Create a JSON object with the input values
    const cardData = {
        callingNumber: callingNumber,
        incidentNumber: incidentNumber,
        name: name,
        reasonForCalling: reasonForCalling,
        findings: findings,
        resolution: resolution
    };

    // Create a card element
    const card = document.createElement('div');
    card.classList.add('card');

    // Create a copy button element
    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-button');
    copyButton.textContent = 'Copy';

    // Add an event listener to the copy button
    copyButton.addEventListener('click', () => {
        // Copy the card data to the clipboard
        navigator.clipboard.writeText(JSON.stringify(cardData, null, 2));
    });

    // Create a card content element
    const cardContent = document.createElement('div');
    cardContent.innerHTML = `
        <h2>Card Data</h2>
        <p>Calling Number: ${cardData.callingNumber}</p>
        <p>Incident Number: ${cardData.incidentNumber}</p>
        <p>Name: ${cardData.name}</p>
        <p>Reason for Calling: ${cardData.reasonForCalling}</p>
        <p>Findings: ${cardData.findings}</p>
        <p>Resolution: ${cardData.resolution}</p>
    `;

    // Add the copy button and card content to the card element
    card.appendChild(copyButton);
    card.appendChild(cardContent);

    // Add the card element to the card list
    cardList.appendChild(card);
}
