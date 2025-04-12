// Suggested filename: /smartui/scripts/utrn-table-loader.js
// Includes fixes for date population (handling null offsets) and popup handling.

// --- Helper function for offset date calculation and formatting (DATE ONLY) ---
function calculateAndFormatDate(offset) {
  // *** MODIFIED: Return empty string instead of "Invalid Date" for non-numbers (like null) ***
  if (typeof offset !== 'number') { 
      // console.warn("Invalid offset value received for date calculation:", offset); // Keep console log minimal
      return ""; // Return BLANK instead of "Invalid Date"
  }
  // *** --- ***
  try { const today = new Date(); const targetDate = new Date(today); targetDate.setDate(today.getDate() + offset);
      const dd = String(targetDate.getDate()).padStart(2, '0'); const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const year = targetDate.getFullYear();
      return `${dd}.${mm}.${year}`;
  } catch (dateError) { console.error("Error calculating date from offset:", offset, dateError); return "Calc Error"; } // Keep Calc Error for actual errors
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

  utrnList.forEach((entry, index) => { 
      const row = document.createElement('div');
      row.classList.add('table-row', 'utrn-row');
      row.style.display = 'grid'; 
      row.style.gridTemplateColumns = '160px 160px 75px 65px 160px 70px 210px 50px 50px 60px'; 

      // Calculate Dates using Helper (will now return "" for null offsets)
      const createdDateTime = calculateAndFormatDate(entry.createdOffset); 
      const appliedDateTime = calculateAndFormatDate(entry.appliedOffset); 
      const creationDisplay = entry.createdTime ? `${createdDateTime} ${entry.createdTime}` : createdDateTime;
      const appliedDisplay = entry.appliedTime ? `${appliedDateTime} ${entry.appliedTime}` : appliedDateTime;
   
      const fields = [
          creationDisplay.trim(), // Trim potential whitespace if date part was empty 
          appliedDisplay.trim(),  // Trim potential whitespace if date part was empty
          entry.value || '', entry.type || '', entry.utrn || '', entry.channel || '', 
          entry.status || '', entry.payout || '', entry.bpem || '', entry.auth || ''       
      ];
    
      row.dataset.utrn = entry.utrn || ''; 
      row.dataset.status = entry.status || '';
      row.dataset.appliedDateTime = appliedDisplay.trim(); // Store the potentially empty string 
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

      row.addEventListener("click", () => {
          document.querySelectorAll('.utrn-row.selected').forEach(r => r.classList.remove('selected')); 
          row.classList.add('selected');
      });

      row.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          const menu = document.getElementById("context-menu");
          if (menu) { 
              menu.style.top = `${e.clientY}px`; menu.style.left = `${e.clientX}px`; menu.style.display = "block";
              menu.dataset.utrn = entry.utrn; 
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
  const reverseBtn = document.getElementById('reverseBtn'); 

  // --- Listener to hide context menu on left click outside ---
  document.addEventListener("click", (e) => { 
      if (contextMenu && e.button !== 2 && !e.target.closest("#context-menu")) { 
          contextMenu.style.display = "none";
      }
  });

  // --- Listener to hide popup on click outside ---
  document.addEventListener("click", (e) => {
      if (popup && popup.style.display === 'block' && !e.target.closest("#find-popup") && !e.target.closest("#context-menu")) {
        popup.style.display = "none";
      }
  });

  // --- "Find..." logic ---
  if (findButton && popup && utrnInput && contextMenu) { 
      findButton.addEventListener("click", () => {
          const utrn = contextMenu.dataset.utrn; 
          if (!utrn) { console.warn("Find clicked, but no UTRN found in menu dataset."); return; }
          utrnInput.value = utrn; 
          popup.style.display = "block"; 
          contextMenu.style.display = "none"; 
      });
  } else { console.warn("Find button, popup, input, or context menu element not found for 'Find...' listener."); }

  // --- Listeners for popup close buttons ---
  if (popup) { 
      if (closeBtn1) { closeBtn1.addEventListener('click', () => { popup.style.display = 'none'; console.log("Popup closed via X1"); });
      } else { console.warn("Close button #popup-close-x1 not found."); }
      if (closeBtn2) { closeBtn2.addEventListener('click', () => { popup.style.display = 'none'; console.log("Popup closed via X2"); });
      } else { console.warn("Close button #popup-close-x2 not found."); }
      if (closeBtnTick) { closeBtnTick.addEventListener('click', () => { popup.style.display = 'none'; console.log("Popup closed via Tick"); });
      } else { console.warn("Close button #popup-close-tick not found."); }
  } else { console.warn("Popup element #find-popup not found, cannot add close listeners."); }


  // --- Event Listener for the Reverse Button ---
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
              // Optional Confirmation
              // if (!confirm(`Are you sure you want to reverse UTRN ${utrn}?`)) { console.log("Reversal cancelled."); return; }
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
  // --- End Reverse Button Listener ---

  // --- !! REMOVED Filter Dropdown Listener - User confirmed not needed !! ---

}); // End DOMContentLoaded