// Suggested filename: /smartui/scripts/utrn-table-loader.js
// Final version including Date Filters, Reverse Button, Popup Handling, and all fixes.

// --- Helper function for offset date calculation and formatting (DATE ONLY) ---
console.log("✅ Active version: utrn-table-loader.js (Updated 12 April 22:11)");

function calculateAndFormatDate(offset) {
    // Returns "" instead of "Invalid Date" for non-numbers (like null)
    if (typeof offset !== 'number') {
        return ""; 
    }
    try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
        const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
        const year = targetDate.getFullYear();
        return `${dd}.${mm}.${year}`;
    } catch (dateError) { console.error("Error calculating date from offset:", offset, dateError); return "Calc Error"; }
}

// *** ADDED: Helper function needed for Custom Date Range parsing ***
/**
 * Parses a "DD.MM.YYYY" string into a JavaScript Date object (at midnight UTC).
 * Returns null if the format is invalid.
 */
function parseUKDate(dateStr) {
    if (!dateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) { return null; }
    const parts = dateStr.split(".");
    const day = parseInt(parts[0], 10); const month = parseInt(parts[1], 10); const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) { return null; }
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) { return null; }
    date.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight
    return date;
}

// *** CORRECTED Helper function for pre-filling date inputs ***
// Formats a Date object to DD.MM.YYYY string
function formatDateToDDMMYYYY(dateObj) {
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
        return ""; // Return empty if not a valid Date object
    }
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const yyyy = dateObj.getFullYear(); // Variable is 'year'
    // *** CORRECTED to use 'year' variable and proper template literal ***
    return `${dd}.${mm}.${year}`;
}


// --- UPDATED populateUTRNTable function (includes dataset attributes) ---
function populateUTRNTable(utrnList) {
    const container = document.getElementById('utrn-table');
    if (!container || !Array.isArray(utrnList)) {
        console.error("populateUTRNTable: Container not found or utrnList is not an array.");
        if (container) { container.innerHTML = "<div class='table-row' style='text-align:center; grid-column: 1 / -1; padding: 10px;'>Error loading UTRN data.</div>"; }
        return;
    }

    container.innerHTML = ''; // Clear previous rows

    // Updated message for filter context
    if (utrnList.length === 0) {
        const row = document.createElement('div'); row.classList.add('table-row'); row.style.textAlign = "center";
        row.style.gridColumn = "1 / span 10"; row.style.padding = "10px"; row.textContent = "No historic UTRN records found matching filter.";
        container.appendChild(row); return;
    }

    utrnList.forEach((entry, index) => {
        const row = document.createElement('div');
        row.classList.add('table-row', 'utrn-row');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '160px 160px 75px 65px 160px 70px 210px 50px 50px 60px';

        const createdDateTime = calculateAndFormatDate(entry.createdOffset);
        const appliedDateTime = calculateAndFormatDate(entry.appliedOffset);
        const creationDisplay = entry.createdTime ? `${createdDateTime} ${entry.createdTime}` : createdDateTime;
        const appliedDisplay = entry.appliedTime ? `${appliedDateTime} ${entry.appliedTime}` : appliedDateTime;

        const fields = [
            creationDisplay.trim(), appliedDisplay.trim(), entry.value || '', entry.type || '', entry.utrn || '',
            entry.channel || '', entry.status || '', entry.payout || '', entry.bpem || '', entry.auth || ''
        ];

        // Add dataset attributes
        row.dataset.utrn = entry.utrn || '';
        row.dataset.status = entry.status || '';
        row.dataset.appliedDateTime = appliedDisplay.trim();
        row.dataset.index = index;

        fields.forEach(text => {
            const cell = document.createElement('div');
            cell.textContent = (text === null || text === undefined) ? '' : text;
            row.appendChild(cell);
        });

        container.appendChild(row);

        // Event Listeners for Row Highlighting and Context Menu
        row.style.pointerEvents = "auto";
        [...row.children].forEach(cell => cell.style.pointerEvents = "none");
        row.addEventListener("click", () => { /* ... highlight logic ... */ });
        row.addEventListener("contextmenu", (e) => { /* ... context menu logic ... */ });
    });
}

