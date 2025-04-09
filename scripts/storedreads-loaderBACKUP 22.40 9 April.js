// --- Corrected storedreads-loader.js ---

const executeBtn = document.getElementById("executeStoredReads");
const tableWrapper = document.getElementById("storedreads-frame");
const tableBody = document.getElementById("storedreads-table");

// Helper function (keep as you provided)
function parseUKDate(dateStr) {
  if (!dateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
      console.error("Invalid UK date string format:", dateStr);
      return null; // Return null for invalid formats
  }
  const parts = dateStr.split(".");
  // Ensure parts are parsed as numbers before creating Date
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // Month from string is 1-12
  const year = parseInt(parts[2], 10);

  // Basic validation for numeric parts and plausible ranges
  if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
      console.error("Invalid date components after parsing:", dateStr);
      return null;
  }

  // Create Date object - month is 0-indexed (0=Jan, 11=Dec)
  const date = new Date(Date.UTC(year, month - 1, day));

  // Final check: ensure the date wasn't invalid (e.g., Feb 30th) which might create a different date
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      console.error("Date object mismatch after creation (invalid date like Feb 30?):", dateStr);
      return null;
  }
  // We don't need setHours(0,0,0,0) because Date.UTC inherently creates it at midnight UTC.
  return date;
}


// Helper function (keep as you provided)
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
            }
        } catch (parseError) {
            console.error("Failed to parse smartui_data from localStorage:", parseError);
            // Optionally alert the user or show an error message in the UI
            alert("Error reading scenario data. Please check the console.");
            return; // Stop execution if data is corrupt
        }
    } else {
        console.warn("No smartui_data found in localStorage.");
        // Optionally alert the user
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
                // Check if rowDate is valid and within the range
                return rowDate && rowDate >= sevenDaysAgo && rowDate <= today;
            });

        } else if (selectedRange === "30") {
            // Calculate the date 30 days ago (inclusive, so go back 29 days)
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setUTCDate(today.getUTCDate() - 29);

             console.log(`Filtering last 30 days: From ${thirtyDaysAgo.toISOString()} to ${today.toISOString()}`);

            filteredRows = allRows.filter(row => {
                const rowDate = parseUKDate(row.date);
                // Check if rowDate is valid and within the range
                return rowDate && rowDate >= thirtyDaysAgo && rowDate <= today;
            });

        } else if (selectedRange === "custom") {
            const fromInput = document.getElementById("StoredMR_Date_From").value;
            // *** FIX: Corrected ID for the 'To' date input ***
            const toInput = document.getElementById("StoredMR_Date_To").value;

            if (!fromInput || !toInput) {
                alert("Please enter both FROM and TO dates using DD.MM.YYYY format.");
                tableBody.innerHTML = "<tr><td colspan='7'>Please select valid From and To dates.</td></tr>"; // Clear/update table
                return; // Stop if dates are missing
            }

            const fromDate = parseUKDate(fromInput);
            const toDate = parseUKDate(toInput);

             // Validate parsed dates
             if (!fromDate || !toDate) {
                 alert("Invalid date format entered. Please use DD.MM.YYYY.");
                 tableBody.innerHTML = "<tr><td colspan='7'>Invalid date format. Use DD.MM.YYYY.</td></tr>"; // Clear/update table
                 return; // Stop if dates are invalid
             }

            // Validate date range logic
            if (fromDate > toDate) {
                alert("The 'From' date cannot be after the 'To' date.");
                 tableBody.innerHTML = "<tr><td colspan='7'>'From' date cannot be after 'To' date.</td></tr>"; // Clear/update table
                return; // Stop if range is illogical
            }

            console.log(`Filtering custom range: From ${fromDate.toISOString()} to ${toDate.toISOString()}`);

            filteredRows = allRows.filter(row => {
                const rowDate = parseUKDate(row.date);
                 // Check if rowDate is valid and within the range (inclusive)
                return rowDate && rowDate >= fromDate && rowDate <= toDate;
            });

        } else {
             // Handle cases where no radio button is selected (shouldn't happen if one is 'checked' by default)
             console.warn("No valid range selected.");
             filteredRows = []; // Show no rows if selection is invalid
        }
    } catch (filterError) {
         console.error("Error during filtering:", filterError);
         alert("An error occurred while filtering the data. Please check console.");
         filteredRows = []; // Clear results on error
    }


    // --- 3. Populate Table ---
    tableBody.innerHTML = ""; // Clear previous results

    if (filteredRows.length === 0) {
        // Display a message if no rows match the filter
        const div = document.createElement("div");
        div.className = "table-row"; // Use your existing class if needed
        div.style.textAlign = "center";
        div.style.gridColumn = "1 / -1"; // Make it span all grid columns
        div.innerHTML = `<div>No meter readings found for the selected period.</div>`;
        tableBody.appendChild(div);
    } else {
        let previousTotal = null; // Initialize for average calculation

        // Sort rows by date ascending before display (optional but good practice)
        filteredRows.sort((a, b) => {
            const dateA = parseUKDate(a.date);
            const dateB = parseUKDate(b.date);
            if (!dateA || !dateB) return 0; // Handle potential null dates from parseUKDate
            return dateA - dateB;
        });


        filteredRows.forEach(row => {
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
            tableBody.appendChild(div);

            previousTotal = total; // Update previousTotal for the next iteration
        });
    }

    tableWrapper.style.display = "block"; // Ensure the table container is visible
  });
} else {
    // Log errors if essential elements are missing
    if (!executeBtn) console.error("Execute button (#executeStoredReads) not found.");
    if (!tableWrapper) console.error("Table wrapper (#storedreads-frame) not found.");
    if (!tableBody) console.error("Table body (#storedreads-table) not found.");
}