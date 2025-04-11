// Suggested filename: /smartui/scripts/pid-handler.js
// Handles logic for the Prepayment Payments PID page

document.addEventListener('DOMContentLoaded', () => {
    console.log("pid-handler.js: DOM loaded.");

    // Get references to elements
    const requestBtn = document.getElementById('requestBarcodeBtn'); // Button ID added in HTML
    const deliveryMethodDropdown = document.getElementById('send_Barcode_Dropdown');
    const reasonDropdown = document.getElementById('replacement_Reason_PID');
    const cashPidInput = document.getElementById('cash_PID');

    // Get the specific divs that show the selected option text AND store the data-value
    const deliveryMethodSelectedOption = deliveryMethodDropdown ? deliveryMethodDropdown.querySelector('.selected-option') : null;
    const reasonSelectedOption = reasonDropdown ? reasonDropdown.querySelector('.selected-option') : null;

    // Check if all required elements are present
    if (!requestBtn || !deliveryMethodSelectedOption || !reasonSelectedOption || !cashPidInput) {
        console.error("PID Handler Error: One or more required elements not found.");
        if (!requestBtn) console.error("- Button #requestBarcodeBtn missing or ID mismatch.");
        if (!deliveryMethodSelectedOption) console.error("- Dropdown #send_Barcode_Dropdown .selected-option missing.");
        if (!reasonSelectedOption) console.error("- Dropdown #replacement_Reason_PID .selected-option missing.");
        if (!cashPidInput) console.error("- Input field #cash_PID missing.");
        return; // Stop if elements are missing
    }

    // Add click listener to the button
    requestBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop link navigation (since it's an <a> tag)
        console.log("Request Barcode button clicked.");

        // --- 1. Validation ---
        // Get the selected values from the dataset attribute (set by dropdown-bsr-handler.js)
        // The 'dataset.value' is set when a user clicks an option in the dropdown handler script
        const deliveryValue = deliveryMethodSelectedOption.dataset.value;
        const reasonValue = reasonSelectedOption.dataset.value;

        console.log(`Selected Delivery: ${deliveryValue}, Selected Reason: ${reasonValue}`);

        // Check if both dropdowns have a valid selection (dataset.value will exist and not be empty)
        // Also check against the BLANK option value specifically if it's not allowed.
        if (!deliveryValue || !reasonValue || reasonValue === 'BLANK') {
            alert("Please select a valid option from both dropdown menus before requesting.");
            console.warn("Validation failed: Dropdown selection missing or invalid (e.g., BLANK reason).");
            return; // Stop execution
        }

        // --- 2. Get Data & PID ---
        let pidValue = null;
        const scenarioDataString = localStorage.getItem('smartui_data');

        if (!scenarioDataString) {
            console.error("PID Handler Error: 'smartui_data' not found in localStorage.");
            alert("Error: Scenario data not loaded. Please load a scenario via smartui-loader.");
            return;
        }

        try {
            const scenarioData = JSON.parse(scenarioDataString);
            // *** Verify the exact key name for PID in your JSON scenario files ***
            if (scenarioData && scenarioData.PID !== undefined) { 
                pidValue = scenarioData.PID;
                console.log("PID found in scenario data:", pidValue);
            } else {
                console.error("PID Handler Error: 'PID' key not found in scenarioData or scenarioData is missing/invalid.");
                alert("Error: PID value not found in loaded scenario data. Check scenario JSON.");
                return;
            }
        } catch (parseError) {
            console.error("PID Handler Error: Failed to parse 'smartui_data'.", parseError);
            alert("Error reading scenario data. Check console for details.");
            return;
        }

        // --- 3. Display PID ---
        // Ensure pidValue was successfully retrieved (it might be null/0 even if defined)
        if (pidValue !== null && pidValue !== undefined) {
            cashPidInput.value = pidValue;
            console.log(`Displayed PID ${pidValue} in #cash_PID input.`);
        } else {
            console.warn("PID value retrieved was null or undefined, not displaying.");
             cashPidInput.value = ""; // Clear field if PID is missing/null
        }

        // --- 4. Store Selections and PID in localStorage ---
        try {
            // Use descriptive keys for localStorage
            localStorage.setItem('pid_last_delivery_method', deliveryValue);
            localStorage.setItem('pid_last_reason', reasonValue);
            localStorage.setItem('pid_last_value', pidValue); // Store the retrieved PID

            console.log("Stored PID selections and value to localStorage:");
            console.log(` - pid_last_delivery_method: ${deliveryValue}`);
            console.log(` - pid_last_reason: ${reasonValue}`);
            console.log(` - pid_last_value: ${pidValue}`);

            // Optional: Provide user feedback
            // alert("Barcode request processed (data stored). PID: " + pidValue); 
        } catch (storageError) {
             console.error("PID Handler Error: Failed to save data to localStorage.", storageError);
             alert("Error saving selection data.");
        }

    }); // End button click listener

}); // End DOMContentLoaded listener