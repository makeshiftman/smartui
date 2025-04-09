// --- Complete Corrected Code for: /smartui/scripts/ondemandreads-loader.js ---

document.addEventListener('DOMContentLoaded', () => {
    // Get references to the key HTML elements
    const dateInput = document.getElementById("MR_On_Demand_Date");
    const executeBtn = document.getElementById("executeOnDemandReads");
    const tableBody = document.getElementById("ondemandreads-table"); // This element MUST exist in the HTML
    const tableWrapper = tableBody ? tableBody.closest('.utrn-frame') : null; // Optional: find parent wrapper

    /**
     * Parses a "DD.MM.YYYY" string into a JavaScript Date object (at midnight UTC).
     * Returns null if the format is invalid or the date doesn't make sense.
     * @param {string} dateStr - The date string in "DD.MM.YYYY" format.
     * @returns {Date | null} - The corresponding Date object or null if invalid.
     */
    function parseUKDate(dateStr) {
        // Check format validity (DD.MM.YYYY)
        if (!dateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
            // console.error("Invalid UK date string format:", dateStr); // Keep console logs minimal unless debugging
            return null;
        }
        const parts = dateStr.split(".");
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10); // Month from string is 1-12
        const year = parseInt(parts[2], 10);

        // Check if parts are valid numbers and within plausible ranges
        if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
            // console.error("Invalid date components after parsing:", dateStr);
            return null;
        }

        // Create Date object using UTC; month is 0-indexed (0=Jan, 11=Dec)
        const date = new Date(Date.UTC(year, month - 1, day));

        // Verify that the created date matches the input components
        // This catches invalid dates like February 30th, which JS might otherwise roll over.
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
            // console.error("Date object mismatch (invalid date like Feb 30?):", dateStr);
            return null; // Return null if the date components don't match (invalid date)
        } // <-- Closing brace for the 'if' statement

        // If all checks pass, return the valid Date object
        return date;
    } // <-- Closing brace for the parseUKDate function

    /**
     * Calculates the sum of registers 1-4 for a given row.
     * Returns the rounded total.
     * @param {object} row - The meter reading data object.
     * @returns {number} - The rounded sum of register values.
     */
    function calculateTotal(row) {
        const r1 = parseFloat(row.register1) || 0;
        const r2 = parseFloat(row.register2) || 0;
        const r3 = parseFloat(row.register3) || 0;
        const r4 = parseFloat(row.register4) || 0;
        const total = r1 + r2 + r3 + r4;
        return Math.round(total);
    }

    /**
     * Displays messages like 'Not found' or 'Enter date' in the table body.
     * @param {string} message - The text message to display.
     */
    function displayMessage(message) {
        if (!tableBody) return; // Safety check
        tableBody.innerHTML = ""; // Clear previous content

        const div = document.createElement("div");
        div.className = "table-row"; // Use a consistent class if needed for styling
        div.style.textAlign = "center";
        div.style.gridColumn = "1 / -1"; // Make message span all grid columns
        div.style.padding = "10px";
        div.textContent = message;
        tableBody.appendChild(div);

         // Ensure table wrapper is visible (optional, if it can be hidden)
         if (tableWrapper) {
             tableWrapper.style.display = "block";
         }
    }

    /**
     * Populates the table body with a single row of meter reading data.
     * @param {object} row - The meter reading data object to display.
     */
    function populateSingleRow(row) {
        if (!tableBody) return; // Safety check
        tableBody.innerHTML = ""; // Clear any previous message/row

        const displayDate = row.date || "Invalid Date";
        const displayTime = "00:00"; // Assuming midnight convention
        const datetime = `${displayDate} ${displayTime}`;
        const total = calculateTotal(row);
        const average = ""; // Average is N/A for a single row

        const div = document.createElement("div");
        div.className = "table-row"; // Use the same class as your previous table rows if styles apply
        div.style.display = "grid"; // Apply grid for alignment with header
        div.style.gridTemplateColumns = "160px 75px 75px 75px 75px 110px 110px"; // Match header columns

        // Corrected innerHTML with all register divs
        div.innerHTML = `
            <div>${datetime}</div>
            <div>${row.register1 || ""}</div>
            <div>${row.register2 || ""}</div>
            <div>${row.register3 || ""}</div>
            <div>${row.register4 || ""}</div>
            <div>${total}</div>
            <div>${average}</div>
        `;
        tableBody.appendChild(div);
    }


    // --- Event Listener Setup ---
    // Ensure essential elements for this page exist before adding listener
    if (executeBtn && dateInput && tableBody) {
        executeBtn.addEventListener("click", e => {
            e.preventDefault(); // Stop default link behavior
            const inputDateString = dateInput.value.trim();
            tableBody.innerHTML = ""; // Clear previous results immediately

            // 1. Validate Input Date String
            if (!inputDateString) {
                alert("Please enter a date in DD.MM.YYYY format.");
                displayMessage("Please enter a date.");
                return;
            }

            // 2. Parse Input Date Object
            const requestedDateObj = parseUKDate(inputDateString);
            if (!requestedDateObj) {
                alert("Invalid date format or value. Please use DD.MM.YYYY.");
                displayMessage("Invalid date entered.");
                return;
            }

            // 3. Retrieve Stored Data
            const scenarioData = localStorage.getItem("smartui_data");
            let allRows = [];

            if (!scenarioData) {
                console.warn("No smartui_data found in localStorage.");
                displayMessage("No stored meter reading data available.");
                return; // Stop if no data item
            }

            try {
                const scenario = JSON.parse(scenarioData);
                if (scenario && Array.isArray(scenario.storedMeterReads)) {
                    allRows = scenario.storedMeterReads;
                } else {
                    console.warn("storedMeterReads not found or not an array in localStorage data.");
                    displayMessage("Stored data is missing meter readings.");
                    return; // Stop if readings array is missing/invalid
                }
            } catch (parseError) {
                console.error("Failed to parse smartui_data from localStorage:", parseError);
                alert("Error reading stored data. Data might be corrupt.");
                displayMessage("Error reading stored data.");
                return; // Stop if data is corrupt
            }

            // 4. Find the Matching Row
            const foundRow = allRows.find(row => {
                const rowDateObj = parseUKDate(row.date);
                // Compare UTC timestamps for accurate date equality check
                // Ensure both dates were parsed successfully before comparing
                return rowDateObj && requestedDateObj && rowDateObj.getTime() === requestedDateObj.getTime();
            });

            // 5. Populate Table (or show 'not found' message)
            if (foundRow) {
                populateSingleRow(foundRow);
            } else {
                displayMessage(`No meter reading found for date: ${inputDateString}`);
            }

            // Ensure table wrapper is visible (optional)
            if (tableWrapper) {
                tableWrapper.style.display = "block";
            }
        });

    } else {
        // Log errors if essential elements for *this page* are missing after DOM load attempt
        if (!dateInput) console.error("Initialization Error: Date input (#MR_On_Demand_Date) not found.");
        if (!executeBtn) console.error("Initialization Error: Execute button (#executeOnDemandReads) not found.");
        if (!tableBody) console.error("Initialization Error: CRITICAL - Table body (#ondemandreads-table) not found in HTML!");
    }

}); // End of DOMContentLoaded
