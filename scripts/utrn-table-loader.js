// Suggested filename: /smartui/scripts/utrn-table-loader.js
// Final version including Date Filters, Reverse Button, Popup Handling, and all fixes/cleanups.

// --- Helper function for offset date calculation and formatting (DATE ONLY) ---
console.log("✅ Active version: utrn-table-loader.js (Final Cleanup)"); // Log version

function calculateAndFormatDate(offset) {
    if (typeof offset !== 'number') { return ""; }
    try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
        const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
        const year = targetDate.getFullYear();
        return `${dd}.${mm}.${year}`;
    } catch (dateError) { console.error("Error calculating date from offset:", offset, dateError); return "Calc Error"; }
}

// *** Helper function needed for Custom Date Range parsing ***
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
function formatDateToDDMMYYYY(dateObj) {
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
        return ""; // Return empty if not a valid Date object
    }
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = dateObj.getFullYear(); // Define 'year' variable
    // *** CORRECTED return statement ***
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
        // Using function expressions for listeners attached in loop
        row.addEventListener("click", function() { // Use 'function' or keep arrow if 'this' isn't needed
            document.querySelectorAll('.utrn-row.selected').forEach(r => r.classList.remove('selected'));
            this.classList.add('selected'); // 'this' refers to the row div
        });
        row.addEventListener("contextmenu", (e) => { // Arrow function OK here
            e.preventDefault();
            const menu = document.getElementById("context-menu");
            if (menu) {
                menu.style.top = `${e.clientY}px`; menu.style.left = `${e.clientX}px`; menu.style.display = "block";
                menu.dataset.utrn = entry.utrn; // 'entry' is available via closure
            }
        });
    });
}

// --- Central function to filter and display UTRNs ---
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
    const dateFilterRadios = document.querySelectorAll('input[name="historicUtrnFilter"]');
    const dateFromInput = document.getElementById('Historic_Date_From');
    const dateToInput = document.getElementById('Historic_Date_To');
    // *** CORRECTED ID for Apply/Execute Filter button based on HTML ***
    const applyFilterBtn = document.getElementById('executeHistoricUtrn'); 

    // Listener to hide context menu
    document.addEventListener("click", (e) => { if (contextMenu && e.button !== 2 && !e.target.closest("#context-menu")) { contextMenu.style.display = "none"; } });
    // Listener to hide popup
    document.addEventListener("click", (e) => { if (popup && popup.style.display === 'block' && !e.target.closest("#find-popup") && !e.target.closest("#context-menu")) { popup.style.display = "none"; } });
    // "Find..." logic
    if (findButton && popup && utrnInput && contextMenu) { findButton.addEventListener("click", () => { const u = contextMenu.dataset.utrn; if (!u) { console.warn("Find clicked, but no UTRN found."); return; } utrnInput.value = u; popup.style.display = "block"; contextMenu.style.display = "none"; }); } else { console.warn("Find elements missing."); }
    // Listeners for popup close buttons
    if (popup) { if (closeBtn1) closeBtn1.addEventListener('click', () => popup.style.display = 'none'); else console.warn("#popup-close-x1 not found."); if (closeBtn2) closeBtn2.addEventListener('click', () => popup.style.display = 'none'); else console.warn("#popup-close-x2 not found."); if (closeBtnTick) closeBtnTick.addEventListener('click', () => popup.style.display = 'none'); else console.warn("#popup-close-tick not found."); } else { console.warn("#find-popup not found."); }
    // Event Listener for the Reverse Button
    if (reverseBtn) { reverseBtn.addEventListener('click', (e) => { e.preventDefault(); console.log("Reverse button clicked."); const selRow = document.querySelector('.utrn-row.selected'); if (!selRow) { alert("Please select a UTRN transaction row to reverse."); return; } const utrn = selRow.dataset.utrn, stat = selRow.dataset.status, appDt = selRow.dataset.appliedDateTime, idx = parseInt(selRow.dataset.index, 10); if (isNaN(idx)) { alert("Could not identify selected row."); return; } const noApp = (!appDt || appDt.includes('Invalid') || appDt.includes('Calc') || appDt.trim() === ''); if (stat === 'UTRN Generated' && noApp) { /* if (!confirm(...)) return; */ console.log("Reversing..."); const sStr = localStorage.getItem('smartui_data'); if (sStr) { try { const sData = JSON.parse(sStr); if (sData?.utrnRows?.[idx]) { sData.utrnRows[idx].status = 'Reversed'; sData.utrnRows[idx].appliedOffset = null; sData.utrnRows[idx].appliedTime = null; localStorage.setItem('smartui_data', JSON.stringify(sData)); console.log(`UTRN ${utrn} reversed in localStorage.`); if (typeof filterAndDisplayUtrns === 'function') { filterAndDisplayUtrns(); } else { populateUTRNTable(sData.utrnRows); } alert(`UTRN ${utrn} reversed.`); } else { alert("Error finding data."); } } catch (e) { alert("Error updating status."); } } else { alert("Error: Scenario data missing."); } } else { alert("This transaction cannot be reversed."); } }); } else { console.warn("Reverse button not found."); }

    // --- UTRN Date Filtering Setup ---
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
                const formattedToday = calculateAndFormatDate(0); const formattedThirtyAgo = calculateAndFormatDate(-29);
                if(dateFromInput) dateFromInput.value = formattedThirtyAgo; if(dateToInput) dateToInput.value = formattedToday;
                const utrnTableBody = document.getElementById('utrn-table');
                if (utrnTableBody) { utrnTableBody.innerHTML = "<div class='table-row' style='text-align:center; grid-column: 1 / -1; padding: 10px;'>Enter custom dates and click Apply Filter button.</div>"; }
            } else { // 7 or 30 days selected
                if (dateFromInput) dateFromInput.disabled = true; if (dateToInput) dateToInput.disabled = true;
                filterAndDisplayUtrns(); // Apply filter immediately
            }
        });
    });

    // Add Event Listener for Apply Filter Button (using correct ID)
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const customRadio = document.querySelector('input[name="historicUtrnFilter"][value="custom"]');
            if (customRadio && customRadio.checked) {
                 console.log("Apply Filter button clicked for custom range.");
                 if (typeof filterAndDisplayUtrns === 'function') { filterAndDisplayUtrns(); }
                 else { console.error("Cannot apply custom filter: filterAndDisplayUtrns function not defined."); }
            } else { console.log("Apply filter button clicked, but 'Custom Range' not selected."); }
        });
    } else { console.warn("Apply Filter button (#executeHistoricUtrn) not found."); }


    // Apply initial filter on page load
    setTimeout(() => {
        console.log("Applying initial date filter...");
        if (typeof filterAndDisplayUtrns === 'function') { filterAndDisplayUtrns(); }
        else { console.error("Initial filter cannot apply: filterAndDisplayUtrns function not defined."); }
    }, 500); 
    // --- End UTRN Date Filtering Setup ---

}); // End DOMContentLoaded