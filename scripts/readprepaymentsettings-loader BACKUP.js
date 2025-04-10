// Suggested filename: /smartui/scripts/readprepaymentsettings-loader.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper function for offset date calculation and formatting ---
    // (Same logic used in smartui-loader.js)
    function calculateAndFormatDate(offset) {
        if (typeof offset !== 'number') {
            console.warn("Invalid offset value received for date calculation:", offset);
            return "Invalid Date"; // Return specific string for invalid offsets
        }
        try {
            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + offset); // Add offset (can be negative)
            const dd = String(targetDate.getDate()).padStart(2, '0');
            const mm = String(targetDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const yyyy = targetDate.getFullYear();
            return `${dd}.${mm}.${yyyy}`; // Format as DD.MM.YYYY
        } catch (dateError) {
            console.error("Error calculating date from offset:", offset, dateError);
            return "Calc Error"; // Return specific string on error
        }
    }

    // --- Function to populate the PPS Debt Settings table ---
    function populateDebtSettingsTable() {
        const tableBody = document.getElementById('PPSdebtsettings-table');
        const scenarioDataString = localStorage.getItem('smartui_data');

        // Check if table body element exists
        if (!tableBody) {
            console.error("Element with ID 'PPSdebtsettings-table' not found.");
            return;
        }

        // Clear previous content
        tableBody.innerHTML = '';

        // Check if data exists in localStorage
        if (!scenarioDataString) {
            console.warn("No 'smartui_data' found in localStorage.");
            displayDebtMessage("No scenario data loaded.");
            return;
        }

        let scenarioData;
        try {
            scenarioData = JSON.parse(scenarioDataString);
        } catch (e) {
            console.error("Failed to parse 'smartui_data' from localStorage:", e);
            displayDebtMessage("Error reading scenario data.");
            return;
        }

        // Check if the ppsDebtSettings array exists and is an array
        if (!scenarioData || !Array.isArray(scenarioData.ppsDebtSettings)) {
            console.warn("'ppsDebtSettings' array not found or not an array in scenario data.");
            displayDebtMessage("No debt settings data available in scenario.");
            return;
        }

        const debtSettings = scenarioData.ppsDebtSettings;

        // Check if the array is empty
        if (debtSettings.length === 0) {
            displayDebtMessage("No debt settings records found.");
            return;
        }

        // Loop through the data and create table rows
        debtSettings.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row'; // Use a common class for styling if needed
            rowDiv.style.display = 'grid';
            // Match grid columns defined in the HTML's table-header for this table
            rowDiv.style.gridTemplateColumns = '100px 160px 180px 150px 150px'; // Adjust if needed

            // Calculate the formatted date for the timestamp
            const statusTimestamp = calculateAndFormatDate(row.statusTimestampOffset);

            // Populate cells, providing default empty strings if data is missing
            rowDiv.innerHTML = `
                <div>${row.source || ''}</div>
                <div>${statusTimestamp}</div>
                <div>${row.totalDebt !== undefined ? row.totalDebt : ''}</div>
                <div>${row.drr !== undefined ? row.drr : ''}</div>
                <div>${row.maxRecoveryRate !== undefined ? row.maxRecoveryRate : ''}</div>
            `;

            tableBody.appendChild(rowDiv);
        });
    }

    // --- Helper function to display messages in the debt table body ---
    function displayDebtMessage(message) {
        const tableBody = document.getElementById('PPSdebtsettings-table');
        if (!tableBody) return; // Safety check

        tableBody.innerHTML = ""; // Clear previous content
        const div = document.createElement("div");
        div.className = "table-row"; // Or another appropriate class
        div.style.textAlign = "center";
        div.style.gridColumn = "1 / -1"; // Span all columns
        div.style.padding = "10px";
        div.textContent = message;
        tableBody.appendChild(div);
    }

    // --- Initial Population ---
    // Call the function to populate the table when the DOM is ready
    populateDebtSettingsTable();

    // --- Optional: Add logic for buttons if needed ---
    // For example, if the "Execute" button on this page should re-populate this table
    // const ppsExecuteButton = document.getElementById('ID_OF_EXECUTE_BUTTON_FOR_PPS');
    // if (ppsExecuteButton) {
    //     ppsExecuteButton.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         console.log("PPS Execute button clicked, re-populating debt table (if needed).");
    //         // Add logic here if clicking Execute should refresh this table based on inputs
    //         populateDebtSettingsTable(); // Or fetch new data based on inputs
    //     });
    // }

}); // End DOMContentLoaded