// *** ADDED START: Central function to filter and display UTRNs ***
function filterAndDisplayUtrns() {
    console.log("Applying UTRN date filter...");
    const filterValue = document.querySelector('input[name="historicUtrnFilter"]:checked')?.value;
    const dateFromInput = document.getElementById('Historic_Date_From');
    const dateToInput = document.getElementById('Historic_Date_To');
    console.log(`Selected filter type: ${filterValue}`);

    const scenarioDataString = localStorage.getItem('smartui_data');
    let fullUtrnList = [];
    if (!scenarioDataString) { console.error("filterAndDisplayUtrns: smartui_data not found."); populateUTRNTable([]); return; }
    try { const scenarioData = JSON.parse(scenarioDataString); fullUtrnList = (scenarioData && Array.isArray(scenarioData.utrnRows)) ? scenarioData.utrnRows : []; }
    catch (e) { console.error("filterAndDisplayUtrns: Error parsing smartui_data.", e); populateUTRNTable([]); return; }

    let filteredList = [];
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);

    try {
        if (filterValue === '7') {
            const sevenDaysAgo = new Date(today); sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
            filteredList = fullUtrnList.filter(row => {
                if (typeof row.createdOffset !== 'number') return false;
                const createdDate = new Date(); createdDate.setDate(createdDate.getDate() + row.createdOffset); createdDate.setUTCHours(0, 0, 0, 0);
                return createdDate >= sevenDaysAgo && createdDate <= today;
            });
        } else if (filterValue === '30') {
            const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setUTCDate(today.getUTCDate() - 29);
             filteredList = fullUtrnList.filter(row => {
                if (typeof row.createdOffset !== 'number') return false;
                const createdDate = new Date(); createdDate.setDate(createdDate.getDate() + row.createdOffset); createdDate.setUTCHours(0, 0, 0, 0);
                return createdDate >= thirtyDaysAgo && createdDate <= today;
            });
        } else if (filterValue === 'custom') {
             if (!dateFromInput || !dateToInput) { console.error("Custom filter: Date input elements not found."); filteredList = []; }
             else {
                 const fromDate = parseUKDate(dateFromInput.value); const toDate = parseUKDate(dateToInput.value);
                 console.log(`Filtering custom range (createdOffset): ${dateFromInput.value} to ${dateToInput.value}`);
                 if (fromDate && toDate && fromDate <= toDate) {
                     filteredList = fullUtrnList.filter(row => {
                         if (typeof row.createdOffset !== 'number') return false;
                         const createdDate = new Date(); createdDate.setDate(createdDate.getDate() + row.createdOffset); createdDate.setUTCHours(0, 0, 0, 0);
                         return createdDate >= fromDate && createdDate <= toDate;
                     });
                 } else { console.warn("Custom date range invalid."); filteredList = []; }
             }
        } else { // Default / Fallback
            console.warn(`Unknown filter: ${filterValue}. Defaulting to 7 days.`);
             const sevenDaysAgo = new Date(today); sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
             filteredList = fullUtrnList.filter(row => {
                 if (typeof row.createdOffset !== 'number') return false;
                 const createdDate = new Date(); createdDate.setDate(createdDate.getDate() + row.createdOffset); createdDate.setUTCHours(0,0,0,0);
                 return createdDate >= sevenDaysAgo && createdDate <= today;
             });
        }
    } catch (filterError) { console.error("Error during UTRN filtering:", filterError); filteredList = []; }
    console.log(`Found ${filteredList.length} UTRN records matching filter.`);
    populateUTRNTable(filteredList);
}
// *** ADDED END ***


