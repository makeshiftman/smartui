// --- Corrected storedreads-loader.js ---

// --- Helper Functions (Keep these as they are) ---
function parseUKDate(dateStr) { /* ... same as before ... */ 
    if (!dateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) { return null; }
    const parts = dateStr.split(".");
    const day = parseInt(parts[0], 10); const month = parseInt(parts[1], 10); const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) { return null; }
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) { return null; }
    return date;
}
function calculateTotal(row) { /* ... same as before ... */ 
    const r1 = parseFloat(row.register1) || 0; const r2 = parseFloat(row.register2) || 0;
    const r3 = parseFloat(row.register3) || 0; const r4 = parseFloat(row.register4) || 0;
    const total = r1 + r2 + r3 + r4; return Math.round(total);
}
function populateTable(tableBodyElement, data) { /* ... same as before ... */ 
    if (!tableBodyElement) { console.error("populateTable Error: tableBodyElement not provided."); return; }
    tableBodyElement.innerHTML = ""; 
    if (data.length === 0) {
        const div = document.createElement("div"); div.className = "table-row"; div.style.textAlign = "center";
        div.style.gridColumn = "1 / -1"; div.style.padding = "10px";
        div.innerHTML = `<div>No meter readings found for the selected period.</div>`;
        tableBodyElement.appendChild(div);
    } else {
        let previousTotal = null; 
        data.sort((a, b) => { const dateA = parseUKDate(a.date); const dateB = parseUKDate(b.date); if (!dateA || !dateB) return 0; return dateA - dateB; });
        data.forEach(row => {
            const displayDate = row.date || "Invalid Date"; const displayTime = "00:00"; const datetime = `${displayDate} ${displayTime}`;
            const total = calculateTotal(row); const average = (previousTotal !== null && typeof previousTotal === 'number') ? Math.round(total - previousTotal) : "";
            const div = document.createElement("div"); div.className = "table-row"; div.style.display = "grid";
            div.style.gridTemplateColumns = "160px 75px 75px 75px 75px 110px 110px";
            div.innerHTML = `<div>${datetime}</div><div>${row.register1 || ""}</div><div>${row.register2 || ""}</div><div>${row.register3 || ""}</div><div>${row.register4 || ""}</div><div>${total}</div><div>${average !== "" ? average : ""}</div>`; 
            tableBodyElement.appendChild(div); previousTotal = total; 
        });
    }
}
// --- End Helper Functions ---


