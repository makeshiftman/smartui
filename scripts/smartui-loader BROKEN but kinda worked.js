// smartui-loader.js

const level = document.body.dataset.level || "standard";
// Corrected fragment path logic assuming server root is parent of 'smartui'
// If server root IS 'smartui', this should be '/fragments/...'
const fragmentPath = `/smartui/fragments/core-input-fields-${level}.html`;

// Load SmartUI input fields fragment (core fields on left side)
fetch(fragmentPath)
  .then(res => {
    if (!res.ok) throw new Error(`Failed to fetch fragment ${fragmentPath}. Status: ${res.status}`);
    return res.text();
  })
  .then(html => {
    const wrapper = document.getElementById("wrapper");
    if (!wrapper) throw new Error("No #wrapper element found in the page");
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
        console.log("Tippy initialized.");
      } else {
        // Wait and retry if tippy library hasn't loaded yet
        setTimeout(initTippyWhenReady, 50);
      }
    }
    initTippyWhenReady(); // Call the function to initialize Tippy
  })
 // ***** START: Insert this new block *****
.then(() => {
  // Determine scenario path and decide if reloading from file is necessary
  const urlParams = new URLSearchParams(window.location.search);
  let requestedScenario = urlParams.get("scenario"); 
  let scenarioPath;
  let loadFreshData = false; // Flag to indicate if we overwrite localStorage

  const currentStoredPath = localStorage.getItem("smartui_scenarioPath");
  const currentDataExists = localStorage.getItem("smartui_data") !== null;

  if (requestedScenario) {
    // Scenario requested via URL
    scenarioPath = requestedScenario.includes('/') ? requestedScenario : `/smartui/scenarios/${requestedScenario}`;
    // Load fresh if requested path is different OR if no data currently exists
    if (scenarioPath !== currentStoredPath || !currentDataExists) {
        console.log(`New scenario (${scenarioPath}) requested via URL or existing data missing. Loading fresh.`);
        localStorage.setItem("smartui_scenarioPath", scenarioPath); 
        loadFreshData = true; 
    } else {
         console.log(`Scenario (${scenarioPath}) requested via URL matches stored. Using persisted localStorage data.`);
         loadFreshData = false; 
    }
  } else {
    // No scenario requested via URL
    scenarioPath = currentStoredPath || "/smartui/scenarios/default.json"; 
    // Only load fresh if data doesn't exist in localStorage for this path
    if (!currentDataExists) {
         console.log(`No scenario in URL and no data in localStorage. Loading default/stored path: ${scenarioPath}`);
         loadFreshData = true;
    } else {
        console.log(`No scenario in URL. Using existing data from localStorage associated with path: ${scenarioPath}`);
        loadFreshData = false;
    }
  }

  // Execute loadScenario ONLY if we need to load fresh data from the file
  if (loadFreshData) {
      console.log("Executing loadScenario to fetch and store:", scenarioPath);
      loadScenario(scenarioPath); // This fetches, processes, and overwrites localStorage['smartui_data']
  } else {
      console.log("Using persisted data from localStorage. Dependent scripts should handle display.");
      // Ensure scripts on pages like Historic UTRN that need data on load can still run
      // The initial filter call in utrn-table-loader.js should handle this.
       if (typeof filterAndDisplayUtrns === 'function') { 
           console.log("(smartui-loader) Attempting to trigger initial UTRN filter using existing localStorage data...");
           setTimeout(() => { 
               if (typeof filterAndDisplayUtrns === 'function') { filterAndDisplayUtrns(); }
           }, 50); // Tiny delay for safety
       }
       // Add similar triggers for other pages if needed
  }
})

  .catch(err => {
    console.error("SmartUI Load Error:", err);
    // Display error message gracefully without wiping entire body if possible
    const wrapper = document.getElementById("wrapper") || document.body;
    wrapper.innerHTML = `<pre style='color:red; padding: 2em;'>Error loading page components: ${err.message}</pre>`;
  });

