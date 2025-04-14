// Filename: /smartui/scripts/utrn-generate-handler.js
// Handles UTRN generation, localStorage update, UI field population, and delayed status update.

console.log("✅ Active version: [filename].js (Updated 14 April 09:58)");

document.addEventListener("DOMContentLoaded", () => {
  console.log("utrn-generate-handler.js: DOM Loaded.");

  // --- Element References ---
  // *** Ensure button with this ID exists in your HTML ***
  const executeBtn = document.getElementById("utrnGenerateExecute"); 
  const amountInput = document.getElementById("utrn_Generate_Amount");
  // *** Ensure dropdown with this ID exists and uses .selected-option structure ***
  const reasonDropdown = document.getElementById("UTRN_Generate_Reason"); 
  const reasonSelectedOption = reasonDropdown ? reasonDropdown.querySelector(".selected-option") : null;

  // Output fields
  const resultField = document.getElementById("utrn_generated_result");
  const valueField = document.getElementById("utrn_generated_value");
  const channelField = document.getElementById("utrn_generated_channel");
  const statusField = document.getElementById("utrn_generated_status");

  // --- Helper Functions ---
  function generate20DigitNumber() {
      let number = "";
      for (let i = 0; i < 20; i++) {
      number += Math.floor(Math.random() * 10);
      }
      return number;
  }

  function getCurrentTimeFormatted() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      // You could add seconds: const ss = String(now.getSeconds()).padStart(2, "0"); return `${hh}:${mm}:${ss}`;
      return `${hh}:${mm}`;
  }

  // --- Main Event Listener ---
  if (executeBtn && amountInput && reasonSelectedOption) { // Check reasonSelectedOption div
      executeBtn.addEventListener("click", (e) => {
          e.preventDefault(); // Good practice if button is link/submit type
          console.log("UTRN Generate Execute button clicked.");

          // --- Validation ---
          const valueRaw = parseFloat(amountInput.value);
          // Read selected reason text (or use dataset.value if preferred and available)
          const selectedReason = reasonSelectedOption.textContent.trim(); 
          const selectedReasonValue = reasonSelectedOption.dataset.value; // If dropdown handler sets this

          console.log(`Amount: ${amountInput.value}, Reason Text: ${selectedReason}, Reason Value: ${selectedReasonValue}`);

          if (isNaN(valueRaw) || valueRaw < 1 || valueRaw > 500) {
              alert("Please enter a valid amount between 1 and 500.");
              return;
          }
          // Check if reason is not empty or just the initial placeholder (&nbsp;)
          if (!selectedReason || selectedReason === "" || selectedReason === "&nbsp;") { 
               alert("Please select a reason for UTRN generation.");
               return;
          }
          // Optional: Check selectedReasonValue if using data-value and have invalid options
          // if (!selectedReasonValue || selectedReasonValue === 'BLANK') { ... }


          // --- Create UTRN Object ---
          const formattedValue = valueRaw.toFixed(2);const formattedValue = valueRaw.toFixed(2);
          const createdTime = getCurrentTimeFormatted();
          const generatedUtrn = generate20DigitNumber(); // Store generated UTRN
          
          // ✅ Add today's date in DD.MM.YYYY format for display filtering
          const now = new Date();
          const date = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;
          
          // ✅ Build UTRN object
          const newUTRN = {
            createdOffset: 0,
            date: date,
            appliedOffset: null,
            value: formattedValue,
            type: "Manual",
            utrn: generatedUtrn,
            channel: "SMART_UI - Non Payme",
            status: "UTRN generated",
            auth: null,
            createdTime: createdTime,
            appliedTime: null,
            reason: selectedReason // 🔁 Retain dropdown value for future use
          };
          // --- Update localStorage (Initial Add) ---
const scenarioRaw = localStorage.getItem("smartui_data");
let scenarioData = scenarioRaw ? JSON.parse(scenarioRaw) : {}; // Handle parsing errors below?
if (!scenarioData) scenarioData = {}; // Ensure scenarioData is an object
if (!Array.isArray(scenarioData.utrnRows)) {
    scenarioData.utrnRows = []; // Initialize array if it doesn't exist
}

scenarioData.utrnRows.push(newUTRN); // Add the new record

try {
    localStorage.setItem("smartui_data", JSON.stringify(scenarioData));
    console.log("✅ UTRN generated and stored:", newUTRN);
} catch (storageError) {
    console.error("Error saving initial UTRN to localStorage:", storageError);
    alert("Error saving generated UTRN data.");
    return; // Stop if initial save fails
}
              appliedOffset: null,
              value: formattedValue,
              type: "Manual",
              utrn: generatedUtrn, // Use stored variable
              channel: "SMART_UI - Non Payme", // Consistent capitalization
              status: "UTRN generated",
              auth: null,
              createdTime: createdTime,
              appliedTime: null,
              reason: selectedReason // Store the reason text (or use selectedReasonValue)
          };

          // --- Update localStorage (Initial Add) ---
          const scenarioRaw = localStorage.getItem("smartui_data");
          let scenarioData = scenarioRaw ? JSON.parse(scenarioRaw) : {}; // Handle parsing errors below?
          if (!scenarioData) scenarioData = {}; // Ensure scenarioData is an object
          if (!Array.isArray(scenarioData.utrnRows)) {
              scenarioData.utrnRows = []; // Initialize array if it doesn't exist
          }

          scenarioData.utrnRows.push(newUTRN); // Add the new record

          try {
               localStorage.setItem("smartui_data", JSON.stringify(scenarioData));
               console.log("✅ UTRN generated and stored:", newUTRN);
          } catch (storageError) {
              console.error("Error saving initial UTRN to localStorage:", storageError);
              alert("Error saving generated UTRN data.");
              return; // Stop if initial save fails
          }


          // --- Fill Result Fields ---
          if (resultField) resultField.value = newUTRN.utrn;
          if (valueField) valueField.value = newUTRN.value;
          if (channelField) channelField.value = newUTRN.channel;
          if (statusField) statusField.value = newUTRN.status;
          console.log("Populated result fields.");


          // --- Schedule Delayed UTRN Application Update ---
          const delay = Math.floor(Math.random() * (97 - 20 + 1) + 20) * 1000; // 20 to 97 seconds
          console.log(`Scheduling UTRN apply status update in ${delay / 1000} seconds for UTRN: ${newUTRN.utrn}`);

          setTimeout(() => {
              console.log(`Attempting to apply UTRN: ${newUTRN.utrn} after delay.`);
              
              // *** CORRECTED LocalStorage Update Logic ***
              const currentScenarioRaw = localStorage.getItem("smartui_data");
              if (!currentScenarioRaw) {
                  console.error("Could not apply UTRN: smartui_data missing from localStorage.");
                  return;
              }
              try {
                  const currentScenarioData = JSON.parse(currentScenarioRaw);
                  if (!currentScenarioData || !Array.isArray(currentScenarioData.utrnRows)) {
                      console.error("Could not apply UTRN: utrnRows missing or invalid in localStorage.");
                      return;
                  }
                  
                  // Find the specific UTRN entry using the unique UTRN number
                  const indexToUpdate = currentScenarioData.utrnRows.findIndex(row => row.utrn === newUTRN.utrn);

                  if (indexToUpdate !== -1) {
                      // UTRN found, update its properties *within the loaded data*
                      const applyTime = new Date();
                      const applyTimeStr = `${String(applyTime.getHours()).padStart(2, "0")}:${String(applyTime.getMinutes()).padStart(2, "0")}`;
                      
                      currentScenarioData.utrnRows[indexToUpdate].appliedOffset = 0; // Applied 'today' relative to when this runs
                      currentScenarioData.utrnRows[indexToUpdate].appliedTime = applyTimeStr;
                      currentScenarioData.utrnRows[indexToUpdate].status = "UTRN applied"; // Changed status

                      // Save the *entire modified* data structure back to localStorage
                      localStorage.setItem("smartui_data", JSON.stringify(currentScenarioData));
                      console.log(`UTRN applied and localStorage updated successfully for: ${newUTRN.utrn}`);

                      // Note: This does NOT automatically update the UTRN table UI on the *other* page.
                      // That page would need to be refreshed or have logic to re-read localStorage.

                  } else {
                      // This might happen if the item was deleted or changed between generation and update
                      console.error(`Could not apply UTRN: UTRN number ${newUTRN.utrn} not found in localStorage data (was it modified externally?).`);
                  }
              } catch (e) {
                  console.error("Error parsing or updating localStorage during delayed apply:", e);
              }
              // *** End of corrected update logic ***

          }, delay);

      }); // End button click listener
  } else {
      console.warn("UTRN Generate Execute button, amount input, or reason dropdown not found.");
  }
}); // End DOMContentLoaded listener