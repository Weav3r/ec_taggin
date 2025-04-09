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
    const interaction = {
        id: Date.now(),
        datetime: new Date().toISOString(),
        cn: callingNumber,
        in: incidentNumber,
        name: name,
        reason: reasonForCalling,
        findings: findings,
        resolution: resolution
    };

    // Get the current date
    const date = new Date();
    const currentDate = `${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}_${date.getFullYear()}`;

    // Check if the date already exists in local storage
    let storedData = localStorage.getItem('interactions');
    if (storedData) {
        storedData = JSON.parse(storedData);
        const existingDate = storedData.find((item) => item.date === currentDate);
        if (existingDate) {
            existingDate.interactions.push(interaction);
            localStorage.setItem('interactions', JSON.stringify(storedData));
        } else {
            storedData.push({ date: currentDate, interactions: [interaction] });
            localStorage.setItem('interactions', JSON.stringify(storedData));
        }
    } else {
        localStorage.setItem('interactions', JSON.stringify([{ date: currentDate, interactions: [interaction] }]));
    }

    // Display the interactions
    displayInteractions();
}



// Function to display the interactions
function displayInteractions() {
    // Get the stored data
    const storedData = localStorage.getItem('interactions');
    if (storedData) {
        const data = JSON.parse(storedData);
        //  Call the populateSidebar function here
        populateSidebar(data);

        const currentDate = `${String(new Date().getMonth() + 1).padStart(
            2,
            '0'
        )}_${String(new Date().getDate()).padStart(2, '0')}_${new Date().getFullYear()}`;
        const currentInteractions = data.find((item) => item.date === currentDate);

        if (currentInteractions) {
            const interactions = currentInteractions.interactions.sort(
                (a, b) => new Date(b.datetime) - new Date(a.datetime)
            );
            const interactionList = interactions
                .map((interaction) => {
                    let cardContent = '';
                    if (interaction.reason)
                        cardContent += `<h2 class="text-2xl font-bold mb-2">${interaction.reason}</h2>`;
                    if (interaction.datetime)
                        cardContent += `<p class="text-gray-600">Date: ${new Date(
                            interaction.datetime
                        ).toLocaleString()}</p>`;
                    if (interaction.cn)
                        cardContent += `<p class="text-gray-600">Calling Number: ${interaction.cn}</p>`;
                    if (interaction.in)
                        cardContent += `<p class="text-gray-600">Incident Number: ${interaction.in}</p>`;
                    if (interaction.name)
                        cardContent += `<p class="text-gray-600">Name: ${interaction.name}</p>`;
                    if (interaction.findings)
                        cardContent += `<p class="text-gray-600">Findings: ${interaction.findings}</p>`;
                    if (interaction.resolution)
                        cardContent += `<p class="text-gray-600">Resolution: ${interaction.resolution}</p>`;

                    //add done button
                    return `
            <div class="card ${interaction.completed ? 'completed-card' : ''
                        }">
              <button class="done-button" onclick="toggleComplete(${interaction.id
                        })"><i class="fas fa-check-circle"></i></button>
                ${cardContent}
                <div class="flex justify-end mt-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2" onclick="copyInteraction(${interaction.id
                        })">Copy</button>
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mx-2" onclick="updateInteraction(${interaction.id
                        })">Update</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2" onclick="deleteInteraction(${interaction.id
                        })">Delete</button>
                </div>
            </div>
        `;
                })
                .join('');
            cardList.innerHTML = interactionList;
        } else {
            cardList.innerHTML = '';
        }
    } else {
        cardList.innerHTML = '';
    }
}

//Add toggleComplete function
function toggleComplete(interactionId) {
    const storedData = localStorage.getItem('interactions');
    if (storedData) {
        const data = JSON.parse(storedData);
        const currentDate = `${String(new Date().getMonth() + 1).padStart(
            2,
            '0'
        )}_${String(new Date().getDate()).padStart(2, '0')}_${new Date().getFullYear()}`;
        const currentInteractions = data.find((item) => item.date === currentDate);
        if (currentInteractions) {
            const interaction = currentInteractions.interactions.find(
                (interaction) => interaction.id === interactionId
            );
            if (interaction) {
                interaction.completed = !interaction.completed; // Toggle the completed status
                localStorage.setItem('interactions', JSON.stringify(data)); // Save the updated data
                displayInteractions(); // Refresh the display
            }
        }
    }
}
//Update generateCard to set completed
function generateCard() {
    // Get the input values
    const callingNumber = document.getElementById('calling-number').value;
    const incidentNumber = document.getElementById('incident-number').value;
    const name = document.getElementById('name').value;
    const reasonForCalling = document.getElementById('reason-for-calling').value;
    const findings = document.getElementById('findings').value;
    const resolution = document.getElementById('resolution').value;

    // Create a JSON object with the input values
    const interaction = {
        id: Date.now(),
        datetime: new Date().toISOString(),
        cn: callingNumber,
        in: incidentNumber,
        name: name,
        reason: reasonForCalling,
        findings: findings,
        resolution: resolution,
        completed: false, //Initialize completed to false
    };

    // Get the current date
    const date = new Date();
    const currentDate = `${String(date.getMonth() + 1).padStart(
        2,
        '0'
    )}_${String(date.getDate()).padStart(2, '0')}_${date.getFullYear()}`;

    // Check if the date already exists in local storage
    let storedData = localStorage.getItem('interactions');
    if (storedData) {
        storedData = JSON.parse(storedData);
        const existingDate = storedData.find((item) => item.date === currentDate);
        if (existingDate) {
            existingDate.interactions.push(interaction);
            localStorage.setItem('interactions', JSON.stringify(storedData));
        } else {
            storedData.push({ date: currentDate, interactions: [interaction] });
            localStorage.setItem('interactions', JSON.stringify(storedData));
        }
    } else {
        localStorage.setItem(
            'interactions',
            JSON.stringify([{ date: currentDate, interactions: [interaction] }])
        );
    }

    // Display the interactions
    displayInteractions();
}


