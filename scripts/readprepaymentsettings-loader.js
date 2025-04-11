// Final version for: /smartui/scripts/readprepaymentsettings-loader.js
// Populates Debt Settings AND Meter Balance tables, includes validation fix.

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
    // Made slightly more generic to reuse
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
            rowDiv.style.gridTemplateColumns = '100px 160px 180px 150px 150px'; // Specific to this table
            const statusTimestamp = calculateAndFormatDate(row.statusTimestampOffset);
            rowDiv.innerHTML = `<div>${row.source || ''}</div><div>${statusTimestamp}</div><div>${row.totalDebt !== undefined ? row.totalDebt : ''}</div><div>${row.drr !== undefined ? row.drr : ''}</div><div>${row.maxRecoveryRate !== undefined ? row.maxRecoveryRate : ''}</div>`;
            tableBody.appendChild(rowDiv); 
        });
    }

    // --- NEW Function to populate the PPS Meter Balance table ---
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

        // *** Use the new JSON key 'ppsMeterBalanceData' ***
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
                populateDebtSettingsTable(); // Call the debt settings populate function
                populateMeterBalanceTable(); // *** ADDED: Call the meter balance populate function ***
                // Add calls for Table 3 and Table 4 here when ready
                // populateTable3(); 
                // populateTable4();
            } else {
                console.log("Conditions not met. Tables not populated.");
                 // Display the validation message in the primary table maybe? Or a dedicated message area?
                 displayTableMessage('PPSdebtsettings-table', "Select 'Latest' and 'Display Latest Stored Values', then click Execute.");
                 // Optionally clear other tables too if validation fails
                 const meterBalanceTableBody = document.getElementById('PPSmeterbalance-table');
                 if (meterBalanceTableBody) meterBalanceTableBody.innerHTML = ''; 
                 // Clear Table 3 Body
                 // Clear Table 4 Body
            }
        });
    } else {
        // Log errors if essential control elements are missing
        if (!executeBtn) console.error("Initialization Error: Execute button (#executeReadPPS) not found.");
        if (!latestRadio) console.error("Initialization Error: Radio button input[name='readMode'][value='latest'] not found.");
        if (!dropdownSelectedOption) console.error("Initialization Error: Dropdown related element (#readPPS_Display_Latest_Stored_Values .selected-option) not found or dropdown container missing.");
    }

    // --- Initial State Setup ---
    // Ensure tables show an initial message on page load
    displayTableMessage('PPSdebtsettings-table', "Select options and click Execute.");
    displayTableMessage('PPSmeterbalance-table', ""); // Show empty or specific message for table 2 initially
    // Display initial message for Table 3
    // Display initial message for Table 4


}); // End DOMContentLoaded