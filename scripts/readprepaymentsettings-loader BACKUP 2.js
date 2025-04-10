// Suggested filename: /smartui/scripts/readprepaymentsettings-loader.js
// Updated to trigger table population on button click with conditions

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper function for offset date calculation and formatting ---
    function calculateAndFormatDate(offset) {
        if (typeof offset !== 'number') {
            console.warn("Invalid offset value received for date calculation:", offset);
            return "Invalid Date";
        }
        try {
            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + offset);
            const dd = String(targetDate.getDate()).padStart(2, '0');
            const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const𒑌 = targetDate.getFullYear();
            return `${dd}.${mm}.${yyyy}`;
        } catch (dateError) {
            console.error("Error calculating date from offset:", offset, dateError);
            return "Calc Error";
        }
    }

    // --- Helper function to display messages in the debt table body ---
    function displayDebtMessage(message) {
        const tableBody = document.getElementById('PPSdebtsettings-table');
        if (!tableBody) {
            console.error("Cannot display message: Element #PPSdebtsettings-table not found.");
            return;
        }
        tableBody.innerHTML = ""; // Clear previous content
        const div = document.createElement("div");
        div.className = "table-row";
        div.style.textAlign = "center";
        div.style.gridColumn = "1 / -1";
        div.style.padding = "10px";
        div.textContent = message;
        tableBody.appendChild(div);
    }

    // --- Function to populate the PPS Debt Settings table ---
    // (This function now only runs when called by the button listener)
    function populateDebtSettingsTable() {
        const tableBody = document.getElementById('PPSdebtsettings-table');
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!tableBody) {
            console.error("Element with ID 'PPSdebtsettings-table' not found.");
            return; // Should not happen if called correctly, but safety check
        }
        tableBody.innerHTML = ''; // Clear previous content

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

        if (!scenarioData || !Array.isArray(scenarioData.ppsDebtSettings)) {
            console.warn("'ppsDebtSettings' array not found or not an array in scenario data.");
            // Display message only if explicitly triggered, maybe not needed if button requires correct state
            // displayDebtMessage("No debt settings data available in scenario.");
            return; // Silently return if data isn't there when button clicked under right conditions
        }

        const debtSettings = scenarioData.ppsDebtSettings;

        if (debtSettings.length === 0) {
            displayDebtMessage("No debt settings records found.");
            return;
        }

        // Loop through the data and create table rows
        debtSettings.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.style.display = 'grid';
            rowDiv.style.gridTemplateColumns = '100px 160px 180px 150px 150px'; // Adjust if needed

            const statusTimestamp = calculateAndFormatDate(row.statusTimestampOffset);

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

    // --- Get References to Control Elements ---
    const executeBtn = document.getElementById('executeReadPPS'); // Use the new ID
    const latestRadio = document.querySelector('input[name="readMode"][value="latest"]'); // Find radio by name and value
    const dropdown = document.getElementById('readPPS_Display_Latest_Stored_Values');
    const dropdownSelectedOption = dropdown ? dropdown.querySelector('.selected-option') : null; // Get selected option div

    // --- Event Listener for the Execute Button ---
    if (executeBtn && latestRadio && dropdownSelectedOption) {
        executeBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior

            // Check the conditions
            const isLatestSelected = latestRadio.checked;
            // Read the selected value from the dropdown's selected-option dataset (set by dropdown handler)
            const dropdownValue = dropdownSelectedOption.dataset.value;

            console.log("Execute clicked. Latest selected:", isLatestSelected, "Dropdown value:", dropdownValue); // Debug log

            // Check if the required conditions are met
            if (isLatestSelected && dropdownValue === 'DisplayLatestStoredValues') {
                console.log("Conditions met, populating table(s)...");
                populateDebtSettingsTable();
                // Future: Call functions to populate other tables here
                // populateTable2();
                // populateTable3();
                // populateTable4();
            } else {
                console.log("Conditions not met. Table not populated.");
                // Optional: Clear the table or display a message if conditions aren't met
                 const tableBody = document.getElementById('PPSdebtsettings-table');
                 if(tableBody) {
                     displayDebtMessage("Select 'Latest' and 'Display Latest Stored Values', then click Execute.");
                 }
            }
        });
    } else {
        // Log errors if essential control elements are missing
        if (!executeBtn) console.error("Initialization Error: Execute button (#executeReadPPS) not found.");
        if (!latestRadio) console.error("Initialization Error: Radio button input[name='readMode'][value='latest'] not found.");
        if (!dropdownSelectedOption) console.error("Initialization Error: Dropdown related element (#readPPS_Display_Latest_Stored_Values .selected-option) not found.");
    }

    // --- Initial State Setup (Optional) ---
    // You might want to ensure the table is empty or shows an initial message on page load
    const initialTableBody = document.getElementById('PPSdebtsettings-table');
    if (initialTableBody) {
         // Clear it initially or display a prompt
         displayDebtMessage("Select options and click Execute.");
    }


}); // End DOMContentLoaded
