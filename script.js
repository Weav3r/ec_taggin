const form = document.getElementById('interaction-form');
const cardList = document.getElementById('card-list');
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content");

let activeSidebarButton = null;

function getCurrentDate() {
    const date = new Date();
    return `${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}_${date.getFullYear()}`;
}

function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(form);

    const interaction = {
        id: Date.now(),
        datetime: new Date().toISOString(),
        cn: formData.get('calling-number'),
        in: formData.get('incident-number'),
        name: formData.get('name'),
        reason: formData.get('reason-for-calling'),
        findings: formData.get('findings'),
        resolution: formData.get('resolution'),
        completed: false
    };

    const currentDate = getCurrentDate();
    let storedData = JSON.parse(localStorage.getItem('interactions')) || [];

    const existingDateEntry = storedData.find((item) => item.date === currentDate);
    if (existingDateEntry) {
        existingDateEntry.interactions.push(interaction);
    } else {
        storedData.push({ date: currentDate, interactions: [interaction] });
    }

    localStorage.setItem('interactions', JSON.stringify(storedData));
    form.reset();
    displayInteractions();
    populateSidebar(storedData, currentDate); // refresh sidebar
}

function displayInteractions(targetDate = getCurrentDate()) {
    const storedData = JSON.parse(localStorage.getItem('interactions')) || [];
    const entry = storedData.find((item) => item.date === targetDate);

    if (!entry) {
        cardList.innerHTML = '<p class="text-gray-500 text-center">No interactions found for this date.</p>';
        return;
    }

    const interactionList = entry.interactions
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
        .map((interaction) => {
            let content = `
        ${interaction.reason ? `<h2 class="text-2xl font-bold mb-2 reason">${interaction.reason}</h2>` : ''}
        <p class="text-gray-600">Date: ${new Date(interaction.datetime).toLocaleString()}</p>
        ${interaction.cn ? `<p class="text-gray-600 calling-number">Calling Number: ${interaction.cn}</p>` : ''}
        ${interaction.in ? `<p class="text-gray-600 incident-number">Incident Number: ${interaction.in}</p>` : ''}
        ${interaction.name ? `<p class="text-gray-600 name">Name: ${interaction.name}</p>` : ''}
        ${interaction.findings ? `<p class="text-gray-600 findings">Findings: ${interaction.findings}</p>` : ''}
        ${interaction.resolution ? `<p class="text-gray-600 resolution">Resolution: ${interaction.resolution}</p>` : ''}`;

            return `
        <div class="card ${interaction.completed ? 'completed-card' : ''}" id="card-${interaction.id}" data-id="${interaction.id}">
          <button class="done-button" onclick="toggleComplete(${interaction.id})"><i class="fas fa-check-circle"></i></button>
          ${content}
          <div class="flex justify-end mt-4">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2" onclick="copyToClipboard(${interaction.id})">Copy</button>
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mx-2" onclick="prefillForm(${interaction.id})">Update</button>
            <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2" onclick="deleteInteraction(${interaction.id})">Delete</button>
          </div>
        </div>`;
        }).join('');

    cardList.innerHTML = interactionList;
}

function copyInteraction(id) {
    const storedData = JSON.parse(localStorage.getItem('interactions')) || [];
    const allInteractions = storedData.flatMap(item => item.interactions);
    const i = allInteractions.find(i => i.id === id);
    if (!i) return '';

    const text = [
        i.cn && `Calling Number: ${i.cn}`,
        i.in && `Incident Number: ${i.in}`,
        i.name && `Name: ${i.name}`,
        i.reason && `Reason for Calling: ${i.reason}`,
        i.findings && `Findings: ${i.findings}`,
        i.resolution && `Resolution: ${i.resolution}`
    ].filter(Boolean).join('\n');

    return text;
}

function copyToClipboard(id) {
    const text = copyInteraction(id);
    navigator.clipboard.writeText(text).then(
        () => alert('Copied to clipboard'),
        () => alert('Copy failed')
    );
}

function exportDataOption(option) {
    const storedData = JSON.parse(localStorage.getItem('interactions')) || [];
    const currentDate = getCurrentDate();

    if (option === 'today') {
        const entry = storedData.find(item => item.date === currentDate);
        if (!entry) return;
        const content = entry.interactions.map(i => copyInteraction(i.id)).join("\n\n--------------------------------------------------------\n\n");
        downloadFile(content, `interactions_${currentDate}.txt`);
    } else if (option === 'allText') {
        const allContent = storedData.map(entry => {
            const dateHeader = `Date: ${entry.date}`;
            const body = entry.interactions.map(i => copyInteraction(i.id)).join("\n\n--------------------------------------------------------\n\n");
            return `${dateHeader}\n\n${body}`;
        }).join("\n\n============================================================\n\n");
        downloadFile(allContent, `interactions_all.txt`);
    } else if (option === 'allJSON') {
        const jsonData = JSON.stringify({ data: storedData }, null, 2);
        downloadFile(jsonData, `interactions_all.json`, "application/json");
    }
}

