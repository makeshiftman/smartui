// smartui-loader.js
console.log("✅ Active version: smartui-loader.js (Updated 16 April 2025, 21:07)");

const level = document.body.dataset.level || "standard";
// Corrected fragment path logic assuming server root is parent of 'smartui'
// If server root IS 'smartui', this should be '/fragments/...'
const fragmentPath = `../fragments/core-input-fields-${level}.html`;

// Load SmartUI input fields fragment (core fields on left side)
fetch(fragmentPath)
  .then(res => {
    if (!res.ok) {
      console.error(`Failed to fetch fragment ${fragmentPath}. Status: ${res.status}`);
      throw new Error(`Failed to fetch fragment ${fragmentPath}. Status: ${res.status}`);
    }
    return res.text();
  })
  .then(html => {
    const wrapper = document.getElementById("wrapper");
    if (!wrapper) {
      console.error("Critical error: No #wrapper element found in the page. This element is required for the application to function.");
      throw new Error("No #wrapper element found in the page");
    }
    wrapper.insertAdjacentHTML("afterbegin", html);

    // Initialize Tippy tooltips after fragment is loaded
    function initTippyWhenReady() {
      if (typeof tippy !== 'undefined') {
        tippy('[data-tippy-content]', {
          placement: 'right',
          theme: 'light-border',
          delay: [100, 0],
          allowHTML: true
        });
        console.log("Tippy initialized successfully");
      } else {
        console.warn("Tippy library not loaded yet, retrying in 50ms...");
        setTimeout(initTippyWhenReady, 50);
      }
    }
    initTippyWhenReady();
  })
  .then(() => {
    // Determine scenario path and data source after fragment is loaded and Tippy setup is initiated
    const urlParams = new URLSearchParams(window.location.search);
    let scenario = urlParams.get("scenario");
    let scenarioPath;
    let existingData = null;
    let shouldLoadFreshScenario = false;

    // Try to get existing data from localStorage
    try {
      const existingDataStr = localStorage.getItem("smartui_data");
      if (existingDataStr) {
        existingData = JSON.parse(existingDataStr);
        console.log("Found existing data in localStorage");
      }
    } catch (err) {
      console.warn("Error reading existing data from localStorage:", err);
      existingData = null;
    }

    // Determine if we need to load a fresh scenario
    if (scenario) {
      // URL parameter explicitly requests a scenario - always load it fresh
      if (scenario.startsWith('/smartui/')) {
        scenarioPath = scenario.replace('/smartui/scenarios/', '../scenarios/');
      } else if (scenario.startsWith('../')) {
        scenarioPath = scenario;
      } else {
        scenarioPath = `../scenarios/${scenario}`;
      }
      const prevPath = localStorage.getItem("smartui_scenarioPath");
      
      // Note: We load fresh even if it's the same path to allow for explicit refreshing
      localStorage.setItem("smartui_scenarioPath", scenarioPath);
      shouldLoadFreshScenario = true;
      console.log(`Loading scenario requested in URL: ${scenarioPath}`);
    } else if (!existingData) {
      // No data in localStorage - need to load default scenario
      scenarioPath = localStorage.getItem("smartui_scenarioPath") || "../scenarios/default.json";
      shouldLoadFreshScenario = true;
      console.log(`No existing data, loading default scenario: ${scenarioPath}`);
    } else {
      // We have existing data and no explicit scenario request - use localStorage data
      scenarioPath = localStorage.getItem("smartui_scenarioPath") || "../scenarios/default.json";
      shouldLoadFreshScenario = false;
      console.log(`Using existing data from localStorage (scenario: ${scenarioPath})`);
    }

    if (shouldLoadFreshScenario) {
      // Load fresh data from JSON file
      loadScenarioFromFile(scenarioPath).then(data => {
        // Save the loaded data to localStorage
        localStorage.setItem("smartui_data", JSON.stringify(data));
        console.log("Fresh scenario data loaded and saved to localStorage");
        clearResetPinFields(); // Clear reset pin when scenario reloads

        
        // Populate fields with the fresh data
        populatePageFields(data);
        
        // Add the UTRN reverse helper
        setupUTRNReverseHelper();
      }).catch(err => {
        console.error("Error loading scenario from file:", err);
        // If loading fails but we have existing data, fall back to it
        if (existingData) {
          console.log("Falling back to existing data after load error");
          populatePageFields(existingData);
          setupUTRNReverseHelper();
        }
      });
    } else {
      // Use existing data from localStorage
      populatePageFields(existingData);
      
      // Add the UTRN reverse helper
      setupUTRNReverseHelper();
    }
  })
  .catch(error => {
    console.error("Error loading SmartUI components:", error);
    // Display user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border:1px solid #ff0000;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,0.1);';
    errorDiv.innerHTML = `
      <h3 style="color:#ff0000;margin:0 0 10px 0;">Error Loading SmartUI</h3>
      <p style="margin:0;">There was a problem loading the application. Please try refreshing the page.</p>
      <p style="margin:10px 0 0 0;font-size:0.9em;color:#666;">Error details: ${error.message}</p>
    `;
    document.body.appendChild(errorDiv);
  });

