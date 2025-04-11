// Final version for: /smartui/scripts/readprepaymentsettings-loader.js
// Populates Debt Settings, Meter Balance, AND Emergency Credit tables. 
// Includes validation fix AND updated grid-template-columns for alignment.

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper function for offset date calculation and formatting ---
    function calculateAndFormatDate(offset) { 
        if (typeof offset !== 'number') { console.warn("Invalid offset value received for date calculation:", offset); return "Invalid Date"; }
        try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
            const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const year = targetDate.getFullYear(); 
            return `<span class="math-inline">\{dd\}\.</span>{mm}.${year}`; 
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
            // *** UPDATED Grid Columns for Debt Settings Table ***
            rowDiv.style.gridTemplateColumns = '140px 170px 170px 150px 230px'; 
            // *** --- ***
            const statusTimestamp = calculateAndFormatDate(row.statusTimestampOffset);
            rowDiv.innerHTML = `<div><span class="math-inline">\{row\.source \|\| ''\}</div\><div\></span>{statusTimestamp}</div><div><span class="math-inline">\{row\.totalDebt \!\=\= undefined ? row\.totalDebt \: ''\}</div\><div\></span>{row.drr !== undefined ? row.drr : ''}</div><div>${row.maxRecoveryRate !== undefined ? row.maxRecoveryRate : ''}</div>`;
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

        // Use the JSON key 'ppsMeterBalanceData'
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
            // *** UPDATED Grid Columns for Meter Balance Table ***
            rowDiv.style.gridTemplateColumns = '140px 170px 120px 200px 210px'; 
            // *** --- ***
            const statusTimestamp = calculateAndFormatDate(row.mbstatusTimestampOffset); // Reuse helper

            rowDiv.innerHTML = `
                <div><span class="math-inline">\{row\.mbsource \|\| ''\}</div\>
<div\></span>{statusTimestamp}</div>
                <div><span class="math-inline">\{row\.mbMeterBalance \!\=\= undefined ? row\.mbMeterBalance \: ''\}</div\>
<div\></span>{row.mbEmergencyCreditAvailable !== undefined ? row.mbEmergencyCreditAvailable : ''}</div>
                <div>${row.mbLowCreditWarningThreshold !== undefined ? row.mbLowCreditWarningThreshold : ''}</div>
            `;
            tableBody.appendChild(rowDiv);
        });
    }

    // --- Function to populate the Emergency Credit Settings table ---
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

        // Use the JSON key ppsEmergencyCreditSettingsData
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
            console.warn(`populateEmergencyCreditTable: Expected 2 rows in 'ppsEmergencyCreditSettingsData', found ${emergencyCreditData.length}. Displaying first two if available.`);
        }

        // Process the two specific rows
        emergencyCreditData.slice(0, 2).forEach((row, index) => { 
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row'; 
            rowDiv.style.display = 'grid';
            // Use grid columns from the latest HTML header provided for THIS table
            rowDiv.style.gridTemplateColumns = '140px 170px 120px 200px 210px'; 

            let source = '', statusTimestamp = '', meterBalance = '', emergencyCreditLimit = '', lowCreditThreshold = '';

            // Handle potentially different keys for row 0/1 
            if (index === 0) { /* ... SAP keys ... */ 
                 source = row.ecssourceSAP; statusTimestamp = calculateAndFormatDate(row.ecsstatusTimestampOffsetSAP);
                 meterBalance = row.ecsMeterBalanceSAP; emergencyCreditLimit = row.ecsEmergencyCreditLimitSAP; 
                 lowCreditThreshold = row.ecsEmergencyCreditThresholdSAP; 
            } else if (index === 1) { /* ... Meter keys ... */
                 source = row.ecssourceMeter; statusTimestamp = calculateAndFormatDate(row.ecsstatusTimestampOffsetMeter);
                 meterBalance = row.ecsMeterBalanceMeter; emergencyCreditLimit = row.ecsEmergencyCreditLimitMeter; 
                 lowCreditThreshold = row.ecsEmergencyCreditThresholdMeter;
            } else { return; } // Skip extra rows
            
            rowDiv.innerHTML = `
                <div><span class="math-inline">\{source \|\| ''\}</div\>
<div\></span>{statusTimestamp || ''}</div>
                <div><span class="math-inline">\{meterBalance \!\=\= undefined ? meterBalance \: ''\}</div\>
<div\></span>{emergencyCreditLimit !== undefined ? emergencyCreditLimit : ''}</div> 
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
                // populateTable4(); // Add call for final