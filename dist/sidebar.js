import { displayInteractions } from './ui.js';

let activeSidebarButton = null;

export function renderSidebar(data, highlightDate = null) {
    const sidebarContent = document.getElementById("sidebar-content");
    sidebarContent.innerHTML = "";

    data.forEach(item => {
        const button = document.createElement("button");
        button.className = "w-full flex justify-between items-center px-4 py-2 rounded transition-colors duration-150 hover:bg-yellow-100 cursor-pointer";



        const dateSpan = document.createElement("span");
        dateSpan.textContent = item.date;

        const countBadge = document.createElement("span");
        countBadge.textContent = item.interactions.length;
        countBadge.className = "bg-red-500 text-white text-xs font-semibold ml-2 px-2 py-0.5 rounded-full";

        button.appendChild(dateSpan);
        button.appendChild(countBadge);
        button.dataset.date = item.date;


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

export function checkScreenWidth() {
    const sidebar = document.getElementById("sidebar");
    if (window.innerWidth < 800) {
        sidebar.style.display = "none";
    } else {
        sidebar.style.display = "flex";
    }
}

export function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (window.innerWidth < 800) {
        sidebar.style.display = sidebar.style.display === "none" ? "flex" : "none";
    } else {
        sidebar.classList.toggle("w-0");
        sidebar.classList.toggle("overflow-hidden");
        sidebar.classList.toggle("w-64");
    }
}