// Helper function to set up the UTRN reverse functionality
function setupUTRNReverseHelper() {
  window.smartUIHelpers = window.smartUIHelpers || {};
  window.smartUIHelpers.reverseUTRN = function(utrn) {
    try {
      const data = JSON.parse(localStorage.getItem("smartui_data"));
      if (!data || !Array.isArray(data.utrnRows)) {
        console.error("Cannot reverse UTRN: data or utrnRows not found");
        return false;
      }
      
      // Find by UTRN value instead of index
      const index = data.utrnRows.findIndex(row => row.utrn === utrn);
      if (index === -1) {
        console.error("Cannot reverse UTRN: UTRN not found in data");
        return false;
      }
      
      // Check if the UTRN can be reversed
      const row = data.utrnRows[index];
      if (row.status === "UTRN generated" || 
          row.status === "UTRN Generated" || 
          (!row.appliedTime && !row.appliedOffset)) {
        // Update the row
        data.utrnRows[index].status = "Reversed";
        data.utrnRows[index].appliedOffset = null;
        data.utrnRows[index].appliedTime = null;
        
        // Save back to localStorage
        localStorage.setItem("smartui_data", JSON.stringify(data));
        console.log(`UTRN ${utrn} reversed successfully.`);
        return true;
      } else {
        console.log(`Cannot reverse UTRN ${utrn}. Status: ${row.status}`);
        return false;
      }
    } catch (e) {
      console.error("Error in reverseUTRN helper:", e);
      return false;
    }
  };
}

