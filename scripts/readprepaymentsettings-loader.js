// Final version for: /smartui/scripts/readprepaymentsettings-loader.js
// Populates Debt Settings, Meter Balance, AND Emergency Credit tables.
// Includes validation fix AND corrected grid-template-columns for alignment and fixed template literals.

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper function for offset date calculation and formatting ---
    function calculateAndFormatDate(offset) {
        if (typeof offset !== 'number') { console.warn("Invalid offset value received for date calculation:", offset); return "Invalid Date"; }
        try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
            const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const year = targetDate.getFullYear();
            // *** Corrected template literal ***
            return `${dd}.${mm}.${year}`;
        } catch (dateError) { console.error("Error calculating date from offset:", offset, dateError); return "Calc Error"; }
    }

    // --- Helper function to display messages in a table body ---
    function displayTableMessage(tableBodyId, message) {
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) { console.error(`Cannot display message: Element #${tableBodyId} not found.`); return; }
        tableBody.innerHTML = ""; // Clear previous content
        const div = document.createElement("div");
        div.className = "table-row"; // Assuming consistent row class
        div.style.textAlign = "center";
        div.style.gridColumn = "1 / -1"; // Span all columns
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
            // *** Ensure Grid Columns for Debt Settings Table match user request ***
            rowDiv.style.gridTemplateColumns = '140px 170px 170px 150px 230px';
            // *** --- ***
            const statusTimestamp = calculateAndFormatDate(row.statusTimestampOffset);
            // *** Corrected template literal formatting ***
            rowDiv.innerHTML = `<div>${row.source || ''}</div><div>${statusTimestamp}</div><div>${row.totalDebt !== undefined ? row.totalDebt : ''}</div><div>${row.drr !== undefined ? row.drr : ''}</div><div>${row.maxRecoveryRate !== undefined ? row.maxRecoveryRate : ''}</div>`;
            tableBody.appendChild(rowDiv);
        });
    }

    // --- Function to populate the PPS Meter Balance table ---
    function populateMeterBalanceTable() {
        const tableBodyId = 'PPSmeterbalance-table';
        const tableBody = document.getElementById(tableBodyId);
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!tableBody) {
            console.error("populateMeterBalanceTable Error: Element #" + tableBodyId + " not found.");
            return;
        }
        tableBody.innerHTML = '';

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

        const meterBalanceData = scenarioData.ppsMeterBalanceData;

        if (!Array.isArray(meterBalanceData)) {
            console.warn("populateMeterBalanceTable: 'ppsMeterBalanceData' array not found or not an array in scenario data.");
            displayTableMessage(tableBodyId, "No meter balance data available in scenario.");
            return;
        }

        if (meterBalanceData.length === 0) {
            displayTableMessage(tableBodyId, "No meter balance records found.");
            return;
        }

        meterBalanceData.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.style.display = 'grid';
            // *** Ensure Grid Columns for Meter Balance Table match user request ***
            rowDiv.style.gridTemplateColumns = '140px 170px 120px 200px 210px';
            // *** --- ***
            const statusTimestamp = calculateAndFormatDate(row.mbstatusTimestampOffset);
            // *** Corrected template literal formatting ***
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

    // --- Function to populate the Emergency Credit Settings table ---
    function populateEmergencyCreditTable() {
        const tableBodyId = 'PPEmergencyCreditSettings-table';
        const tableBody = document.getElementById(tableBodyId);
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!tableBody) {
            console.error("populateEmergencyCreditTable Error: Element #" + tableBodyId + " not found.");
            return;
        }
        tableBody.innerHTML = '';

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

        const emergencyCreditData = scenarioData.ppsEmergencyCreditSettingsData;

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
            console.warn(`populateEmergencyCreditTable: Expected 2 rows in 'ppsEmergencyCreditSettingsData', found ${emergencyCreditData.length}. Displaying first two if available.`);
        }

        emergencyCreditData.slice(0, 2).forEach((row, index) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.style.display = 'grid';
            // Use grid columns from the HTML header provided for THIS table
            rowDiv.style.gridTemplateColumns = '140px 170px 120px 200px 210px';

            let source = '', statusTimestamp = '', meterBalance = '', emergencyCreditLimit = '', lowCreditThreshold = '';

            if (index === 0) {
                 source = row.ecssourceSAP; statusTimestamp = calculateAndFormatDate(row.ecsstatusTimestampOffsetSAP);
                 meterBalance = row.ecsMeterBalanceSAP; emergencyCreditLimit = row.ecsEmergencyCreditLimitSAP;
                 lowCreditThreshold = row.ecsEmergencyCreditThresholdSAP;
            } else if (index === 1) {
                 source = row.ecssourceMeter; statusTimestamp = calculateAndFormatDate(row.ecsstatusTimestampOffsetMeter);
                 meterBalance = row.ecsMeterBalanceMeter; emergencyCreditLimit = row.ecsEmergencyCreditLimitMeter;
                 lowCreditThreshold = row.ecsEmergencyCreditThresholdMeter;
            } else { return; }

            // *** Corrected template literal formatting ***
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


    // --- Get References to Control Elements ---
    const executeBtn = document.getElementById('executeReadPPS');
    const latestRadio = document.querySelector('input[name="readMode"][value="latest"]');
    const dropdown = document.getElementById('readPPS_Display_Latest_Stored_Values');
    const dropdownSelectedOption = dropdown ? dropdown.querySelector('.selected-option') : null;

    // --- Event Listener for the Execute Button ---
    if (executeBtn && latestRadio && dropdownSelectedOption) {
        executeBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const isLatestSelected = latestRadio.checked;
            const dropdownText = dropdownSelectedOption.textContent.trim();

            console.log("Execute clicked. Latest selected:", isLatestSelected, "Dropdown text:", dropdownText);

            if (isLatestSelected && dropdownText === 'Display Latest Stored Values') {
                console.log("Conditions met, populating tables...");
                populateDebtSettingsTable();
                populateMeterBalanceTable();
                populateEmergencyCreditTable();
                // populateTable4(); // Add call for final table here when ready
            } else {
                console.log("Conditions not met. Tables not populated.");
                 displayTableMessage('PPSdebtsettings-table', "Select 'Latest' and 'Display Latest Stored Values', then click Execute.");
                 // Clear other tables if validation fails
                 const meterBalanceTableBody = document.getElementById('PPSmeterbalance-table');
                 if (meterBalanceTableBody) meterBalanceTableBody.innerHTML = '';
                 const emergencyCreditTableBody = document.getElementById('PPEmergencyCreditSettings-table');
                 if (emergencyCreditTableBody) emergencyCreditTableBody.innerHTML = '';
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
    displayTableMessage('PPEmergencyCreditSettings-table', ""); // Show empty or specific message for table 3 initially
    // Display initial message for Table 4


}); // End DOMContentLoaded