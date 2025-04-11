// Suggested filename: /smartui/scripts/utrn-table-loader.js
// Includes date population, popup handling, Reverse button logic, AND Date Range Filtering.

// --- Helper function for offset date calculation and formatting (DATE ONLY) ---
function calculateAndFormatDate(offset) {
  if (typeof offset !== 'number') { return ""; } // Return BLANK for null/invalid offset
  try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
      const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const year = targetDate.getFullYear();
      return `${dd}.${mm}.${year}`;
  } catch (dateError) { console.error("Error calculating date from offset:", offset, dateError); return "Calc Error"; }
}

// *** ADDED START: Helper function needed for Custom Date Range parsing ***
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
// *** ADDED END ***

// *** ADDED START: Helper function needed for pre-filling date inputs ***
// Formats a Date object to DD.MM.YYYY string
function formatDateToDDMMYYYY(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) { return ""; }
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const<x_bin_664> = dateObj.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
// *** ADDED END ***


// --- UPDATED populateUTRNTable function (includes dataset attributes) ---
function populateUTRNTable(utrnList) {
  const container = document.getElementById('utrn-table');
  if (!container || !Array.isArray(utrnList)) {
      console.error("populateUTRNTable: Container not found or utrnList is not an array.");
      if (container) { container.innerHTML = "<div class='table-row' style='text-align:center; grid-column: 1 / -1; padding: 10px;'>Error loading UTRN data.</div>"; }
      return;
  }

  container.innerHTML = ''; // Clear previous rows

  if (utrnList.length === 0) {
      const row = document.createElement('div'); row.classList.add('table-row'); row.style.textAlign = "center";
      row.style.gridColumn = "1 / span 10"; row.style.padding = "10px"; row.textContent = "No historic UTRN records found matching filter."; // Updated message
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

      // --- Event Listeners for Row Highlighting and Context Menu ---
      row.style.pointerEvents = "auto";
      [...row.children].forEach(cell => cell.style.pointerEvents = "none");
      row.addEventListener("click", () => { /* ... unchanged ... */ });
      row.addEventListener("contextmenu", (e) => { /* ... unchanged ... */ });
  });
}

// *** ADDED START: Central function to filter and display UTRNs ***
function filterAndDisplayUtrns() {
  console.log("Applying UTRN date filter...");

  // --- Get Filter Settings ---
  // *** Use the NAME you assigned to the radio buttons in HTML ***
  const filterValue = document.querySelector('input[name="historicUtrnFilter"]:checked')?.value;
  // *** Use the IDs of your date input fields ***
  const dateFromInput = document.getElementById('Historic_Date_From');
  const dateToInput = document.getElementById('Historic_Date_To');

  console.log(`Selected filter type: ${filterValue}`);

  // --- Get Full Data ---
  const scenarioDataString = localStorage.getItem('smartui_data');
  let fullUtrnList = [];
  if (!scenarioDataString) {
      console.error("filterAndDisplayUtrns: smartui_data not found.");
      populateUTRNTable([]); return;
  }
  try {
      const scenarioData = JSON.parse(scenarioDataString);
      fullUtrnList = (scenarioData && Array.isArray(scenarioData.utrnRows)) ? scenarioData.utrnRows : [];
  } catch (e) {
      console.error("filterAndDisplayUtrns: Error parsing smartui_data.", e);
      populateUTRNTable([]); return;
  }

  // --- Apply Filter ---
  let filteredList = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Normalize to midnight UTC

  try {
      if (filterValue === '7') {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
          console.log(`Filtering last 7 days (using createdOffset): >= ${sevenDaysAgo.toISOString()}`);
          filteredList = fullUtrnList.filter(row => {
              if (typeof row.createdOffset !== 'number') return false;
              const createdDate = new Date(); createdDate.setDate(createdDate.getDate() + row.createdOffset); createdDate.setUTCHours(0, 0, 0, 0);
              return createdDate >= sevenDaysAgo && createdDate <= today;
          });

      } else if (filterValue === '30') {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setUTCDate(today.getUTCDate() - 29);
          console.log(`Filtering last 30 days (using createdOffset): >= ${thirtyDaysAgo.toISOString()}`);
           filteredList = fullUtrnList.filter(row => {
              if (typeof row.createdOffset !== 'number') return false;
              const createdDate = new Date(); createdDate.setDate(createdDate.getDate() + row.createdOffset); createdDate.setUTCHours(0, 0, 0, 0);
              return createdDate >= thirtyDaysAgo && createdDate <= today;
          });

      } else if (filterValue === 'custom') {
           if (!dateFromInput || !dateToInput) {
               console.error("Custom filter selected but date input elements not found.");
               filteredList = [];
           } else {
               const fromDate = parseUKDate(dateFromInput.value); // Use helper from THIS file
               const toDate = parseUKDate(dateToInput.value);     // Use helper from THIS file
               console.log(`Filtering custom range (using createdOffset): ${dateFromInput.value} to ${dateToInput.value}`);

               if (fromDate && toDate && fromDate <= toDate) {
                   // Dates are already normalized by parseUKDate
                   filteredList = fullUtrnList.filter(row => {
                       if (typeof row.createdOffset !== 'number') return false;
                       const createdDate = new Date(); createdDate.setDate(createdDate.getDate() + row.createdOffset); createdDate.setUTCHours(0, 0, 0, 0);
                       return createdDate >= fromDate && createdDate <= toDate;
                   });
               } else {
                   console.warn("Custom date range is invalid or dates not parsed correctly.");
                   // IMPORTANT: If custom is selected but dates invalid, show NO results
                   filteredList = [];
               }
           }
      } else {
          // Default case (should technically be '7' due to initial call)
          console.warn(`Unknown or no filter value: ${filterValue}. Applying default 7-day filter.`);
           const sevenDaysAgo = new Date(today); sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
           filteredList = fullUtrnList.filter(row => {
               if (typeof row.createdOffset !== 'number') return false;
               const createdDate = new Date(); createdDate.setDate(createdDate.getDate() + row.createdOffset); createdDate.setUTCHours(0,0,0,0);
               return createdDate >= sevenDaysAgo && createdDate <= today;
           });
      }
  } catch (filterError) {
      console.error("Error during UTRN filtering:", filterError);
      filteredList = [];
  }

  // --- Display Results ---
  populateUTRNTable(filteredList);
}
// *** ADDED END ***