// Clear reset pin fields and localStorage
function clearResetPinFields() {
  console.log("🧹 Clearing reset pin values");
  localStorage.removeItem("reset_Pin_PDOC");
  localStorage.removeItem("reset_Pin_Response");
  localStorage.removeItem("reset_Pin_Message");

  ["reset_Pin_PDOC", "reset_Pin_Response", "reset_Pin_Message"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// Function to fetch JSON from file and process it (without saving to localStorage)
async function loadScenarioFromFile(path) {
  try {
    // Fetch the scenario JSON data
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load scenario JSON from ${path}. Status: ${response.status}`);

    const data = await response.json();
    console.log("Scenario data loaded:", data);

    // Process the data (calculate dates, etc.) but DON'T save to localStorage here
    return processScenarioData(data);
  } catch (error) {
    console.error("Error in loadScenarioFromFile function:", error);
    throw error; // Re-throw to allow caller to handle
  }
}

// Function to process raw scenario data (separated from loading and field population)
function processScenarioData(data) {
  // --- Helper function for offset date calculation and formatting ---
  function calculateAndFormatDate(offset) {
    if (typeof offset !== 'number') {
      console.warn("Invalid offset value received:", offset);
      return ""; // Return empty string or some default for invalid offsets
    }
    try {
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + offset); // Add offset (can be negative)
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const yyyy = targetDate.getFullYear();
      return `${dd}.${mm}.${yyyy}`; // Format as DD.MM.YYYY
    } catch (dateError) {
      console.error("Error calculating date from offset:", offset, dateError);
      return ""; // Return empty on error
    }
  }

  // --- Default values ---
  // Provide a default for contract_End if missing or empty
  if (!data.contract_End || String(data.contract_End).trim() === "") {
    data.contract_End = "31.12.9999";
  }

  // --- Process storedMeterReads array ---
  // Ensure data.storedMeterReads exists and is an array before processing
  if (Array.isArray(data.storedMeterReads)) {
    const todayForReads = new Date(); // Use a consistent 'today' for all reads in this batch
    // Use .map to create a new array with the added .date field
    data.storedMeterReads = data.storedMeterReads.map(entry => {
      // Check if entry has a valid offset
      if (typeof entry.offset === 'number') {
        const d = new Date(todayForReads);
        d.setDate(todayForReads.getDate() + entry.offset);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const yyyy = d.getFullYear();
        // Return a new object spreading existing entry and adding formatted date
        return { ...entry, date: `${dd}.${mm}.${yyyy}` };
      } else {
        // If offset is missing or invalid, return entry as is (or add an error/default date)
        console.warn("Missing or invalid offset in storedMeterReads entry:", entry);
        return { ...entry, date: "Invalid Date" }; // Add default invalid date
      }
    });
    console.log("Updated storedMeterReads:", data.storedMeterReads); // Log the processed array
  } else {
    // If storedMeterReads is missing or not an array, ensure it's an empty array in the data object
    data.storedMeterReads = [];
    console.log("No valid storedMeterReads array found in scenario data.");
  }

  // --- Process utrnRows array ---
  if (Array.isArray(data.utrnRows)) {
    const todayForUTRN = new Date();
    data.utrnRows = data.utrnRows.map((entry, index) => {
      // Preserve the original index for reference
      const entryWithIndex = { ...entry, originalIndex: index };
      
      if (typeof entry.createdOffset === 'number') {
        const d = new Date(todayForUTRN);
        d.setDate(todayForUTRN.getDate() + entry.createdOffset);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return { ...entryWithIndex, date: `${dd}.${mm}.${yyyy}` };
      } else {
        console.warn("Invalid or missing createdOffset:", entry);
        return { ...entryWithIndex, date: "Invalid Date" };
      }
    });
    console.log("Updated utrnRows with .date:", data.utrnRows);
  } else {
    // If utrnRows is missing, initialize it as an empty array
    data.utrnRows = [];
  }

  return data;
}

// Function to populate page fields with data (separated from loading)
function populatePageFields(data) {
  if (!data) {
    console.error("No data provided to populatePageFields");
    return;
  }

  // Define required fields
  const fields = [
    'contract_Start',
    'last_Comm',
    'first_Name',
    'last_Name',
    'full_Name',
    'full_address'
  ];

  // Track missing fields
  const missingFields = [];

  // Iterate through fields and populate corresponding elements
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) {
      missingFields.push(id);
      return;
    }

    let valueToSet = undefined;

    // Special handling for offset-based date fields
    if (id === 'contract_Start' && data.contract_Start_Offset !== undefined) {
      valueToSet = calculateAndFormatDate(data.contract_Start_Offset);
      console.log(`Calculated contract_Start (${data.contract_Start_Offset}) as: ${valueToSet}`);
    } else if (id === 'last_Comm' && data.last_Comm_Offset !== undefined) {
      valueToSet = calculateAndFormatDate(data.last_Comm_Offset);
      console.log(`Calculated last_Comm (${data.last_Comm_Offset}) as: ${valueToSet}`);
    }
    // Handle fields where data key matches ID directly
    else if (data[id] !== undefined) {
      valueToSet = data[id];
    }

    // If a value was determined, set the element's value
    if (valueToSet !== undefined) {
      el.value = valueToSet;

      // Update any duplicate fields marked with data-field attribute
      const duplicates = document.querySelectorAll(`[data-field="${id}"]`);
      duplicates.forEach(dup => {
        dup.value = valueToSet;
      });
    }
  });

  // Log any missing fields
  if (missingFields.length > 0) {
    console.warn(`The following required fields were not found in the DOM: ${missingFields.join(', ')}`);
  }

  // Populate composite fields with error handling
  const fullNameEl = document.getElementById("full_Name");
  if (fullNameEl) {
    if (data.first_Name && data.last_Name) {
      fullNameEl.value = `${data.first_Name} ${data.last_Name}`;
    } else {
      console.warn("Missing first_Name or last_Name data for full_Name field");
    }
  }

  const addressEl = document.getElementById("full_address");
  if (addressEl) {
    if (data.address_Line_1 && data.postcode) {
      addressEl.value = `${data.address_Line_1}, ${data.postcode}`;
    } else {
      console.warn("Missing address_Line_1 or postcode data for full_address field");
    }
  }
}

// --- Optional: UTRN row click highlighting (if needed globally) ---
// Consider moving this to a specific script if only needed on certain pages
document.addEventListener("DOMContentLoaded", () => {

  // Use event delegation for potentially dynamic rows
  const tableContainer = document.querySelector(".utrn-frame"); // Adjust selector if needed
  if (tableContainer) {
    tableContainer.addEventListener("click", (event) => {
      const row = event.target.closest(".utrn-row"); // Find the clicked row
      if (row) {

        document.addEventListener("DOMContentLoaded", () => {
          const resetBtn = document.getElementById("reset-scenario");
          if (resetBtn) {
            resetBtn.addEventListener("click", () => {
              console.log("🔁 reset-scenario button clicked — clearing reset pin fields");
              clearResetPinFields();
            });
          }
        });
        // Remove selected class from all sibling rows within the same container
        row.parentNode.querySelectorAll(".utrn-row").forEach(r => r.classList.remove("selected"));
        // Add selected class to the clicked row
        row.classList.add("selected");
      }
    });
  }
});

// Add transition handling
document.body.classList.add('loading');

window.addEventListener('load', () => {
  document.body.classList.remove('loading');
  document.body.classList.add('loaded');
});

// Handle navigation
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
    document.body.classList.add('loading');
  }
});
