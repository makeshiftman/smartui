// This provides the necessary modifications for the utrn-table-loader.js file
// You'll need to find and replace the existing 'reverseBtn' event listener code
// Look for this section in your utrn-table-loader.js file:

/* Find this code:
if (reverseBtn) { 
  reverseBtn.addEventListener('click', (e) => { 
    e.preventDefault(); 
    const selRow = document.querySelector('.utrn-row.selected'); 
    if (!selRow) { 
      alert("Select UTRN row."); 
      return; 
    } 
    const utrn = selRow.dataset.utrn, 
          stat = selRow.dataset.status, 
          appDt = selRow.dataset.appliedDateTime, 
          idx = parseInt(selRow.dataset.index, 10); 
    
    if (isNaN(idx)) { 
      alert("Cannot ID row."); 
      return; 
    } 
    const noApp = (!appDt || appDt.includes('Invalid') || appDt.includes('Calc') || appDt.trim() === ''); 
    if (stat === 'UTRN Generated' && noApp) { 
      // ... original code ...
    } else { 
      alert("Cannot reverse this transaction."); 
    } 
  }); 
} else { 
  console.warn("Reverse button not found."); 
}
*/

// REPLACE IT WITH THIS CODE:
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
    
    // Use our new helper function from smartui-loader.js
    if (window.smartUIHelpers && window.smartUIHelpers.reverseUTRN) {
      const success = window.smartUIHelpers.reverseUTRN(utrn);
      if (success) {
        alert(`UTRN ${utrn} reversed.`);
        // Refresh the table display
        if (typeof filterAndDisplayUtrns === 'function') {
          filterAndDisplayUtrns();
        }
      } else {
        alert("Cannot reverse this transaction.");
      }
    } else {
      // Fall back to old behavior if helper isn't available
      alert("Reverse function unavailable. Try refreshing the page.");
    }
  });
} else {
  console.warn("Reverse button not found.");
}

// ALSO MODIFY THE populateUTRNTable FUNCTION to set the correct status data attribute:

/* Find this section in populateUTRNTable function: 
row.dataset.utrn = entry.utrn || ''; 
row.dataset.status = entry.status || ''; 
row.dataset.appliedDateTime = appliedDisplay.trim(); 
row.dataset.index = index;
*/

// REPLACE WITH:
row.dataset.utrn = entry.utrn || '';
row.dataset.status = entry.status || '';
row.dataset.appliedDateTime = appliedDisplay.trim();
// Don't set index anymore, we'll use UTRN directly
