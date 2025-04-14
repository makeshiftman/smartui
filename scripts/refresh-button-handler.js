document.addEventListener("DOMContentLoaded", () => {
    const refreshButton = document.getElementById("utrnGenerateRefresh");
    const executeButton = document.getElementById("utrnGenerateExecute");
    const statusField = document.getElementById("utrn_generated_status");
    const resultField = document.getElementById("utrn_generated_result");
    
    // Initially, refresh button uses deselected image
    if (refreshButton) {
      // Disable the refresh button initially
      refreshButton.style.pointerEvents = "none";
      refreshButton.querySelector("img").src = "../images/buttons/refreshdeselected.png";
      
      // Set up the refresh button click handler
      refreshButton.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Get the UTRN from the result field
        const utrn = resultField ? resultField.value : null;
        
        if (!utrn) {
          console.warn("No UTRN found to refresh status");
          return;
        }
        
        // Check localStorage for current status
        try {
          const data = JSON.parse(localStorage.getItem("smartui_data"));
          if (data && Array.isArray(data.utrnRows)) {
            const utrnEntry = data.utrnRows.find(row => row.utrn === utrn);
            
            if (utrnEntry) {
              // Update the status field with current status
              if (statusField) {
                statusField.value = utrnEntry.status;
                console.log(`Refreshed status for UTRN ${utrn}: ${utrnEntry.status}`);
              }
            } else {
              console.warn(`UTRN ${utrn} not found in localStorage`);
            }
          }
        } catch (err) {
          console.error("Error refreshing UTRN status:", err);
        }
      });
    }
    
    // Override the executeButton click handler to enable the refresh button
    if (executeButton) {
      // Store the original click handler
      const originalClickHandler = executeButton.onclick;
      
      // Add our handler that will run after generation
      executeButton.addEventListener("click", () => {
        // Short timeout to let the original handler complete
        setTimeout(() => {
          if (refreshButton && resultField && resultField.value) {
            // Enable the refresh button
            refreshButton.style.pointerEvents = "auto";
            // Update the image to grey (normal state)
            refreshButton.querySelector("img").src = "../images/buttons/refreshgrey.png";
            refreshButton.querySelector("img").onmouseover = function() {
              this.src = "../images/buttons/refreshblue.png";
            };
            refreshButton.querySelector("img").onmouseout = function() {
              this.src = "../images/buttons/refreshgrey.png";
            };
          }
        }, 100);
      });
    }
  });