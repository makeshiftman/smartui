// Final version for: /smartui/scripts/readprepaymentsettings-loader.js
// Populates All 4 Tables (Debt, Meter Balance, Emergency Credit, NDCID).
// Includes validation fix, alignment fixes, number formatting, and random time for NDCID timestamp.
console.log("✅ Active version: readprepaymentsettings-loader.js (Updated 18 April 00:32)");

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper function for offset date calculation and formatting (DATE ONLY) ---
    function calculateAndFormatDate(offset) {
        if (typeof offset !== 'number') { console.warn("Invalid offset value received for date calculation:", offset); return "Invalid Date"; }
        try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
            const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const year = targetDate.getFullYear();
            return `${dd}.${mm}.${year}`;
        } catch (dateError) { console.error("Error calculating date from offset:", offset, dateError); return "Calc Error"; }
    }

    // --- *** NEW Helper function for Date and RANDOM Time formatting *** ---
    function calculateAndFormatDateTime(offset) {
        // Date Calculation Part
        let datePart = "Invalid Date";
        if (typeof offset !== 'number') {
            console.warn("Invalid offset value received for date calculation:", offset);
        } else {
            try {
                const today = new Date();
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() + offset);
                const dd = String(targetDate.getDate()).padStart(2, '0');
                const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
                const year = targetDate.getFullYear();
                datePart = `${dd}.${mm}.${year}`;
            } catch (dateError) {
                console.error("Error calculating date from offset:", offset, dateError);
                datePart = "Calc Error";
            }
        }

        // Random Time Generation Part
        const randomHour = Math.floor(Math.random() * 24); // 0-23
        const randomMinute = Math.floor(Math.random() * 60); // 0-59
        const randomSecond = Math.floor(Math.random() * 60); // 0-59

        const hh = String(randomHour).padStart(2, '0');
        const mi = String(randomMinute).padStart(2, '0');
        const ss = String(randomSecond).padStart(2, '0');
        const timePart = `${hh}:${mi}:${ss}`;

        // Combine date and time
        // If date failed, still show the random time maybe? Or return just the error?
        // Returning combined for now.
        return `${datePart} ${timePart}`;
    }


    // --- Helper function to format numbers to fixed decimal places ---
    function formatDecimal(value, places = 2) {
        if (value === null || value === undefined || value === '') { return ''; }
        const num = Number(value);
        if (isNaN(num)) { return ''; }
        return num.toFixed(places);
    }

    // --- Helper function to display messages in a table body ---
    function displayTableMessage(tableBodyId, message) {
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) { console.error(`Cannot display message: Element #${tableBodyId} not found.`); return; }
        tableBody.innerHTML = "";
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
            rowDiv.style.gridTemplateColumns = '140px 170px 180px 150px 230px';
            const statusTimestamp = calculateAndFormatDateTime(row.statusTimestampOffset); // Use DateTime helper
            rowDiv.innerHTML = `
                <div>${row.source || ''}</div>
                <div>${statusTimestamp}</div>
                <div>${formatDecimal(row.totalDebt)}</div>
                <div>${formatDecimal(row.drr)}</div>
                <div>${formatDecimal(row.maxRecoveryRate)}</div>
            `;
            tableBody.appendChild(rowDiv);
        });
    }

    // --- Function to populate the PPS Meter Balance table ---
    function populateMeterBalanceTable() {
        const tableBodyId = 'PPSmeterbalance-table';
        const tableBody = document.getElementById(tableBodyId);
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!tableBody) { console.error("populateMeterBalanceTable Error: Element #" + tableBodyId + " not found."); return; }
        tableBody.innerHTML = '';

        if (!scenarioDataString) { console.warn("populateMeterBalanceTable: No 'smartui_data'."); displayTableMessage(tableBodyId, "No scenario data loaded."); return; }
        let scenarioData;
        try { scenarioData = JSON.parse(scenarioDataString); } catch (e) { console.error("populateMeterBalanceTable: Failed to parse 'smartui_data'.", e); displayTableMessage(tableBodyId, "Error reading scenario data."); return; }

        const meterBalanceData = scenarioData.ppsMeterBalanceData;
        if (!Array.isArray(meterBalanceData)) { console.warn("populateMeterBalanceTable: 'ppsMeterBalanceData' not found or not array."); displayTableMessage(tableBodyId, "No meter balance data available."); return; }
        if (meterBalanceData.length === 0) { displayTableMessage(tableBodyId, "No meter balance records found."); return; }

        meterBalanceData.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.style.display = 'grid';
            rowDiv.style.gridTemplateColumns = '140px 170px 200px 210px';
            const statusTimestamp = calculateAndFormatDateTime(row.mbstatusTimestampOffset); // Use DateTime helper
            rowDiv.innerHTML = `
                <div>${row.mbsource || ''}</div>
                <div>${statusTimestamp}</div>
                <div>${formatDecimal(row.mbMeterBalance)}</div>
                <div>${formatDecimal(row.mbEmergencyCreditAvailable)}</div>
                <div>${formatDecimal(row.mbLowCreditWarningThreshold)}</div>
            `;
            tableBody.appendChild(rowDiv);
        });
    }

    // --- Function to populate the Emergency Credit Settings table ---
    function populateEmergencyCreditTable() {
        const tableBodyId = 'PPEmergencyCreditSettings-table';
        const tableBody = document.getElementById(tableBodyId);
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!tableBody) { console.error("populateEmergencyCreditTable Error: Element #" + tableBodyId + " not found."); return; }
        tableBody.innerHTML = '';

        if (!scenarioDataString) { console.warn("populateEmergencyCreditTable: No 'smartui_data'."); displayTableMessage(tableBodyId, "No scenario data loaded."); return; }
        let scenarioData;
        try { scenarioData = JSON.parse(scenarioDataString); } catch (e) { console.error("populateEmergencyCreditTable: Failed to parse 'smartui_data'.", e); displayTableMessage(tableBodyId, "Error reading scenario data."); return; }

        const emergencyCreditData = scenarioData.ppsEmergencyCreditSettingsData;
        if (!Array.isArray(emergencyCreditData)) { console.warn("populateEmergencyCreditTable: 'ppsEmergencyCreditSettingsData' not found or not array."); displayTableMessage(tableBodyId, "No emergency credit data."); return; }
        if (emergencyCreditData.length === 0) { displayTableMessage(tableBodyId, "No emergency credit records found."); return; }
        if (emergencyCreditData.length !== 2) { console.warn(`populateEmergencyCreditTable: Expected 2 rows, found ${emergencyCreditData.length}.`); }

        emergencyCreditData.slice(0, 2).forEach((row, index) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.style.display = 'grid';
            rowDiv.style.gridTemplateColumns = '140px 170px 120px 200px 210px'; // Uses 5 columns based on last HTML
            let source = '', statusTimestamp = '', emergencyCreditLimit = '', lowCreditThreshold = '';

            if (index === 0) { /* SAP */
                 source = row.ecssourceSAP; statusTimestamp = calculateAndFormatDateTime(row.ecsstatusTimestampOffsetSAP); // Use DateTime helper
                 meterBalance = row.ecsMeterBalanceSAP; emergencyCreditLimit = row.ecsEmergencyCreditLimitSAP;
                 lowCreditThreshold = row.ecsEmergencyCreditThresholdSAP;
            } else if (index === 1) { /* Meter */
                 source = row.ecssourceMeter; statusTimestamp = calculateAndFormatDateTime(row.ecsstatusTimestampOffsetMeter); // Use DateTime helper
                 meterBalance = row.ecsMeterBalanceMeter; emergencyCreditLimit = row.ecsEmergencyCreditLimitMeter;
                 lowCreditThreshold = row.ecsEmergencyCreditThresholdMeter;
            } else { return; }

            rowDiv.innerHTML = `
                <div>${source || ''}</div>
                <div>${statusTimestamp || ''}</div>
                <div>${formatDecimal(emergencyCreditLimit)}</div>
                <div>${formatDecimal(lowCreditThreshold)}</div>
            `;
            tableBody.appendChild(rowDiv);
        });
    }

    // --- *** NEW Function to populate the NDCID table (Table 4) *** ---
    function populateNdcidTable() {
        const tableBodyId = 'ppsNdcid-table'; // Use the ID you define for this table body
        const tableBody = document.getElementById(tableBodyId);
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!tableBody) {
            console.error("populateNdcidTable Error: Element #" + tableBodyId + " not found.");
            return;
        }
        tableBody.innerHTML = ''; // Clear previous content

        if (!scenarioDataString) {
            console.warn("populateNdcidTable: No 'smartui_data' found in localStorage.");
            displayTableMessage(tableBodyId, "No scenario data loaded.");
            return;
        }

        let scenarioData;
        try {
            scenarioData = JSON.parse(scenarioDataString);
        } catch (e) {
            console.error("populateNdcidTable: Failed to parse 'smartui_data' from localStorage:", e);
            displayTableMessage(tableBodyId, "Error reading scenario data.");
            return;
        }

        // Use the JSON key ppsNonDisablementCalendarIDData
        const ndcidData = scenarioData.ppsNonDisablementCalendarIDData;

        // Check if the data exists and is an array
        if (!Array.isArray(ndcidData)) {
            console.warn("populateNdcidTable: 'ppsNonDisablementCalendarIDData' array not found or not an array.");
            displayTableMessage(tableBodyId, "No NDCID data available in scenario.");
            return;
        }

         if (ndcidData.length === 0) {
            displayTableMessage(tableBodyId, "No NDCID records found.");
            return;
        }

        if (ndcidData.length !== 2) {
            console.warn(`populateNdcidTable: Expected 2 rows, found ${ndcidData.length}. Displaying first two.`);
        }

        // Process the two specific rows
        ndcidData.slice(0, 2).forEach((row, index) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.style.display = 'grid';
            // Use grid columns from HTML header provided ('140px 170px 200px 200px')
            rowDiv.style.gridTemplateColumns = '140px 170px 200px 200px';

            let source = '', statusTimestamp = '', calendarId = '', description = '';

            if (index === 0) { // SAP Data
                 source = row.ndcidsourceSAP;
                 // *** Use NEW DateTime helper for random time ***
                 statusTimestamp = calculateAndFormatDateTime(row.ndcidstatusTimestampOffsetSAP);
                 calendarId = row.ndcidNonDisablementCalendarIDSAP;
                 description = row.ndcidDescriptionSAP;
            } else if (index === 1) { // Meter Data
                 source = row.ndcidsourceMeter;
                 // *** Use NEW DateTime helper for random time ***
                 statusTimestamp = calculateAndFormatDateTime(row.ndcidstatusTimestampOffsetMeter);
                 calendarId = row.ndcidNonDisablementCalendarIDMeter;
                 description = row.ndcidDescriptionMeter;
            } else { return; }

            // Populate the 4 columns
            rowDiv.innerHTML = `
                <div>${source || ''}</div>
                <div>${statusTimestamp || ''}</div>
                <div>${calendarId || ''}</div>
                <div>${description || ''}</div>
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
                console.log("Conditions met, populating ALL tables...");
                populateDebtSettingsTable();
                populateMeterBalanceTable();
                populateEmergencyCreditTable();
                populateNdcidTable(); // *** ADDED: Call for final table ***
            } else {
                console.log("Conditions not met. Tables not populated.");
                 displayTableMessage('PPSdebtsettings-table', "Select 'Latest' and 'Display Latest Stored Values', then click Execute.");
                 // Clear other tables if validation fails
                 const meterBalanceTableBody = document.getElementById('PPSmeterbalance-table');
                 if (meterBalanceTableBody) meterBalanceTableBody.innerHTML = '';
                 const emergencyCreditTableBody = document.getElementById('PPEmergencyCreditSettings-table');
                 if (emergencyCreditTableBody) emergencyCreditTableBody.innerHTML = '';
                 const ndcidTableBody = document.getElementById('ppsNdcid-table'); // *** ADDED: Clear table 4 ***
                 if (ndcidTableBody) ndcidTableBody.innerHTML = ''; // *** ADDED: Clear table 4 ***
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
    displayTableMessage('PPSmeterbalance-table', "");
    displayTableMessage('PPEmergencyCreditSettings-table', "");
    displayTableMessage('ppsNdcid-table', ""); // *** ADDED: Initial state for table 4 ***


}); // End DOMContentLoaded