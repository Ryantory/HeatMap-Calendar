const heatmap = document.getElementById("heatmap");
const rangeTitle = document.getElementById("calendar-range");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const checkboxContainer = document.getElementById("checkbox-container");

// Define time slots (8 AM to 10 PM) with half-hour intervals
const timeSlots = Array.from({ length: 15 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour}:${minute}`;
});

// Generate a week's worth of days
let startDate = new Date();
startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

// Data will be fetched from external JSON
let data = {};
let selectedCompanies = [];

// Fetch data from external JSON file
async function fetchData() {
    try {
        const response = await fetch("schedule (5).json");
        const jsonData = await response.json();
        data = jsonData;

        generateCompanyCheckboxes(Object.keys(data));
        generateHeatMap(startDate);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Generate checkboxes for company selection
function generateCompanyCheckboxes(companyIds) {
    checkboxContainer.innerHTML = ""; // Clear any existing checkboxes

    companyIds.forEach((id) => {
        const label = document.createElement("label");
        label.className = "company-checkbox";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = id;
        checkbox.checked = true; // Default to checked
        checkbox.addEventListener("change", updateSelectedCompanies);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`Company ${id}`));
        checkboxContainer.appendChild(label);

        // Add to selected companies initially
        selectedCompanies.push(id);
    });
}

// Update selected companies based on checkbox state
function updateSelectedCompanies() {
    selectedCompanies = Array.from(
        checkboxContainer.querySelectorAll("input[type='checkbox']:checked")
    ).map((checkbox) => checkbox.value);

    generateHeatMap(startDate);
}

// Generate the heat map
function generateHeatMap(startDate) {
    heatmap.innerHTML = "";

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    rangeTitle.textContent = `${formatDate(startDate)} - ${formatDate(endDate)}`;

    timeSlots.forEach((time) => {
        const timeSlotCell = document.createElement("div");
        timeSlotCell.className = "time-slot";
        timeSlotCell.textContent = time;
        heatmap.appendChild(timeSlotCell);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const [hour, minute] = time.split(":"); // Split into hour and minute
            const paddedHour = hour.padStart(2, "0"); // Pad hour with leading zero if necessary
            time = `${paddedHour}:${minute}`;
            const dateKey = `${formatDateKey(date)}-${time}`;
            console.log(dateKey);
            const cell = document.createElement("div");
            cell.className = "cell";

            // Calculate intensity based on selected companies
            const intensity = selectedCompanies.reduce((sum, companyId) => {
                return sum + (data[companyId]?.[dateKey] === "available" ? 1 : 0);
            }, 0);

            cell.setAttribute("data-value", intensity);
            heatmap.appendChild(cell);
        }
    });
}

// Format date for display
function formatDate(date) {
    return date.toISOString().split("T")[0];
}

// Format date key for data lookup
function formatDateKey(date) {
    return date.toISOString().split("T")[0];
}

// Navigation buttons
prevButton.addEventListener("click", () => {
    startDate.setDate(startDate.getDate() - 7);
    generateHeatMap(startDate);
});

nextButton.addEventListener("click", () => {
    startDate.setDate(startDate.getDate() + 7);
    generateHeatMap(startDate);
});

// Initialize by fetching data
fetchData();
