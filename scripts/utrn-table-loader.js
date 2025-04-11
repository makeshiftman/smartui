// Suggested filename: /smartui/scripts/utrn-table-loader.js
// Includes date population, popup handling, AND Reverse button logic.

// --- Helper function for offset date calculation and formatting (DATE ONLY) ---
function calculateAndFormatDate(offset) {
  if (typeof offset !== 'number') { console.warn("Invalid offset value received for date calculation:", offset); return "Invalid Date"; }
  try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
      const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const year = targetDate.getFullYear();
      return `${dd}.${mm}.${year}`;
  } catch (dateError) { console.error("Error calculating date from offset:", offset, dateError); return "Calc Error"; }
}


// --- UPDATED populateUTRNTable function ---
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
      row.style.gridColumn = "1 / span 10"; row.style.padding = "10px"; row.textContent = "No historic UTRN records found.";
      container.appendChild(row); return;
  }

  // *** Added 'index' to forEach to get original array index ***
  utrnList.forEach((entry, index) => { 
      const row = document.createElement('div');
      row.classList.add('table-row', 'utrn-row');
      row.style.display = 'grid'; 
      row.style.gridTemplateColumns = '160px 160px 75px 65px 160px 70px 210px 50px 50px 60px'; 

      // Calculate Dates using Helper
      const createdDateTime = calculateAndFormatDate(entry.createdOffset); 
      const appliedDateTime = calculateAndFormatDate(entry.appliedOffset); 
      const creationDisplay = entry.createdTime ? `${createdDateTime} ${entry.createdTime}` : createdDateTime;
      const appliedDisplay = entry.appliedTime ? `${appliedDateTime} ${entry.appliedTime}` : appliedDateTime;
   
      // Build array matching the 10 header columns
      const fields = [
          creationDisplay, appliedDisplay, entry.value || '', entry.type || '', entry.utrn || '', 
          entry.channel || '', entry.status || '', entry.payout || '', entry.bpem || '', entry.auth || ''       
      ];
    
      // *** Store key data on the row element ITSELF using dataset attributes ***
      row.dataset.utrn = entry.utrn || ''; 
      row.dataset.status = entry.status || '';
      row.dataset.appliedDateTime = appliedDisplay; // Store formatted string used for checking empty/invalid
      row.dataset.index = index; // Store original index
      // *** --- ***

      fields.forEach(text => {
          const cell = document.createElement('div');
          cell.textContent = (text === null || text === undefined) ? '' : text;
          row.appendChild(cell);
      });

      container.appendChild(row); // Append row AFTER setting dataset

      // --- Event Listeners for Row Highlighting and Context Menu ---
      row.style.pointerEvents = "auto"; 
      [...row.children].forEach(cell => cell.style.pointerEvents = "none"); 

      row.addEventListener("click", () => {
          document.querySelectorAll('.utrn-row.selected').forEach(r => r.classList.remove('selected')); 
          row.classList.add('selected');
      });

      row.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          const menu = document.getElementById("context-menu");
          if (menu) { 
              menu.style.top = `${e.clientY}px`; menu.style.left = `${e.clientX}px`; menu.style.display = "block";
              menu.dataset.utrn = entry.utrn; // Store utrn on menu for Find popup
          }
      });
       // --- End Event Listeners ---
  });
}


