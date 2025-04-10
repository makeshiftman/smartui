// Final version for: /smartui/scripts/readprepaymentsettings-loader.js
// Only populates Debt Settings table, fixes validation logic.

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper function for offset date calculation and formatting ---
    function calculateAndFormatDate(offset) { 
        if (typeof offset !== 'number') { console.warn("Invalid offset value received for date calculation:", offset); return "Invalid Date"; }
        try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
            const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0'); const yyyy = targetDate.getFullYear();
            // Ensure year is captured correctly if not already defined globally/incorrectly
            const year = targetDate.getFullYear(); 
            return `${dd}.${mm}.${year}`; // Use captured year
        } catch (dateError) { console.error("Error calculating date from offset:", offset, dateError); return "Calc Error"; }
    }

    // --- Helper function to display messages in the debt table body ---
    function displayDebtMessage(message) { 
        const tableBody = document.getElementById('PPSdebtsettings-table'); if (!tableBody) { console.error("Cannot display message: Element #PPSdebtsettings-table not found."); return; }
        tableBody.innerHTML = ""; const div = document.createElement("div"); div.className = "table-row"; div.style.textAlign = "center";
        div.style.gridColumn = "1 / -1"; div.style.padding = "10px"; div.textContent = message; tableBody.appendChild(div);
    }

    // --- Function to populate the PPS Debt Settings table ---
    function populateDebtSettingsTable() { 
        const tableBody = document.getElementById('PPSdebtsettings-table'); const scenarioDataString = localStorage.getItem('smartui_data');
        if (!tableBody) { console.error("Element with ID 'PPSdebtsettings-table' not found."); return; } tableBody.innerHTML = ''; 
        if (!scenarioDataString) { console.warn("No 'smartui_data' found in localStorage."); displayDebtMessage("No scenario data loaded."); return; }
        let scenarioData; try { scenarioData = JSON.parse(scenarioDataString); } catch (e) { console.error("Failed to parse 'smartui_data' from localStorage:", e); displayDebtMessage("Error reading scenario data."); return; }
        // Updated check for ppsDebtSettings existence and type
        if (!scenarioData || !Array.isArray(scenarioData.ppsDebtSettings)) { 
            console.warn("'ppsDebtSettings' array not found or not an array in scenario data."); 
            displayDebtMessage("No debt settings data available in scenario."); // Show message if no data
            return; 
        }
        const debtSettings = scenarioData.ppsDebtSettings; if (debtSettings.length === 0) { displayDebtMessage("No debt settings records found."); return; }
        debtSettings.forEach(row => { const rowDiv = document.createElement('div'); rowDiv.className = 'table-row'; rowDiv.style.display = 'grid'; rowDiv.style.gridTemplateColumns = '100px 160px 180px 150px 150px'; 
            const statusTimestamp = calculateAndFormatDate(row.statusTimestampOffset);
            rowDiv.innerHTML = `<div>${row.source || ''}</div><div>${statusTimestamp}</div><div>${row.totalDebt !== undefined ? row.totalDebt : ''}</div><div>${row.drr !== undefined ? row.drr : ''}</div><div>${row.maxRecoveryRate !== undefined ? row.maxRecoveryRate : ''}</div>`;
            tableBody.appendChild(rowDiv); });
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
            
            // *** FIXED: Read textContent from the displayed option, trim whitespace ***
            const dropdownText = dropdownSelectedOption.textContent.trim(); 

            // *** FIXED: Update console log to show the text being checked ***
            console.log("Execute clicked. Latest selected:", isLatestSelected, "Dropdown text:", dropdownText); 

            // *** FIXED: Check textContent against the expected string ***
            if (isLatestSelected && dropdownText === 'Display Latest Stored Values') { 
                console.log("Conditions met, populating DEBT table...");
                populateDebtSettingsTable(); // Only call the debt settings populate function
            } else {
                console.log("Conditions not met. Debt table not populated.");
                 const tableBody = document.getElementById('PPSdebtsettings-table');
                 if(tableBody) {
                     // Display the specific validation message
                     displayDebtMessage("Select 'Latest' and 'Display Latest Stored Values', then click Execute.");
                 }
            }
        });
    } else {
        // Log errors if essential control elements are missing
        if (!executeBtn) console.error("Initialization Error: Execute button (#executeReadPPS) not found.");
        if (!latestRadio) console.error("Initialization Error: Radio button input[name='readMode'][value='latest'] not found.");
        if (!dropdownSelectedOption) console.error("Initialization Error: Dropdown related element (#readPPS_Display_Latest_Stored_Values .selected-option) not found or dropdown container missing.");
    }

    // --- Initial State Setup ---
    // Ensure the table shows an initial message on page load
    const initialTableBody = document.getElementById('PPSdebtsettings-table');
    if (initialTableBody) {
         displayDebtMessage("Select options and click Execute.");
    } else {
        console.error("Initialization Error: Initial table body (#PPSdebtsettings-table) not found for initial message.");
    }

}); // End DOMContentLoaded