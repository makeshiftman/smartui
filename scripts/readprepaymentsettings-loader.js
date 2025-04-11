// Final version for: /smartui/scripts/readprepaymentsettings-loader.js
// Populates Debt Settings, Meter Balance, AND Emergency Credit tables. Includes validation fix.

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper function for offset date calculation and formatting ---
    function calculateAndFormatDate(offset) {
        if (typeof offset !== 'number') { console.warn("Invalid offset value received for date calculation:", offset); return "Invalid Date"; }
        try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
            const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const year = targetDate.getFullYear();
            return `${dd}.${mm}.${year}`;
        } catch (dateError) { console.error("Error calculating date from offset:", offset, dateError); return "Calc Error"; }
    }

    // --- Helper function to display messages in a table body ---
    function displayTableMessage(tableBodyId, message) {
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) { console.error(`Cannot display message: Element #${tableBodyId} not found.`); return; }
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
    function populateDebtSettingsTable() {
        const tableBodyId = 'PPSdebtsettings-table';
        const tableBody = document.getElementById(tableBodyId);
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!tableBody) { console.error("populateDebtSettingsTable Error: Element #" + tableBodyId + " not found."); return; }
        tableBody.innerHTML = '';

        if (!scenarioDataString) { console.warn("populateDebtSettingsTable: No 'smartui_data'."); displayTableMessage(tableBodyId, "No scenario data loaded."); return; }
        let scenarioData;
        try { scenarioData = JSON.parse(scenarioDataString); } catch (e) { console.error("populateDebtSettingsTable: Failed to parse 'smartui_data'.", e); displayTableMessage(tableBodyId, "Error reading scenario data."); return; }

        if (!scenarioData || !Array.isArray(scenarioData.ppsDebtSettings)) {
            console.warn("populateDebtSettingsTable: 'ppsDebtSettings' not found or not array.");
            displayTableMessage(tableBodyId, "No debt settings data available.");
            return;
        }
        const debtSettings = scenarioData.ppsDebtSettings;
        if (debtSettings.length === 0) { displayTableMessage(tableBodyId, "No debt settings records found."); return; }

        debtSettings.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.style.display = 'grid';
            rowDiv.style.gridTemplateColumns = '100px 160px 180px 150px 150px'; // Specific to this table
            const statusTimestamp = calculateAndFormatDate(row.statusTimestampOffset);
            rowDiv.innerHTML = `<div>${row.source || ''}</div><div>${statusTimestamp}</div><div>${row.totalDebt !== undefined ? row.totalDebt : ''}</div><div>${row.drr !== undefined ? row.drr : ''}</div><div>${row.maxRecoveryRate !== undefined ? row.maxRecoveryRate : ''}</div>`;
            tableBody.appendChild(rowDiv);
        });
    }

    // --- Function to populate the PPS Meter Balance table ---
    function populateMeterBalanceTable() {
        const tableBodyId = 'PPSmeterbalance-table'; // Use the ID for the new table body
        const tableBody = document.getElementById(tableBodyId);
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!tableBody) {
            console.error("populateMeterBalanceTable Error: Element #" + tableBodyId + " not found.");
            return;
        }
        tableBody.innerHTML = ''; // Clear previous content

        if (!scenarioDataString) {
            console.warn("populateMeterBalanceTable: No 'smartui_data' found in localStorage.");
            displayTableMessage(tableBodyId, "No scenario data loaded.");
            return;
        }

        let scenarioData;
        try {
            scenarioData = JSON.parse(scenarioDataString);
        } catch (e) {
            console.error("populateMeterBalanceTable: Failed to parse 'smartui_data' from localStorage:", e);
            displayTableMessage(tableBodyId, "Error reading scenario data.");
            return;
        }

        // *** Use the JSON key 'ppsMeterBalanceData' ***
        const meterBalanceData = scenarioData.ppsMeterBalanceData;

        // Check if the data exists and is an array
        if (!Array.isArray(meterBalanceData)) {
            console.warn("populateMeterBalanceTable: 'ppsMeterBalanceData' array not found or not an array in scenario data.");
            displayTableMessage(tableBodyId, "No meter balance data available in scenario.");
            return;
        }

        if (meterBalanceData.length === 0) {
            displayTableMessage(tableBodyId, "No meter balance records found.");
            return;
        }

        // Loop through the data and create table rows
        meterBalanceData.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.style.display = 'grid';
            // Use the grid columns defined in your HTML header for this table
            rowDiv.style.gridTemplateColumns = '100px 160px 180px 150px 150px';

            const statusTimestamp = calculateAndFormatDate(row.mbstatusTimestampOffset); // Reuse helper

            // Construct innerHTML using the 'mb...' keys from your JSON data object
            rowDiv.innerHTML = `
                <div>${row.mbsource || ''}</div>
                <div>${statusTimestamp}</div>
                <div>${row.mbMeterBalance !== undefined ? row.mbMeterBalance : ''}</div>
                <div>${row.mbEmergencyCreditAvailable !== undefined ? row.mbEmergencyCreditAvailable : ''}</div>
                <div>${row.mbLowCreditWarningThreshold !== undefined ? row.mbLowCreditWarningThreshold : ''}</div>
            `;
            tableBody.appendChild(rowDiv);
        });
    }

    // --- *** NEW Function to populate the Emergency Credit Settings table *** ---
    function populateEmergencyCreditTable() {
        const tableBodyId = 'PPEmergencyCreditSettings-table'; // Target the new table body ID
        const tableBody = document.getElementById(tableBodyId);
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!tableBody) {
            console.error("populateEmergencyCreditTable Error: Element #" + tableBodyId + " not found.");
            return;
        }
        tableBody.innerHTML = ''; // Clear previous content

        if (!scenarioDataString) {
            console.warn("populateEmergencyCreditTable: No 'smartui_data' found in localStorage.");
            displayTableMessage(tableBodyId, "No scenario data loaded.");
            return;
        }

        let scenarioData;
        try {
            scenarioData = JSON.parse(scenarioDataString);
        } catch (e) {
            console.error("populateEmergencyCreditTable: Failed to parse 'smartui_data' from localStorage:", e);
            displayTableMessage(tableBodyId, "Error reading scenario data.");
            return;
        }

        // Use the JSON key you provided: ppsEmergencyCreditSettingsData
        const emergencyCreditData = scenarioData.ppsEmergencyCreditSettingsData;

        // Check if the data exists and is an array
        if (!Array.isArray(emergencyCreditData)) {
            console.warn("populateEmergencyCreditTable: 'ppsEmergencyCreditSettingsData' array not found or not an array in scenario data.");
            displayTableMessage(tableBodyId, "No emergency credit data available in scenario.");
            return;
        }

         if (emergencyCreditData.length === 0) {
            displayTableMessage(tableBodyId, "No emergency credit records found.");
            return;
        }

        if (emergencyCreditData.length !== 2) {
            // Warn if structure isn't exactly two rows as expected from JSON
            console.warn(`populateEmergencyCreditTable: Expected 2 rows in 'ppsEmergencyCreditSettingsData', found ${emergencyCreditData.length}. Displaying first two if available.`);
        }

        // Process the two specific rows, handling potentially different key prefixes
        emergencyCreditData.slice(0, 2).forEach((row, index) => { // Process max 2 rows
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.style.display = 'grid';

            // *** Use grid columns from the LATEST HTML header provided ***
            rowDiv.style.gridTemplateColumns = '140px 170px 120px 200px 210px';

            let source = '', statusTimestamp = '', meterBalance = '', emergencyCreditLimit = '', lowCreditThreshold = '';

            // Handle the different keys for row 0 (SAP) and row 1 (Meter)
            // based on your provided JSON structure
            if (index === 0) { // Assuming first object is always SAP
                 source = row.ecssourceSAP;
                 statusTimestamp = calculateAndFormatDate(row.ecsstatusTimestampOffsetSAP);
                 meterBalance = row.ecsMeterBalanceSAP;
                 emergencyCreditLimit = row.ecsEmergencyCreditLimitSAP; // Matches header now
                 lowCreditThreshold = row.ecsEmergencyCreditThresholdSAP;
            } else if (index === 1) { // Assuming second object is always Meter
                 source = row.ecssourceMeter;
                 statusTimestamp = calculateAndFormatDate(row.ecsstatusTimestampOffsetMeter);
                 meterBalance = row.ecsMeterBalanceMeter;
                 emergencyCreditLimit = row.ecsEmergencyCreditLimitMeter; // Matches header now
                 lowCreditThreshold = row.ecsEmergencyCreditThresholdMeter;
            } else {
                 console.warn(`populateEmergencyCreditTable: Row index ${index} unexpected.`);
                 return; // Skip unexpected extra rows
            }

            // Construct innerHTML, handling potentially missing fields gracefully
            rowDiv.innerHTML = `
                <div>${source || ''}</div>
                <div>${statusTimestamp || ''}</div>
                <div>${meterBalance !== undefined ? meterBalance : ''}</div>
                <div>${emergencyCreditLimit !== undefined ? emergencyCreditLimit : ''}</div>
                <div>${lowCreditThreshold !== undefined ? lowCreditThreshold : ''}</div>
            `;
            tableBody.appendChild(rowDiv);
        });
    }
    // --- *** End of NEW function *** ---


    // --- Get References to Control Elements ---
    const executeBtn = document.getElementById('executeReadPPS');
    const latestRadio = document.querySelector('input[name="readMode"][value="latest"]');
    const dropdown = document.getElementById('readPPS_Display_Latest_Stored_Values');
    const dropdownSelectedOption = dropdown ? dropdown.querySelector('.selected-option') : null;

    // --- Event Listener for the Execute Button ---
    if (executeBtn && latestRadio && dropdownSelectedOption) {
        executeBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior

            // Check the conditions
            const isLatestSelected = latestRadio.checked;
            const dropdownText = dropdownSelectedOption.textContent.trim();

            console.log("Execute clicked. Latest selected:", isLatestSelected, "Dropdown text:", dropdownText);

            // Check textContent against the expected string
            if (isLatestSelected && dropdownText === 'Display Latest Stored Values') {
                console.log("Conditions met, populating tables...");
                populateDebtSettingsTable(); // Call for table 1
                populateMeterBalanceTable(); // Call for table 2
                populateEmergencyCreditTable(); // *** ADDED: Call for table 3 ***
                // populateTable4(); // Add call for final table here when ready
            } else {
                console.log("Conditions not met. Tables not populated.");
                 displayTableMessage('PPSdebtsettings-table', "Select 'Latest' and 'Display Latest Stored Values', then click Execute.");
                 // Optionally clear other tables too if validation fails
                 const meterBalanceTableBody = document.getElementById('PPSmeterbalance-table');
                 if (meterBalanceTableBody) meterBalanceTableBody.innerHTML = '';
                 const emergencyCreditTableBody = document.getElementById('PPEmergencyCreditSettings-table'); //*** ADDED: Clear table 3 ***
                 if (emergencyCreditTableBody) emergencyCreditTableBody.innerHTML = ''; //*** ADDED: Clear table 3 ***
                 // Clear Table 4 Body if needed
            }
        });
    } else {
        // Log errors if essential control elements are missing
        if (!executeBtn) console.error("Initialization Error: Execute button (#executeReadPPS) not found.");
        if (!latestRadio) console.error("Initialization Error: Radio button input[name='readMode'][value='latest'] not found.");
        if (!dropdownSelectedOption) console.error("Initialization Error: Dropdown related element (#readPPS_Display_Latest_Stored_Values .selected-option) not found or dropdown container missing.");
    }

    // --- Initial State Setup ---
    // Ensure tables show an initial message or are cleared on page load
    displayTableMessage('PPSdebtsettings-table', "Select options and click Execute.");
    displayTableMessage('PPSmeterbalance-table', ""); // Show empty or specific message for table 2 initially
    displayTableMessage('PPEmergencyCreditSettings-table', ""); // *** ADDED: Initial state for table 3 ***
    // Display initial message for Table 4


}); // End DOMContentLoaded