// --- Main DOMContentLoaded Listener ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("utrn-table-loader.js: DOM Loaded");

  // --- Get references needed for listeners ---
  const contextMenu = document.getElementById("context-menu");
  const findButton = document.getElementById("context-find");
  const popup = document.getElementById("find-popup"); 
  const utrnInput = document.getElementById("find-popup-utrn");
  const closeBtn1 = document.getElementById('popup-close-x1');
  const closeBtn2 = document.getElementById('popup-close-x2');
  const closeBtnTick = document.getElementById('popup-close-tick');
  const reverseBtn = document.getElementById('reverseBtn'); // *** ADDED: Reference for Reverse button ***

  // --- Listener to hide context menu on left click outside ---
  document.addEventListener("click", (e) => { /* ... unchanged ... */ 
      if (contextMenu && e.button !== 2 && !e.target.closest("#context-menu")) { 
          contextMenu.style.display = "none";
      }
  });

  // --- Listener to hide popup on click outside ---
  document.addEventListener("click", (e) => { /* ... unchanged ... */
      if (popup && popup.style.display === 'block' && !e.target.closest("#find-popup") && !e.target.closest("#context-menu")) {
        popup.style.display = "none";
      }
  });

  // --- "Find..." logic ---
  if (findButton && popup && utrnInput && contextMenu) { /* ... unchanged ... */
      findButton.addEventListener("click", () => {
          const utrn = contextMenu.dataset.utrn; 
          if (!utrn) { console.warn("Find clicked, but no UTRN found in menu dataset."); return; }
          utrnInput.value = utrn; 
          popup.style.display = "block"; 
          contextMenu.style.display = "none"; 
      });
  } else { console.warn("Find button, popup, input, or context menu element not found for 'Find...' listener."); }

  // --- Listeners for popup close buttons ---
  if (popup) { /* ... unchanged ... */
      if (closeBtn1) { closeBtn1.addEventListener('click', () => { popup.style.display = 'none'; console.log("Popup closed via X1"); });
      } else { console.warn("Close button #popup-close-x1 not found."); }
      if (closeBtn2) { closeBtn2.addEventListener('click', () => { popup.style.display = 'none'; console.log("Popup closed via X2"); });
      } else { console.warn("Close button #popup-close-x2 not found."); }
      if (closeBtnTick) { closeBtnTick.addEventListener('click', () => { popup.style.display = 'none'; console.log("Popup closed via Tick"); });
      } else { console.warn("Close button #popup-close-tick not found."); }
  } else { console.warn("Popup element #find-popup not found, cannot add close listeners."); }


  // --- *** NEW: Event Listener for the Reverse Button *** ---
  if (reverseBtn) {
      reverseBtn.addEventListener('click', (e) => {
          e.preventDefault(); // Prevent default link behavior
          console.log("Reverse button clicked.");

          const selectedRow = document.querySelector('.utrn-row.selected'); // Find highlighted row

          // 1. Check if a row is selected
          if (!selectedRow) {
              alert("Please select a UTRN transaction row to reverse.");
              console.log("Reverse action stopped: No row selected.");
              return;
          }

          // 2. Retrieve data stored on the selected row element's dataset
          const utrn = selectedRow.dataset.utrn;
          const currentStatus = selectedRow.dataset.status;
          const appliedDateTime = selectedRow.dataset.appliedDateTime; // The formatted string
          const rowIndex = parseInt(selectedRow.dataset.index, 10); // Get the original index

          // Check if index is valid
          if (isNaN(rowIndex)) {
               console.error("Reverse action stopped: Invalid row index found on selected row.");
               alert("Could not identify the selected row properly.");
               return;
          }

          console.log(`Attempting to reverse UTRN: ${utrn}, Status: ${currentStatus}, Applied: ${appliedDateTime}, Index: ${rowIndex}`);

          // 3. Check Reversal Conditions 
          // Condition: Status is 'UTRN generated' AND Applied Date/Time string is empty or indicates invalid date
          const isAppliedDateEffectivelyEmpty = (!appliedDateTime || appliedDateTime.includes('Invalid Date') || appliedDateTime.includes('Calc Error') || appliedDateTime.trim() === '');

          if (currentStatus === 'UTRN generated' && isAppliedDateEffectivelyEmpty) {
              // Condition met - proceed 

              // 4. Optional Confirmation (Recommended) - uncomment line below to enable
              // if (!confirm(`Are you sure you want to reverse UTRN ${utrn}?`)) { console.log("Reversal cancelled by user."); return; }
             
              console.log("Conditions met. Proceeding with reversal.");

              // 5. Update localStorage
              const scenarioDataString = localStorage.getItem('smartui_data');
              if (scenarioDataString) {
                  try {
                      const scenarioData = JSON.parse(scenarioDataString);
                      // Double-check data structure and index validity
                      if (scenarioData && Array.isArray(scenarioData.utrnRows) && scenarioData.utrnRows[rowIndex]) {
                          
                          // Update status to 'Reversed'
                          scenarioData.utrnRows[rowIndex].status = 'Reversed';
                          // Clear out applied date/time info as well
                          scenarioData.utrnRows[rowIndex].appliedOffset = null; 
                          scenarioData.utrnRows[rowIndex].appliedTime = null; 

                          // Save the entire updated data back to localStorage
                          localStorage.setItem('smartui_data', JSON.stringify(scenarioData));
                          console.log(`UTRN ${utrn} at index ${rowIndex} status updated to 'Reversed' in localStorage.`);

                          // --- 6. Update UI ---
                          // Re-populate the whole table from the updated localStorage data.
                          // This implicitly uses the updated utrnRows array.
                          populateUTRNTable(scenarioData.utrnRows); 
                          console.log("UTRN table refreshed to show updated status.");

                          // Optional: User feedback
                          alert(`UTRN ${utrn} has been reversed.`);

                      } else {
                          console.error("Error updating localStorage: Could not find utrnRows array or row index is invalid.");
                          alert("Error finding the transaction data to update.");
                      }
                  } catch (e) {
                      console.error("Error parsing or saving localStorage data during reversal:", e);
                      alert("An error occurred while updating transaction status.");
                  }
              } else {
                  console.error("Error updating localStorage: 'smartui_data' not found.");
                  alert("Error: Scenario data not found, cannot save reversal.");
              }

          } else {
              // Condition not met
              console.log("Reversal condition not met.");
              alert("This transaction cannot be reversed. Only 'UTRN generated' transactions that have not been applied can be reversed.");
          }
      }); // End click listener

  } else {
      console.warn("Reverse button (#reverseBtn) not found on this page.");
  }
  // --- End NEW Reverse Button Listener ---


}); // End DOMContentLoaded