// Function to update an interaction
function updateInteraction(id) {
    const storedData = localStorage.getItem('interactions');
    if (storedData) {
        const data = JSON.parse(storedData);
        const currentDate = `${String(new Date().getMonth() + 1).padStart(2, '0')}_${String(new Date().getDate()).padStart(2, '0')}_${new Date().getFullYear()}`;
        const currentInteractions = data.find((item) => item.date === currentDate);
        if (currentInteractions) {
            const interactionToUpdate = currentInteractions.interactions.find((interaction) => interaction.id === id);
            if (interactionToUpdate) {
                // Update the interaction
                document.getElementById('calling-number').value = interactionToUpdate.cn;
                document.getElementById('incident-number').value = interactionToUpdate.in;
                document.getElementById('name').value = interactionToUpdate.name;
                document.getElementById('reason-for-calling').value = interactionToUpdate.reason;
                document.getElementById('findings').value = interactionToUpdate.findings;
                document.getElementById('resolution').value = interactionToUpdate.resolution;

                // Update the generate button to update the interaction instead of creating a new one
                document.getElementById('generate-button').onclick = function () {
                    updateInteractionConfirm(id);
                };

                // Add a confirm update button
                const confirmUpdateButton = document.createElement('button');
                confirmUpdateButton.textContent = 'Confirm Update';
                confirmUpdateButton.className = 'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded';
                confirmUpdateButton.onclick = function () {
                    updateInteractionConfirm(id);
                };
                document.getElementById('interaction-form').appendChild(confirmUpdateButton);
            }
        }
    }
}

// Function to confirm update an interaction
function updateInteractionConfirm(id) {
    const storedData = localStorage.getItem('interactions');
    if (storedData) {
        const data = JSON.parse(storedData);
        const currentDate = `${String(new Date().getMonth() + 1).padStart(2, '0')}_${String(new Date().getDate()).padStart(2, '0')}_${new Date().getFullYear()}`;
        const currentInteractions = data.find((item) => item.date === currentDate);
        if (currentInteractions) {
            const interactionToUpdate = currentInteractions.interactions.find((interaction) => interaction.id === id);
            if (interactionToUpdate) {
                // Update the interaction
                interactionToUpdate.cn = document.getElementById('calling-number').value;
                interactionToUpdate.in = document.getElementById('incident-number').value;
                interactionToUpdate.name = document.getElementById('name').value;
                interactionToUpdate.reason = document.getElementById('reason-for-calling').value;
                interactionToUpdate.findings = document.getElementById('findings').value;
                interactionToUpdate.resolution = document.getElementById('resolution').value;

                // Save the updated interaction
                localStorage.setItem('interactions', JSON.stringify(data));

                // Display the updated interactions
                displayInteractions();

                // Reset the generate button
                document.getElementById('generate-button').onclick = generateCard;

                // Remove the confirm update button
                const confirmUpdateButton = document.getElementById('interaction-form').lastChild;
                if (confirmUpdateButton.textContent === 'Confirm Update') {
                    document.getElementById('interaction-form').removeChild(confirmUpdateButton);
                }
            }
        }
    }
}

// Function to delete an interaction
function deleteInteraction(id) {
    const storedData = localStorage.getItem('interactions');
    if (storedData) {
        const data = JSON.parse(storedData);
        const currentDate = `${String(new Date().getMonth() + 1).padStart(2, '0')}_${String(new Date().getDate()).padStart(2, '0')}_${new Date().getFullYear()}`;
        const currentInteractions = data.find((item) => item.date === currentDate);
        if (currentInteractions) {
            const interactionToDeleteIndex = currentInteractions.interactions.findIndex((interaction) => interaction.id === id);
            if (interactionToDeleteIndex !== -1) {
                // Delete the interaction
                currentInteractions.interactions.splice(interactionToDeleteIndex, 1);

                // Save the updated interactions
                localStorage.setItem('interactions', JSON.stringify(data));

                // Display the updated interactions
                displayInteractions();
            }
        }
    }
}



// Function to copy an interaction

function copyInteraction(id) {
    const storedData = localStorage.getItem('interactions');
    if (storedData) {
        const data = JSON.parse(storedData);
        const interactions = data.reduce((acc, curr) => acc.concat(curr.interactions), []);
        const interactionToCopy = interactions.find((interaction) => interaction.id === id);
        if (interactionToCopy) {
            // Create a text string with the interaction details
            let textToCopy = '';
            if (interactionToCopy.cn) textToCopy += `Calling Number: ${interactionToCopy.cn}\n`;
            if (interactionToCopy.in) textToCopy += `Incident Number: ${interactionToCopy.in}\n`;
            if (interactionToCopy.name) textToCopy += `Name: ${interactionToCopy.name}\n`;
            if (interactionToCopy.reason) textToCopy += `Reason for Calling: ${interactionToCopy.reason}\n`;
            if (interactionToCopy.findings) textToCopy += `Findings: ${interactionToCopy.findings}\n`;
            if (interactionToCopy.resolution) textToCopy += `Resolution: ${interactionToCopy.resolution}\n`;

            // Copy the text to the clipboard
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('Interaction copied to clipboard');
                }, () => {
                    alert('Failed to copy interaction to clipboard');
                });
            } else {
                alert('No interaction details to copy');
            }
        } else {
            alert('Interaction not found');
        }
    } else {
        alert('No interactions found');
    }
}




// Call displayInteractions when the page loads
document.addEventListener('DOMContentLoaded', displayInteractions);

