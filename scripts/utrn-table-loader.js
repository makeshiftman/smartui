// Suggested filename: /smartui/scripts/utrn-table-loader.js
// Final fixed version that only loads table on Execute button click
console.log("✅ Active version: utrn-table-loader.js (FIXED for Execute only)");

// Helper functions for date handling
function calculateAndFormatDate(offset) {
    if (typeof offset !== 'number') return "";
    try { 
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + offset);
        const dd = String(targetDate.getDate()).padStart(2, '0');
        const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
        const year = targetDate.getFullYear();
        return `${dd}.${mm}.${year}`;
    } catch (dateError) {
        console.error("Error calculating date from offset:", offset, dateError);
        return "Calc Error";
    }
}

function parseUKDate(dateStr) {
    if (!dateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return null;
    const parts = dateStr.split(".");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    date.setUTCHours(0, 0, 0, 0);
    return date;
}

function formatDateToDDMMYYYY(dateObj) {
    if (!(dateObj instanceof Date) || isNaN(dateObj)) return "";
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${dd}.${mm}.${year}`;
}

// Function to populate UTRN table
function populateUTRNTable(utrnList) {
    const container = document.getElementById('utrn-table');
    if (!container || !Array.isArray(utrnList)) {
        console.error("populateUTRNTable: Container not found or utrnList not array.");
        if (container) {
            container.innerHTML = "";
        }
        return;
    }
    
    container.innerHTML = '';
    
    if (utrnList.length === 0) {
        // Leave the table empty - don't show a message
        return;
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
            creationDisplay.trim(),
            appliedDisplay.trim(),
            entry.value || '',
            entry.type || '',
            entry.utrn || '',
            entry.channel || '',
            entry.status || '',
            entry.payout || '',
            entry.bpem || '',
            entry.auth || ''
        ];
        
        // Set data attributes for selection and operations
        row.dataset.utrn = entry.utrn || '';
        row.dataset.status = entry.status || '';
        row.dataset.appliedDateTime = appliedDisplay.trim();
        
        // Create cells and add them to the row
        fields.forEach(text => {
            const cell = document.createElement('div');
            cell.textContent = (text === null || text === undefined) ? '' : text;
            row.appendChild(cell);
        });
        
        container.appendChild(row);
        
        // Add event handling to the row
        row.style.pointerEvents = "auto";
        [...row.children].forEach(cell => cell.style.pointerEvents = "none");
        
        row.addEventListener("click", function() {
            document.querySelectorAll('.utrn-row.selected').forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');
        });
        
        row.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            const menu = document.getElementById("context-menu");
            if (menu) {
                menu.style.top = `${e.clientY}px`;
                menu.style.left = `${e.clientX}px`;
                menu.style.display = "block";
                menu.dataset.utrn = entry.utrn;
            }
        });
    });
}

// Function to filter UTRNs by date range
function filterAndDisplayUtrns() {
    console.log("Applying UTRN date filter...");
    const filterValue = document.querySelector('input[name="historicUtrnFilter"]:checked')?.value;
    const dateFromInput = document.getElementById('Historic_Date_From');
    const dateToInput = document.getElementById('Historic_Date_To');
    
    console.log(`Selected filter type: ${filterValue}`);
    
    const scenarioDataString = localStorage.getItem('smartui_data');
    let fullUtrnList = [];
    
    if (!scenarioDataString) {
        console.error("filterAndDisplayUtrns: smartui_data not found.");
        populateUTRNTable([]);
        return;
    }
    
    try {
        const scenarioData = JSON.parse(scenarioDataString);
        fullUtrnList = (scenarioData && Array.isArray(scenarioData.utrnRows)) ? scenarioData.utrnRows : [];
    }
    catch (e) {
        console.error("filterAndDisplayUtrns: Error parsing smartui_data.", e);
        populateUTRNTable([]);
        return;
    }
    
    let filteredList = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    try {
        if (filterValue === '7') {
            const d = new Date(today);
            d.setUTCDate(today.getUTCDate() - 6);
            filteredList = fullUtrnList.filter(r =>
                typeof r.createdOffset === 'number' &&
                (cd => cd >= d && cd <= today)(new Date(new Date().setDate(new Date().getDate() + r.createdOffset)).setUTCHours(0,0,0,0))
            );
        }
        else if (filterValue === '30') {
            const d = new Date(today);
            d.setUTCDate(today.getUTCDate() - 29);
            filteredList = fullUtrnList.filter(r =>
                typeof r.createdOffset === 'number' &&
                (cd => cd >= d && cd <= today)(new Date(new Date().setDate(new Date().getDate() + r.createdOffset)).setUTCHours(0,0,0,0))
            );
        }
        else if (filterValue === 'custom') {
            if (!dateFromInput || !dateToInput) {
                console.error("Custom filter: Date inputs missing.");
                filteredList = [];
            } else {
                const fd = parseUKDate(dateFromInput.value);
                const td = parseUKDate(dateToInput.value);
                console.log(`Filtering custom: ${dateFromInput.value} to ${dateToInput.value}`);
                if (fd && td && fd <= td) {
                    filteredList = fullUtrnList.filter(r =>
                        typeof r.createdOffset === 'number' &&
                        (cd => cd >= fd && cd <= td)(new Date(new Date().setDate(new Date().getDate() + r.createdOffset)).setUTCHours(0,0,0,0))
                    );
                } else {
                    console.warn("Custom date range invalid.");
                    filteredList = [];
                }
            }
        }
        else {
            console.warn(`Filter fallback: ${filterValue}`);
            const d = new Date(today);
            d.setUTCDate(today.getUTCDate() - 6);
            filteredList = fullUtrnList.filter(r =>
                typeof r.createdOffset === 'number' &&
                (cd => cd >= d && cd <= today)(new Date(new Date().setDate(new Date().getDate() + r.createdOffset)).setUTCHours(0,0,0,0))
            );
        }
    } catch (err) {
        console.error("Filter error:", err);
        filteredList = [];
    }
    
    console.log(`Found ${filteredList.length} UTRN records.`);
    populateUTRNTable(filteredList);
}

// Helper function to clear the UTRN table
function clearUtrnTable() {
    const utrnTableBody = document.getElementById('utrn-table');
    if (utrnTableBody) {
        utrnTableBody.innerHTML = "";
    }
}

// Main initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("utrn-table-loader.js: DOM Loaded");
    console.log("Checking for #executeHistoricUtrn button...");

    // Critical change: Just leave the table empty on page load
    const utrnTable = document.getElementById('utrn-table');
    if (utrnTable) {
        clearUtrnTable();
    }

    // Get references to DOM elements
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
    const applyFilterBtn = document.getElementById('executeHistoricUtrn');

    // Listener to hide context menu
    document.addEventListener("click", (e) => {
        if (contextMenu && e.button !== 2 && !e.target.closest("#context-menu")) {
            contextMenu.style.display = "none";
        }
    });
    
    // Listener to hide popup
    document.addEventListener("click", (e) => {
        if (popup && popup.style.display === 'block' && !e.target.closest("#find-popup") && !e.target.closest("#context-menu")) {
            popup.style.display = "none";
        }
    });
    
    // "Find..." logic
    if (findButton && popup && utrnInput && contextMenu) {
        findButton.addEventListener("click", () => {
            const u = contextMenu.dataset.utrn;
            if (!u) return;
            utrnInput.value = u;
            popup.style.display = "block";
            contextMenu.style.display = "none";
        });
    } else {
        console.warn("Find elements missing.");
    }
    
    // Listeners for popup close buttons
    if (popup) {
        if (closeBtn1) closeBtn1.addEventListener('click', () => popup.style.display = 'none');
        else console.warn("#popup-close-x1 missing.");
        
        if (closeBtn2) closeBtn2.addEventListener('click', () => popup.style.display = 'none');
        else console.warn("#popup-close-x2 missing.");
        
        if (closeBtnTick) closeBtnTick.addEventListener('click', () => popup.style.display = 'none');
        else console.warn("#popup-close-tick missing.");
    } else {
        console.warn("#find-popup missing.");
    }
    
    // Event Listener for the Reverse Button
    if (reverseBtn) {
        reverseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const selRow = document.querySelector('.utrn-row.selected');
            if (!selRow) {
                alert("Select UTRN row.");
                return;
            }
            
            const utrn = selRow.dataset.utrn;
            if (!utrn) {
                alert("Cannot identify UTRN.");
                return;
            }
            
            // Use our helper function from smartui-loader.js
            if (window.smartUIHelpers && window.smartUIHelpers.reverseUTRN) {
                const success = window.smartUIHelpers.reverseUTRN(utrn);
                if (success) {
                    alert(`UTRN ${utrn} reversed.`);
                    // Refresh the table display
                    filterAndDisplayUtrns();
                } else {
                    alert("Cannot reverse this transaction.");
                }
            } else {
                // Fall back to old behavior if helper isn't available
                const stat = selRow.dataset.status;
                const appDt = selRow.dataset.appliedDateTime;
                const noApp = (!appDt || appDt.includes('Invalid') || appDt.includes('Calc') || appDt.trim() === '');
                
                if (stat === 'UTRN Generated' && noApp) {
                    const sStr = localStorage.getItem('smartui_data');
                    if (sStr) {
                        try {
                            const sData = JSON.parse(sStr);
                            const idx = sData.utrnRows.findIndex(row => row.utrn === utrn);
                            if (idx !== -1) {
                                sData.utrnRows[idx].status = 'Reversed';
                                sData.utrnRows[idx].appliedOffset = null;
                                sData.utrnRows[idx].appliedTime = null;
                                localStorage.setItem('smartui_data', JSON.stringify(sData));
                                console.log(`UTRN ${utrn} reversed.`);
                                filterAndDisplayUtrns();
                                alert(`UTRN ${utrn} reversed.`);
                            } else {
                                alert("Error finding data.");
                            }
                        } catch (e) {
                            alert("Error updating status.");
                        }
                    } else {
                        alert("Error: Scenario data missing.");
                    }
                } else {
                    alert("Cannot reverse this transaction.");
                }
            }
        });
    } else {
        console.warn("Reverse button not found.");
    }

    // UTRN Date Filtering Setup
    if (dateFromInput) dateFromInput.disabled = true;
    if (dateToInput) dateToInput.disabled = true; // Start disabled

    dateFilterRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedValue = radio.value;
            console.log(`Filter radio changed to: ${selectedValue}`);
            
            if (selectedValue === 'custom') {
                if (dateFromInput) dateFromInput.disabled = false;
                if (dateToInput) dateToInput.disabled = false;
                
                const t = calculateAndFormatDate(0);
                const ta = calculateAndFormatDate(-29);
                
                if (dateFromInput) dateFromInput.value = ta;
                if (dateToInput) dateToInput.value = t;
                
                // Just clear the table when switching to custom filter
                clearUtrnTable();
            } else {
                if (dateFromInput) dateFromInput.disabled = true;
                if (dateToInput) dateToInput.disabled = true;
            }
        });
    });
    
    // Add Event Listener for Apply Filter Button - KEY CHANGE
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Execute Filter button clicked!");
            filterAndDisplayUtrns();
        });
    } else {
        console.warn("Execute button (#executeHistoricUtrn) not found.");
    }
    
    // IMPORTANT: No longer executing filterAndDisplayUtrns on page load
});