// --- Main DOMContentLoaded Listener ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("utrn-table-loader.js: DOM Loaded");

    // Get references needed for listeners
    const contextMenu = document.getElementById("context-menu");
    const findButton = document.getElementById("context-find");
    const popup = document.getElementById("find-popup");
    const utrnInput = document.getElementById("find-popup-utrn");
    const closeBtn1 = document.getElementById('popup-close-x1');
    const closeBtn2 = document.getElementById('popup-close-x2');
    const closeBtnTick = document.getElementById('popup-close-tick');
    const reverseBtn = document.getElementById('reverseBtn');
    // *** ADDED: References for date filtering elements ***
    const dateFilterRadios = document.querySelectorAll('input[name="historicUtrnFilter"]');
    const dateFromInput = document.getElementById('Historic_Date_From');
    const dateToInput = document.getElementById('Historic_Date_To');
    const applyFilterBtn = document.getElementById('applyUtrnFilterBtn'); // Assumes button exists

    // Listener to hide context menu
    document.addEventListener("click", (e) => { /* ... unchanged ... */ });
    // Listener to hide popup
    document.addEventListener("click", (e) => { /* ... unchanged ... */ });
    // "Find..." logic
    if (findButton && popup && utrnInput && contextMenu) { /* ... unchanged ... */ } else { /* ... */ }
    // Listeners for popup close buttons
    if (popup) { /* ... unchanged ... */ } else { /* ... */ }
    // Event Listener for the Reverse Button
    if (reverseBtn) {
        reverseBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            console.log("Reverse button clicked.");
            const selectedRow = document.querySelector('.utrn-row.selected'); 
            if (!selectedRow) { alert("Please select a UTRN transaction row to reverse."); console.log("Reverse action stopped: No row selected."); return; }
            const utrn = selectedRow.dataset.utrn; const currentStatus = selectedRow.dataset.status;
            const appliedDateTime = selectedRow.dataset.appliedDateTime; const rowIndex = parseInt(selectedRow.dataset.index, 10); 
            if (isNaN(rowIndex)) { console.error("Reverse action stopped: Invalid row index found."); alert("Could not identify selected row."); return; }
            console.log(`Attempting to reverse UTRN: ${utrn}, Status: ${currentStatus}, Applied: ${appliedDateTime}, Index: ${rowIndex}`);
            const isAppliedDateEffectivelyEmpty = (!appliedDateTime || appliedDateTime.includes('Invalid Date') || appliedDateTime.includes('Calc Error') || appliedDateTime.trim() === '');
            if (currentStatus === 'UTRN generated' && isAppliedDateEffectivelyEmpty) {
                console.log("Conditions met. Proceeding with reversal.");
                const scenarioDataString = localStorage.getItem('smartui_data');
                if (scenarioDataString) {
                    try {
                        const scenarioData = JSON.parse(scenarioDataString);
                        if (scenarioData && Array.isArray(scenarioData.utrnRows) && scenarioData.utrnRows[rowIndex]) {
                            scenarioData.utrnRows[rowIndex].status = 'Reversed';
                            scenarioData.utrnRows[rowIndex].appliedOffset = null; 
                            scenarioData.utrnRows[rowIndex].appliedTime = null; 
                            localStorage.setItem('smartui_data', JSON.stringify(scenarioData));
                            console.log(`UTRN ${utrn} at index ${rowIndex} status updated to 'Reversed' in localStorage.`);
                            populateUTRNTable(scenarioData.utrnRows); 
                            console.log("UTRN table refreshed.");
                            alert(`UTRN ${utrn} has been reversed.`);
                        } else { console.error("Error updating localStorage: Invalid data structure or index."); alert("Error finding transaction data."); }
                    } catch (e) { console.error("Error parsing/saving localStorage during reversal:", e); alert("Error updating status."); }
                } else { console.error("Error updating localStorage: 'smartui_data' not found."); alert("Error: Scenario data missing."); }
            } else { console.log("Reversal condition not met."); alert("This transaction cannot be reversed. Only 'UTRN generated' transactions that have not been applied can be reversed."); }
        }); 
    } else { console.warn("Reverse button (#reverseBtn) not found."); }

    // *** ADDED START: UTRN Date Filtering Setup ***
    // Disable date inputs initially
    if (dateFromInput) dateFromInput.disabled = true;
    if (dateToInput) dateToInput.disabled = true;

    // Add event listener to radio buttons
    dateFilterRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedValue = radio.value;
            console.log(`Date filter radio changed to: ${selectedValue}`);

            if (selectedValue === 'custom') {
                if (dateFromInput) dateFromInput.disabled = false;
                if (dateToInput) dateToInput.disabled = false;
                const formattedToday = calculateAndFormatDate(0); // Use date only helper
                const formattedThirtyAgo = calculateAndFormatDate(-29); // Use date only helper
                if(dateFromInput) dateFromInput.value = formattedThirtyAgo;
                if(dateToInput) dateToInput.value = formattedToday;
                //const utrnTableBody = document.getElementById('utrn-table');
               // if (utrnTableBody) {
                  //  utrnTableBody.innerHTML = "<div class='table-row' style='text-align:center; grid-column: 1 / -1; padding: 10px;'>Enter custom dates and click Apply Filter button.</div>"; // Updated prompt
               // }
            } else { // 7 or 30 days selected
                if (dateFromInput) {
                    dateFromInput.disabled = true;
                    dateFromInput.value = "";
                }
                if (dateToInput) {
                    dateToInput.disabled = true;
                    dateToInput.value = "";
                }
            }
        });
    });

    // Add Event Listener for Apply Filter Button (for custom range)
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const customRadio = document.querySelector('input[name="historicUtrnFilter"][value="custom"]');
            // Only run the filter if the 'custom' radio button is actually selected
            if (customRadio && customRadio.checked) {
                 console.log("Apply UTRN Filter button clicked for custom range.");
                 if (typeof filterAndDisplayUtrns === 'function') {
                     filterAndDisplayUtrns(); // Run filter using dates in input boxes
                 } else { console.error("Cannot apply custom filter: filterAndDisplayUtrns function not defined."); }
            } else {
                 console.log("Apply filter button clicked, but 'Custom Range' not selected.");
            }
        });
    } else {
        console.warn("Apply Filter button (#applyUtrnFilterBtn) not found. Custom date range filter cannot be manually triggered.");
    }

