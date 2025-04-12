// ✅ Active version: pid-handler.js (Updated 12 April 2025, Auto-fill PID, disabled button logic)

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Active version: pid-handler.js (Updated 12 April 2025, Auto-fill PID)");

    const requestBtn = document.getElementById('requestBarcodeBtn');
    const deliveryMethodDropdown = document.getElementById('send_Barcode_Dropdown');
    const reasonDropdown = document.getElementById('replacement_Reason_PID');
    const cashPidInput = document.getElementById('cash_PID');

    const deliveryMethodSelectedOption = deliveryMethodDropdown?.querySelector('.selected-option');
    const reasonSelectedOption = reasonDropdown?.querySelector('.selected-option');

    if (!cashPidInput) {
        console.error("PID Handler: Missing input field for PID (#cash_PID).");
        return;
    }

    // ✅ Auto-populate PID on page load from scenario JSON
    const scenarioDataString = localStorage.getItem('smartui_data');
    if (scenarioDataString) {
        try {
            const scenarioData = JSON.parse(scenarioDataString);
            if (scenarioData && scenarioData.PID !== undefined) {
                cashPidInput.value = scenarioData.PID;
                console.log(`✅ Auto-filled PID from scenario: ${scenarioData.PID}`);
            } else {
                console.warn("Scenario data found, but PID is missing.");
            }
        } catch (e) {
            console.error("Error parsing smartui_data:", e);
        }
    } else {
        console.warn("No smartui_data found in localStorage.");
    }

    // 💤 Disable button action for now
    if (requestBtn) {
        requestBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("🔘 Request Barcode button clicked — function temporarily disabled.");
            // Intentionally no logic here for now
        });
    }
});