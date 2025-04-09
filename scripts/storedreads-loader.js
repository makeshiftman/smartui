// --- Corrected storedreads-loader.js ---

// --- Helper Functions (defined globally is fine) ---

/**
 * Parses a "DD.MM.YYYY" string into a JavaScript Date object (at midnight UTC).
 * Returns null if the format is invalid or the date doesn't make sense.
 * @param {string} dateStr - The date string in "DD.MM.YYYY" format.
 * @returns {Date | null} - The corresponding Date object or null if invalid.
 */
function parseUKDate(dateStr) {
    if (!dateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
        // console.error("Invalid UK date string format:", dateStr); // Keep console logs minimal unless debugging
        return null;
    }
    const parts = dateStr.split(".");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // Month from string is 1-12
    const year = parseInt(parts[2], 10);
  
    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
        // console.error("Invalid date components after parsing:", dateStr);
        return null;
    }
    // Create Date object using UTC to avoid timezone issues; month is 0-indexed
    const date = new Date(Date.UTC(year, month - 1, day));
  
    // Verify that the created date matches the input components (e.g., handles Feb 30th)
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        // console.error("Date object mismatch (invalid date like Feb 30?):", dateStr);
        return null;
    }
    return date;
  }
  
  /**
   * Calculates the sum of registers 1-4 for a given row.
   * Returns the rounded total.
   * @param {object} row - The meter reading data object.
   * @returns {number} - The rounded sum of register values.
   */
  function calculateTotal(row) {
      // Ensure register values exist before parsing, default to 0 if missing/invalid
      const r1 = parseFloat(row.register1) || 0;
      const r2 = parseFloat(row.register2) || 0;
      const r3 = parseFloat(row.register3) || 0;
      const r4 = parseFloat(row.register4) || 0;
      // Sum valid numbers
      const total = r1 + r2 + r3 + r4;
      // Using Math.round as per your original code for the final total
      return Math.round(total);
  }
  
  /**
   * Populates the results table with filtered meter reading data.
   * @param {HTMLElement} tableBodyElement - The <tbody> or <div> element to populate.
   * @param {Array} data - The array of meter reading objects to display.
   */
  function populateTable(tableBodyElement, data) {
      if (!tableBodyElement) return; // Safety check
  
      tableBodyElement.innerHTML = ""; // Clear previous results
  
      if (data.length === 0) {
          // Display a message if no rows match the filter
          const div = document.createElement("div");
          div.className = "table-row"; // Use your existing class if needed
          div.style.textAlign = "center";
          div.style.gridColumn = "1 / -1"; // Make it span all grid columns
          div.style.padding = "10px";
          div.innerHTML = `<div>No meter readings found for the selected period.</div>`;
          tableBodyElement.appendChild(div);
      } else {
          let previousTotal = null; // Initialize for average calculation
  
          // Sort rows by date ascending before display (optional but good practice)
          data.sort((a, b) => {
              const dateA = parseUKDate(a.date);
              const dateB = parseUKDate(b.date);
              if (!dateA || !dateB) return 0; // Handle potential null dates from parseUKDate
              return dateA - dateB;
          });
  
          data.forEach(row => {
              // Use DD.MM.YYYY format for display as received
              const displayDate = row.date || "Invalid Date"; // Handle missing date field gracefully
              const displayTime = "00:00"; // Assuming midnight as per original code
              const datetime = `${displayDate} ${displayTime}`;
  
              const total = calculateTotal(row); // Use your helper function
              // Ensure previousTotal is a number before calculating average
              const average = (previousTotal !== null && typeof previousTotal === 'number') ? Math.round(total - previousTotal) : "";
  
              const div = document.createElement("div");
              div.className = "table-row"; // Use your row class
              // Use grid-template-columns from header for alignment
              div.style.display = "grid";
              div.style.gridTemplateColumns = "160px 75px 75px 75px 75px 110px 110px";
  
              div.innerHTML = `
                  <div>${datetime}</div>
                  <div>${row.register1 || ""}</div>
                  <div>${row.register2 || ""}</div>
                  <div>${row.register3 || ""}</div>
                  <div>${row.register4 || ""}</div>
                  <div>${total}</div>
                  <div>${average !== "" ? average : ""}</div>
              `; // Display empty string if average can't be calculated
              tableBodyElement.appendChild(div);
  
              previousTotal = total; // Update previousTotal for the next iteration
          });
      }
  }
  
  
  // --- Main Execution Logic (Wait for DOM Ready) ---
  document.addEventListener('DOMContentLoaded', () => {
  
      // Get references to elements *after* DOM is loaded
      const executeBtn = document.getElementById("executeStoredReads");
      const tableWrapper = document.getElementById("storedreads-frame"); // Should be found now
      const tableBody = document.getElementById("storedreads-table");
  
      // Check if essential elements exist and attach listener
      if (executeBtn && tableWrapper && tableBody) {
          executeBtn.addEventListener("click", e => {
              e.preventDefault(); // Prevent default anchor behavior
  
              // --- 1. Get Raw Data ---
              const scenarioData = localStorage.getItem("smartui_data");
              let allRows = [];
              if (scenarioData) {
                  try {
                      const scenario = JSON.parse(scenarioData);
                      // Ensure storedMeterReads exists and is an array
                      if (scenario && Array.isArray(scenario.storedMeterReads)) {
                          allRows = scenario.storedMeterReads;
                      } else {
                          console.warn("storedMeterReads not found or not an array in localStorage data.");
                          populateTable(tableBody, []); // Show empty table
                          return;
                      }
                  } catch (parseError) {
                      console.error("Failed to parse smartui_data from localStorage:", parseError);
                      alert("Error reading scenario data. Please check the console.");
                      populateTable(tableBody, []); // Show empty table
                      return; // Stop execution if data is corrupt
                  }
              } else {
                  console.warn("No smartui_data found in localStorage.");
                  alert("No scenario data loaded. Please load a scenario first.");
                  populateTable(tableBody, []); // Show empty table
                  return;
              }
  
              // --- 2. Determine Filter Type and Dates ---
              const selectedRange = document.querySelector("input[name='SMRrange']:checked")?.value;
              let filteredRows = []; // Initialize array for filtered results
              const today = new Date(); // Get current date
              // Set today to midnight UTC for consistent comparisons
              today.setUTCHours(0, 0, 0, 0);
  
              try { // Wrap filtering logic in a try block for date parsing safety
                  if (selectedRange === "7") {
                      // Calculate the date 7 days ago (inclusive of today, so go back 6 days)
                      const sevenDaysAgo = new Date(today);
                      sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
                      console.log(`Filtering last 7 days: From ${sevenDaysAgo.toISOString()} to ${today.toISOString()}`);
                      filteredRows = allRows.filter(row => {
                          const rowDate = parseUKDate(row.date);
                          return rowDate && rowDate >= sevenDaysAgo && rowDate <= today;
                      });
  
                  } else if (selectedRange === "30") {
                      // Calculate the date 30 days ago (inclusive, so go back 29 days)
                      const thirtyDaysAgo = new Date(today);
                      thirtyDaysAgo.setUTCDate(today.getUTCDate() - 29);
                      console.log(`Filtering last 30 days: From ${thirtyDaysAgo.toISOString()} to ${today.toISOString()}`);
                      filteredRows = allRows.filter(row => {
                          const rowDate = parseUKDate(row.date);
                          return rowDate && rowDate >= thirtyDaysAgo && rowDate <= today;
                      });
  
                  } else if (selectedRange === "custom") {
                      const fromInput = document.getElementById("StoredMR_Date_From").value;
                      const toInput = document.getElementById("StoredMR_Date_To").value; // Corrected ID used here
  
                      if (!fromInput || !toInput) {
                          alert("Please enter both FROM and TO dates using DD.MM.YYYY format.");
                          populateTable(tableBody, []); // Clear table
                          return; // Stop if dates are missing
                      }
  
                      const fromDate = parseUKDate(fromInput);
                      const toDate = parseUKDate(toInput);
  
                      if (!fromDate || !toDate) {
                          alert("Invalid date format entered. Please use DD.MM.YYYY.");
                          populateTable(tableBody, []); // Clear table
                          return; // Stop if dates are invalid
                      }
  
                      if (fromDate > toDate) {
                          alert("The 'From' date cannot be after the 'To' date.");
                          populateTable(tableBody, []); // Clear table
                          return; // Stop if range is illogical
                      }
  
                      console.log(`Filtering custom range: From ${fromDate.toISOString()} to ${toDate.toISOString()}`);
                      filteredRows = allRows.filter(row => {
                          const rowDate = parseUKDate(row.date);
                          return rowDate && rowDate >= fromDate && rowDate <= toDate;
                      });
  
                  } else {
                      console.warn("No valid range selected.");
                      filteredRows = []; // Show no rows if selection is invalid
                  }
              } catch (filterError) {
                  console.error("Error during filtering:", filterError);
                  alert("An error occurred while filtering the data. Please check console.");
                  filteredRows = []; // Clear results on error
              }
  
              // --- 3. Populate Table ---
              populateTable(tableBody, filteredRows); // Use the helper function
  
              tableWrapper.style.display = "block"; // Ensure the table container is visible
          });
      } else {
          // Log errors if essential elements are missing *after* DOM load attempt
          if (!executeBtn) console.error("Initialization Error: Execute button (#executeStoredReads) not found.");
          if (!tableWrapper) console.error("Initialization Error: Table wrapper (#storedreads-frame) not found.");
          if (!tableBody) console.error("Initialization Error: Table body (#storedreads-table) not found.");
      }
  }); // End DOMContentLoaded
  