function downloadFile(content, filename, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function createExportPopup() {
    const popup = document.createElement("div");
    popup.className = "absolute left-20 bottom-10 bg-white border rounded shadow-lg z-50 w-48 text-sm";

    const options = [
        { label: "Today (Text)", value: "today" },
        { label: "All (Text)", value: "allText" },
        { label: "All Data (JSON)", value: "allJSON" }
    ];

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt.label;
        btn.className = "w-full text-left px-4 py-2 hover:bg-gray-100";
        btn.onclick = () => {
            exportDataOption(opt.value);
            document.body.removeChild(popup);
        };
        popup.appendChild(btn);
    });

    document.body.appendChild(popup);
    document.addEventListener("click", (e) => {
        if (!popup.contains(e.target)) {
            popup.remove();
        }
    }, { once: true });
}

document.getElementById("export-all")?.addEventListener("click", (e) => {
    e.stopPropagation();
    createExportPopup();
});

document.addEventListener('DOMContentLoaded', () => {
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);

    const storedData = JSON.parse(localStorage.getItem('interactions')) || [];
    const today = getCurrentDate();
    populateSidebar(storedData, today);
    displayInteractions();
});

function toggleComplete(id) {
    const storedData = JSON.parse(localStorage.getItem('interactions')) || [];
    const currentDate = getCurrentDate();
    const entry = storedData.find(item => item.date === currentDate);
    if (entry) {
        const interaction = entry.interactions.find(i => i.id === id);
        if (interaction) interaction.completed = !interaction.completed;
        localStorage.setItem('interactions', JSON.stringify(storedData));
        displayInteractions();
    }
}

function prefillForm(id) {
    const storedData = JSON.parse(localStorage.getItem('interactions')) || [];
    const currentDate = getCurrentDate();
    const entry = storedData.find(item => item.date === currentDate);
    const interaction = entry?.interactions.find(i => i.id === id);
    if (!interaction) return;

    form['calling-number'].value = interaction.cn;
    form['incident-number'].value = interaction.in;
    form['name'].value = interaction.name;
    form['reason-for-calling'].value = interaction.reason;
    form['findings'].value = interaction.findings;
    form['resolution'].value = interaction.resolution;

    form.onsubmit = function (e) {
        e.preventDefault();
        interaction.cn = form['calling-number'].value;
        interaction.in = form['incident-number'].value;
        interaction.name = form['name'].value;
        interaction.reason = form['reason-for-calling'].value;
        interaction.findings = form['findings'].value;
        interaction.resolution = form['resolution'].value;

        localStorage.setItem('interactions', JSON.stringify(storedData));
        form.reset();
        form.onsubmit = handleFormSubmit;
        displayInteractions();
    };
}

function deleteInteraction(id) {
    const storedData = JSON.parse(localStorage.getItem('interactions')) || [];
    const currentDate = getCurrentDate();
    const entry = storedData.find(item => item.date === currentDate);
    if (entry) {
        entry.interactions = entry.interactions.filter(i => i.id !== id);
        localStorage.setItem('interactions', JSON.stringify(storedData));
        displayInteractions();
    }
}

function checkScreenWidth() {
    if (window.innerWidth < 800) {
        sidebar.style.display = "none";
    } else {
        sidebar.style.display = "flex";
    }
}

function populateSidebar(data, highlightDate = null) {
    const sidebarContent = document.getElementById("sidebar-content");
    sidebarContent.innerHTML = "";

    data.forEach((item) => {
        const button = document.createElement("button");
        button.className =
            "w-full flex justify-between items-center px-4 py-2 rounded transition-colors duration-150";

        const dateSpan = document.createElement("span");
        dateSpan.textContent = item.date;

        const countBadge = document.createElement("span");
        countBadge.textContent = item.interactions.length;
        countBadge.className =
            "bg-red-500 text-white text-xs font-semibold ml-2 px-2 py-0.5 rounded-full";

        button.appendChild(dateSpan);
        button.appendChild(countBadge);
        button.dataset.date = item.date;

        button.addEventListener("mouseenter", function () {
            if (activeSidebarButton !== this) {
                this.classList.add("bg-gray-200");
            }
        });

        button.addEventListener("mouseleave", function () {
            if (activeSidebarButton !== this) {
                this.classList.remove("bg-gray-200");
            }
        });

        button.onclick = function () {
            if (activeSidebarButton && activeSidebarButton !== this) {
                activeSidebarButton.classList.remove("bg-red-400", "text-white", "font-semibold");
            }

            if (activeSidebarButton !== this) {
                this.classList.remove("bg-gray-200");
                this.classList.add("bg-red-400", "text-white", "font-semibold");
                activeSidebarButton = this;
                displayInteractions(item.date);
            }
        };

        if (highlightDate && item.date === highlightDate) {
            setTimeout(() => button.click(), 0);
        }

        sidebarContent.appendChild(button);
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (window.innerWidth < 800) {
        sidebar.style.display = sidebar.style.display === "none" ? "flex" : "none";
    } else {
        sidebar.classList.toggle("w-0");
        sidebar.classList.toggle("overflow-hidden");
        sidebar.classList.toggle("w-64");
    }
}