// --- Main DOMContentLoaded Listener ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("utrn-table-loader.js: DOM Loaded");

  // --- Get references needed for listeners ---
  // (References for context menu, popup, close buttons, reverse button remain the same)
  const contextMenu = document.getElementById("context-menu");
  const findButton = document.getElementById("context-find");
  const popup = document.getElementById("find-popup");
  const utrnInput = document.getElementById("find-popup-utrn");
  const closeBtn1 = document.getElementById('popup-close-x1');
  const closeBtn2 = document.getElementById('popup-close-x2');
  const closeBtnTick = document.getElementById('popup-close-tick');
  const reverseBtn = document.getElementById('reverseBtn');

  // --- Listeners remain the same ---
  // (Listener for context menu hide)
  document.addEventListener("click", (e) => { /* ... */ });
  // (Listener for popup hide)
  document.addEventListener("click", (e) => { /* ... */ });
  // ("Find..." logic)
  if (findButton && popup && utrnInput && contextMenu) { /* ... */ } else { /* ... */ }
  // (Listeners for popup close buttons)
  if (popup) { /* ... */ } else { /* ... */ }
  // (Event Listener for the Reverse Button)
  if (reverseBtn) { /* ... */ } else { /* ... */ }


  // *** ADDED START: UTRN Date Filtering Setup ***
  // --- UTRN Date Filtering Setup ---
  // *** Use the NAME you assigned to the radio buttons in HTML ***
  const dateFilterRadios = document.querySelectorAll('input[name="historicUtrnFilter"]');
  // *** Use the IDs of your date input fields ***
  const dateFromInput = document.getElementById('Historic_Date_From');
  const dateToInput = document.getElementById('Historic_Date_To');

  // Disable date inputs initially if they exist
  if (dateFromInput) dateFromInput.disabled = true;
  if (dateToInput) dateToInput.disabled = true;

  // Add event listener to radio buttons
  dateFilterRadios.forEach(radio => {
      radio.addEventListener('change', () => {
          const selectedValue = radio.value; // Get the value of the CLICKED radio
          console.log(`Date filter radio changed to: ${selectedValue}`);

          if (selectedValue === 'custom') {
              // Enable date inputs
              if (dateFromInput) dateFromInput.disabled = false;
              if (dateToInput) dateToInput.disabled = false;

              // Pre-fill with last 30 days
              // Format dates using the helper function from THIS file
              const formattedToday = calculateAndFormatDate(0);
              const formattedThirtyAgo = calculateAndFormatDate(-29);

              // Check elements before setting value
              if(dateFromInput) dateFromInput.value = formattedThirtyAgo;
              if(dateToInput) dateToInput.value = formattedToday;

              // Clear the table and prompt user for next action
              const utrnTableBody = document.getElementById('utrn-table');
              if (utrnTableBody) {
                  // Use simple innerHTML for message
                  utrnTableBody.innerHTML = "<div class='table-row' style='text-align:center; grid-column: 1 / -1; padding: 10px;'>Enter custom dates and click [Apply/Execute button].</div>";
              }
          } else { // '7' or '30' days selected
              // Disable date inputs
              if (dateFromInput) dateFromInput.disabled = true;
              if (dateToInput) dateToInput.disabled = true;
              // Apply filter immediately
              filterAndDisplayUtrns();
          }
      });
  });

  // --- Apply initial filter on page load ---
  // Apply based on the default checked radio ('7') after DOM is ready
  setTimeout(() => {
      console.log("Applying initial date filter...");
      // Ensure filterAndDisplayUtrns function exists before calling
      if (typeof filterAndDisplayUtrns === 'function') {
         filterAndDisplayUtrns();
      } else {
          console.error("Initial filter cannot be applied: filterAndDisplayUtrns function not found.");
      }
  }, 300); // Small delay
  // --- End UTRN Date Filtering Setup ---
  // *** ADDED END ***


}); // End DOMContentLoaded