// Function to fetch JSON and populate fields
async function loadScenario(path) {
  try {
    // Fetch the scenario JSON data
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load scenario JSON from ${path}. Status: ${response.status}`);

    const data = await response.json();
    console.log("Scenario data loaded:", data);

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

    // --- Populate Standard Fields ---
    // List of field IDs to populate
    const fields = [
      "contract_Account", "contract", "contract_Start", "operating_Mode", "payment_Plan",
      "read_Retrieval", "last_Comm", "pod", "device_Guid", "meter_Serial",
      "device_Start", "device_End", "device_Status", "elecOrGas", "BPID",
      "firmware_Version", "SMSO_ID", "device_Location", "smets1_DCC", "contract_End"
    ];

    // Iterate through fields and populate corresponding elements
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) { // Check if element exists
        let valueToSet = undefined;

        // *** Special handling for offset-based date fields ***
        if (id === 'contract_Start' && data.contract_Start_Offset !== undefined) {
            valueToSet = calculateAndFormatDate(data.contract_Start_Offset);
            console.log(`Calculated contract_Start (${data.contract_Start_Offset}) as: ${valueToSet}`);
        } else if (id === 'last_Comm' && data.last_Comm_Offset !== undefined) {
            valueToSet = calculateAndFormatDate(data.last_Comm_Offset);
            console.log(`Calculated last_Comm (${data.last_Comm_Offset}) as: ${valueToSet}`);
        }
        // *** Handle fields where data key matches ID directly (including fixed dates) ***
        else if (data[id] !== undefined) {
            valueToSet = data[id];
        }

        // If a value was determined, set the element's value
        if (valueToSet !== undefined) {
          el.value = valueToSet;

          // Also update any duplicate fields marked with data-field attribute
          const duplicates = document.querySelectorAll(`[data-field="${id}"]`);
          duplicates.forEach(dup => {
            dup.value = valueToSet;
          });
        } else {
            // Optional: Log if data for a field ID wasn't found in expected keys
            // console.log(`Data not found for field ID: ${id} (checked ${id}, ${id}_Offset)`);
        }
      } else {
          // Optional: Log if an expected HTML element wasn't found
          // console.warn(`HTML element with ID '${id}' not found.`);
      }
    });

    // --- Populate Composite Fields ---
    // Populate full name
    const fullNameEl = document.getElementById("full_Name");
    if (fullNameEl && data.first_Name && data.last_Name) {
      fullNameEl.value = `${data.first_Name} ${data.last_Name}`;
    }

    // Populate full address
    const addressEl = document.getElementById("full_address");
    if (addressEl) {
      const parts = [];
      // Build address string carefully, handling potential missing parts
      if (data.flatnumber) parts.push(`FLAT ${String(data.flatnumber).toUpperCase()}`);
      if (data.housenumber || data.street) {
          const house = data.housenumber ? String(data.housenumber).toUpperCase() : '';
          const street = data.street ? String(data.street).toUpperCase() : '';
          parts.push(`${house} ${street}`.trim());
      }
      if (data.city) parts.push(String(data.city).toUpperCase());
      if (data.postcode) parts.push(String(data.postcode).toUpperCase());
      addressEl.value = parts.join(", ");
    }

    // --- Populate UTRN Table (If data exists) ---
    //if (data.utrnRows && typeof populateUTRNTable === 'function') { // Check if function exists too
    //  populateUTRNTable(data.utrnRows);
    //} else if (data.utrnRows) {
     //   console.warn("UTRN data found (utrnRows) but populateUTRNTable function is not defined.");
   // }

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
          // --- Process utrnRows array ---
    if (Array.isArray(data.utrnRows)) {
      const todayForUTRN = new Date();
      data.utrnRows = data.utrnRows.map(entry => {
        if (typeof entry.createdOffset === 'number') {
          const d = new Date(todayForUTRN);
          d.setDate(todayForUTRN.getDate() + entry.createdOffset);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          return { ...entry, date: `${dd}.${mm}.${yyyy}` };
        } else {
          console.warn("Invalid or missing createdOffset:", entry);
          return { ...entry, date: "Invalid Date" };
        }
      });
      console.log("Updated utrnRows with .date:", data.utrnRows);
    }
    
      console.log("Updated storedMeterReads:", data.storedMeterReads); // Log the processed array
    } else {
        // If storedMeterReads is missing or not an array, ensure it's an empty array in the data object
        data.storedMeterReads = [];
        console.log("No valid storedMeterReads array found in scenario data.");
    }

    // --- Save Processed Data to localStorage ---
    localStorage.setItem("smartui_data", JSON.stringify(data));
    console.log("Data successfully saved to localStorage.");

  } catch (error) {
    console.error("Error in loadScenario function:", error);
    // Display error message gracefully
    const wrapper = document.getElementById("wrapper") || document.body;
    wrapper.innerHTML = `<pre style='color:red; padding: 2em;'>Error loading scenario: ${error.message}</pre>`;
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
              // Remove selected class from all sibling rows within the same container
              row.parentNode.querySelectorAll(".utrn-row").forEach(r => r.classList.remove("selected"));
              // Add selected class to the clicked row
              row.classList.add("selected");
          }
      });
  }
});