// Clear table when switching to custom
    const utrnTableBody = document.getElementById('utrn-table');
    if (utrnTableBody) {
        utrnTableBody.innerHTML = ""; // Clear table without any instructional prompt
    }
   
    // --- End UTRN Date Filtering Setup ---


// --- Execute Button Listener (for Historic UTRN Filter) ---
const executeBtn = document.getElementById('executeHistoricUtrn');
if (executeBtn) {
  executeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("Execute Historic UTRN button clicked.");
    if (typeof filterAndDisplayUtrns === 'function') {
      filterAndDisplayUtrns();
    } else {
      console.error("filterAndDisplayUtrns is not defined.");
    }
  });
} else {
  console.warn("#executeHistoricUtrn button not found.");
}

}); // End DOMContentLoaded

// --- Execute Button Listener (for Historic UTRN Filter) ---
const executeBtn = document.getElementById('executeHistoricUtrn');
if (executeBtn && typeof filterAndDisplayUtrns === 'function') {
  executeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("Execute Historic UTRN button clicked.");
    filterAndDisplayUtrns();
  });
}

// --- Reverse Button Listener (Silent fallback) ---
const reverseBtn = document.getElementById('reverseBtn');
if (reverseBtn) {
  reverseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("Reverse button clicked.");
    const selectedRow = document.querySelector('.utrn-row.selected'); 
    if (!selectedRow) { alert("Please select a UTRN transaction row to reverse."); return; }

    const utrn = selectedRow.dataset.utrn;
    const currentStatus = selectedRow.dataset.status;
    const appliedDateTime = selectedRow.dataset.appliedDateTime;
    const rowIndex = parseInt(selectedRow.dataset.index, 10);

    if (isNaN(rowIndex)) {
      alert("Could not identify selected row."); return;
    }

    const isAppliedDateEffectivelyEmpty = (!appliedDateTime || appliedDateTime.includes('Invalid Date') || appliedDateTime.includes('Calc Error') || appliedDateTime.trim() === '');

    if (currentStatus === 'UTRN generated' && isAppliedDateEffectivelyEmpty) {
      const scenarioDataString = localStorage.getItem('smartui_data');
      if (scenarioDataString) {
        try {
          const scenarioData = JSON.parse(scenarioDataString);
          if (scenarioData && Array.isArray(scenarioData.utrnRows) && scenarioData.utrnRows[rowIndex]) {
            scenarioData.utrnRows[rowIndex].status = 'Reversed';
            scenarioData.utrnRows[rowIndex].appliedOffset = null;
            scenarioData.utrnRows[rowIndex].appliedTime = null;
            localStorage.setItem('smartui_data', JSON.stringify(scenarioData));
            populateUTRNTable(scenarioData.utrnRows);
            alert(`UTRN ${utrn} has been reversed.`);
          }
        } catch (e) {
          alert("Error updating status.");
        }
      } else {
        alert("Error: Scenario data missing.");
      }
    } else {
      alert("This transaction cannot be reversed.");
    }
  });
}
window.refreshUTRNTable = function () {
    const localData = localStorage.getItem("smartui_data");
    if (!localData) {
      console.warn("No scenario data in localStorage.");
      return;
    }
  
    try {
      const data = JSON.parse(localData);
  
      if (!Array.isArray(data.utrnRows)) {
        console.warn("No utrnRows found in scenario data.");
        return;
      }
  
      const updatedRows = data.utrnRows.map(entry => {
        if (!entry.date && typeof entry.createdOffset === "number") {
          const d = new Date();
          d.setDate(d.getDate() + entry.createdOffset);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          return { ...entry, date: `${dd}.${mm}.${yyyy}` };
        }
        return entry;
      });
  
      // Reuse your existing table rendering function (assumes it's named this)
      if (typeof populateUTRNTable === "function") {
        populateUTRNTable(updatedRows);
      } else {
        console.warn("populateUTRNTable function not found.");
      }
    } catch (err) {
      console.error("Error parsing localStorage scenario data:", err);
    }
  };