// --- Main Execution Logic (Wait for DOM Ready) ---
document.addEventListener('DOMContentLoaded', () => {

    const executeBtn = document.getElementById("executeStoredReads");
    const tableWrapper = document.getElementById("storedreads-frame"); // Still needed to show/hide wrapper
    const tableBody = document.getElementById("storedreads-table");   // Still needed for populateTable

    // Check if essential elements exist and attach listener
    if (executeBtn && tableWrapper && tableBody) {
        executeBtn.addEventListener("click", e => {
            e.preventDefault(); // Prevent default anchor behavior
            console.log("#executeStoredReads button clicked.");

            // --- 1. Get Raw Data ---
            const scenarioData = localStorage.getItem("smartui_data");
            let allRows = [];
            if (scenarioData) {
                try {
                    const scenario = JSON.parse(scenarioData);
                    if (scenario && Array.isArray(scenario.storedMeterReads)) {
                        allRows = scenario.storedMeterReads;
                    } else {
                        console.warn("storedMeterReads not found or not an array in localStorage data.");
                        populateTable(tableBody, []); return;
                    }
                } catch (parseError) {
                    console.error("Failed to parse smartui_data from localStorage:", parseError);
                    alert("Error reading scenario data. Please check the console.");
                    populateTable(tableBody, []); return; 
                }
            } else {
                console.warn("No smartui_data found in localStorage.");
                alert("No scenario data loaded. Please load a scenario first.");
                populateTable(tableBody, []); return;
            }

            // --- 2. Determine Filter Type and Apply Filter ---
            // *** MODIFIED: Read the 'readMode' radio buttons ***
            const selectedMode = document.querySelector("input[name='readMode']:checked")?.value;
            let filteredRows = []; 
            const today = new Date(); 
            today.setUTCHours(0, 0, 0, 0);

            console.log(`Selected readMode: ${selectedMode}`);

            try { 
                if (selectedMode === 'latest') {
                    // --- ### ACTION REQUIRED HERE ### ---
                    // --- What does 'Latest' mean? ---
                    console.log("Applying 'Latest' filter logic...");

                    // Option A: Show ALL reads (no filtering)
                    // filteredRows = allRows; 
                    
                    // Option B: Show Last 7 Days (like original '7' value)
                     const sevenDaysAgo = new Date(today);
                     sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
                     filteredRows = allRows.filter(row => {
                         const rowDate = parseUKDate(row.date);
                         return rowDate && rowDate >= sevenDaysAgo && rowDate <= today;
                     });
                     console.log("Applied filter: Last 7 days");

                    // Option C: Show only the single MOST RECENT read
                    // if (allRows.length > 0) {
                    //    // Requires dates to be parsed and sorted first
                    //    const sortedRows = allRows.map(r => ({...r, parsedDate: parseUKDate(r.date)}))
                    //                            .filter(r => r.parsedDate) // Filter out invalid dates
                    //                            .sort((a, b) => b.parsedDate - a.parsedDate); // Sort descending
                    //    if (sortedRows.length > 0) {
                    //        filteredRows = [sortedRows[0]]; // Get the most recent one
                    //        console.log("Applied filter: Single most recent read");
                    //    } else { filteredRows = []; }
                    // } else { filteredRows = []; }
                    
                    // --- ### Choose ONE option above (or implement your own) ### ---
                    // --- ### Delete or comment out the options you DON'T use ### ---


                } else if (selectedMode === 'selectDate') {
                    // This logic uses the date input fields - same as the old 'custom' logic
                    console.log("Applying 'Select Date' filter logic...");
                    const fromInputEl = document.getElementById("StoredMR_Date_From");
                    const toInputEl = document.getElementById("StoredMR_Date_To"); 
                    const fromInput = fromInputEl ? fromInputEl.value : null;
                    const toInput = toInputEl ? toInputEl.value : null;

                    if (!fromInput || !toInput) {
                        alert("Please enter both FROM and TO dates using DD.MM.YYYY format.");
                        populateTable(tableBody, []); return; 
                    }
                    const fromDate = parseUKDate(fromInput);
                    const toDate = parseUKDate(toInput);
                    if (!fromDate || !toDate) {
                        alert("Invalid date format entered. Please use DD.MM.YYYY.");
                        populateTable(tableBody, []); return; 
                    }
                    if (fromDate > toDate) {
                        alert("The 'From' date cannot be after the 'To' date.");
                        populateTable(tableBody, []); return; 
                    }
                    console.log(`Filtering custom range: From ${fromDate.toISOString()} to ${toDate.toISOString()}`);
                    filteredRows = allRows.filter(row => {
                        const rowDate = parseUKDate(row.date);
                        return rowDate && rowDate >= fromDate && rowDate <= toDate;
                    });

                } else {
                    // Case where neither 'latest' nor 'selectDate' is checked
                    console.warn(`No valid readMode selected (value: ${selectedMode}). Displaying NO rows.`);
                    filteredRows = []; 
                }
            } catch (filterError) {
                console.error("Error during filtering:", filterError);
                alert("An error occurred while filtering the data. Please check console.");
                filteredRows = []; // Clear results on error
            }

            // --- 3. Populate Table ---
            console.log(`Populating table with ${filteredRows.length} rows.`);
            populateTable(tableBody, filteredRows); // Use the helper function
            tableWrapper.style.display = "block"; // Ensure the table container is visible
        });
    } else {
        // Log errors if essential elements are missing *after* DOM load attempt
        if (!executeBtn) console.error("Initialization Error: Execute button (#executeStoredReads) not found.");
        if (!tableWrapper) console.error("Initialization Error: Table wrapper (#storedreads-frame) not found.");
        if (!tableBody) console.error("Initialization Error: Table body (#storedreads-table) not found.");
    }

    // NO automatic call here - display logic only runs on button click now.

}); // End DOMContentLoaded