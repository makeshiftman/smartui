// Suggested filename: /smartui/scripts/utrn-table-loader.js
// Includes fixes for date population and popup handling (triggering, closing).

// --- Helper function for offset date calculation and formatting (DATE ONLY) ---
// (Copied here as it's needed by populateUTRNTable)
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
      // Display message if container exists but data is bad
      if (container) {
           container.innerHTML = "<div class='table-row' style='text-align:center; grid-column: 1 / -1; padding: 10px;'>Error loading UTRN data.</div>";
      }
      return;
  }

  container.innerHTML = ''; // Clear previous rows

  if (utrnList.length === 0) {
      // Display a message if the list is empty
      const row = document.createElement('div');
      row.classList.add('table-row');
      row.style.textAlign = "center";
      // Assuming 10 columns based on header, adjust if needed
      row.style.gridColumn = "1 / span 10"; 
      row.style.padding = "10px";
      row.textContent = "No historic UTRN records found.";
      container.appendChild(row);
      return;
  }

  utrnList.forEach(entry => {
      const row = document.createElement('div');
      row.classList.add('table-row', 'utrn-row');
      // Set display grid here if not handled by CSS class
      row.style.display = 'grid'; 
      // Set grid columns to match header - IMPORTANT for alignment
      row.style.gridTemplateColumns = '160px 160px 75px 65px 160px 70px 210px 50px 50px 60px'; 

      // Calculate Dates using Helper
      // *** Assumes JSON keys: createdOffset, appliedOffset, createdTime, appliedTime ***
      // *** Verify these keys against your actual JSON data ***
      const createdDateTime = calculateAndFormatDate(entry.createdOffset); 
      const appliedDateTime = calculateAndFormatDate(entry.appliedOffset); 
      const creationDisplay = entry.createdTime ? `${createdDateTime} ${entry.createdTime}` : createdDateTime;
      const appliedDisplay = entry.appliedTime ? `${appliedDateTime} ${entry.appliedTime}` : appliedDateTime;
     
      // Build array matching the 10 header columns
      // *** Verify JSON keys: value, type, utrn, channel, status, payout, bpem, auth ***
      const fields = [
          creationDisplay,       
          appliedDisplay,        
          entry.value || '',     
          entry.type || '',      
          entry.utrn || '',      
          entry.channel || '',   
          entry.status || '',    
          entry.payout || '',    // Assuming 'payout' key exists
          entry.bpem || '',      // Assuming 'bpem' key exists
          entry.auth || ''       
      ];
      
      fields.forEach(text => {
          const cell = document.createElement('div');
          cell.textContent = (text === null || text === undefined) ? '' : text;
          // Apply text alignment from CSS potentially, or set here if needed
          // e.g., cell.style.textAlign = 'left'; // For specific columns if needed
          row.appendChild(cell);
      });

      container.appendChild(row);

      // --- Event Listeners for Row Highlighting and Context Menu ---
      row.style.pointerEvents = "auto"; // Allow clicks on the row
      [...row.children].forEach(cell => cell.style.pointerEvents = "none"); // Prevent clicks on cell text interfering

      row.addEventListener("click", () => {
          document.querySelectorAll('.utrn-row.selected').forEach(r => r.classList.remove('selected')); // More specific selector
          row.classList.add('selected');
      });

      row.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          const menu = document.getElementById("context-menu");
          if (menu) { 
              menu.style.top = `${e.clientY}px`;
              menu.style.left = `${e.clientX}px`;
              menu.style.display = "block";
              // Store the UTRN on the menu element itself using dataset
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

  // --- Listener to hide context menu on left click outside ---
  document.addEventListener("click", (e) => {
      if (contextMenu && e.button !== 2 && !e.target.closest("#context-menu")) { 
          contextMenu.style.display = "none";
      }
  });

  // --- Listener to hide popup on click outside ---
  document.addEventListener("click", (e) => {
      // If click is outside popup AND outside context menu (prevents closing when menu is clicked)
      if (popup && popup.style.display === 'block' && !e.target.closest("#find-popup") && !e.target.closest("#context-menu")) {
        popup.style.display = "none";
      }
  });

  // --- "Find..." logic ---
  if (findButton && popup && utrnInput && contextMenu) { 
      findButton.addEventListener("click", () => {
          const utrn = contextMenu.dataset.utrn; // Get UTRN stored on menu
          if (!utrn) {
              console.warn("Find clicked, but no UTRN found in menu dataset.");
              return; 
          }

          utrnInput.value = utrn; // Set UTRN in the popup input
          popup.style.display = "block"; // Show the popup (CSS handles centering)
          contextMenu.style.display = "none"; // Hide context menu after clicking Find
      });
  } else {
       console.warn("Find button, popup, input, or context menu element not found for 'Find...' listener.");
  }

  // --- Listeners for popup close buttons ---
  if (popup) { // Ensure popup exists before adding listeners
      if (closeBtn1) {
          closeBtn1.addEventListener('click', () => { 
              popup.style.display = 'none'; 
              console.log("Popup closed via X1");
          });
      } else { console.warn("Close button #popup-close-x1 not found."); }

      if (closeBtn2) {
          closeBtn2.addEventListener('click', () => { 
              popup.style.display = 'none'; 
              console.log("Popup closed via X2");
          });
      } else { console.warn("Close button #popup-close-x2 not found."); }

      if (closeBtnTick) {
          closeBtnTick.addEventListener('click', () => { 
              popup.style.display = 'none'; 
              console.log("Popup closed via Tick");
          });
      } else { console.warn("Close button #popup-close-tick not found."); }
  } else {
       console.warn("Popup element #find-popup not found, cannot add close listeners.");
  }
  // --- End of new close button listeners ---

}); // End DOMContentLoaded