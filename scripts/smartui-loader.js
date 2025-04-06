// smartui-loader.js

// ⬇️ Detect medal level from body attribute or fallback to "standard"

const level = document.body.dataset.level;
const fragmentPath = level
  ? `/smartui/fragments/core-input-fields-${level}.html`
  : `/smartui/fragments/core-input-fields.html`;

// Load SmartUI input fields fragment (core fields on left side)
fetch(fragmentPath)
  .then(res => {
    if (!res.ok) throw new Error(`Failed to fetch ${fragmentPath}`);
    return res.text();
  })
  .then(html => {
    const wrapper = document.getElementById("wrapper");
    if (!wrapper) throw new Error("No #wrapper element found in the page");
    wrapper.insertAdjacentHTML("afterbegin", html);
    // ✅ Activate Tippy tooltips after fields are injected

/* tippy('[data-tippy-content]', {
  placement: 'right',
  theme: 'light-border',
  delay: [100, 0],
  allowHTML: true
}); */

function initTippyWhenReady() {
  if (typeof tippy !== 'undefined') {
    tippy('[data-tippy-content]', {
      placement: 'right',
      theme: 'light-border',
      delay: [100, 0],
      allowHTML: true
    });
  } else {
    setTimeout(initTippyWhenReady, 50); // Retry until tippy is defined
  }
}

initTippyWhenReady();
    
  })
  .then(() => {
    // ✅ Load JSON from scenario param (or fallback)
    const urlParams = new URLSearchParams(window.location.search);
    let scenario = urlParams.get("scenario");

    if (scenario) {
      localStorage.setItem("smartui_scenarioPath", scenario);
    } else {
      scenario = localStorage.getItem("smartui_scenarioPath") || "/smartui/scenarios/default.json";
    }

    loadScenario(scenario);
  })
  .catch(err => {
    console.error("SmartUI Load Error:", err);
    document.body.innerHTML = "<pre style='color:red; padding: 2em;'>Error loading page: " + err.message + "</pre>";
  });

// ✅ Function to fetch JSON and populate fields
async function loadScenario(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Failed to load JSON");

    const data = await response.json();
    localStorage.setItem("smartui_data", JSON.stringify(data));

// ⬇️ Set default for contract_End if not provided
if (!data.contract_End || data.contract_End.trim() === "") {
  data.contract_End = "31.12.9999";
}
    // 🔁 Convert offset-based fields to actual dates
    function offsetToDate(offset, time = "00:00") {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const [h, m] = time.split(":");
      d.setHours(+h, +m, 0, 0);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
    }

    if (data.contract_Start_Offset !== undefined) {
      /* data.contract_Start = offsetToDate(data.contract_Start_Offset); */
      data.contract_Start = offsetToDate(data.contract_Start_Offset).split(" ")[0];
    }

    /* if (data.last_Comm_Offset !== undefined) {
      data.last_Comm = offsetToDate(data.last_Comm_Offset);
    } */

      if (data.last_Comm_Offset !== undefined) {
        const [yyyy, mm, dd] = offsetToDate(data.last_Comm_Offset).split(" ")[0].split(".");
        data.last_Comm = `${dd}.${mm}.${yyyy}`;
      }

    if (data.utrnRows) {
      data.utrnRows.forEach(row => {
        if (row.createdOffset !== undefined) {
          row.created = offsetToDate(row.createdOffset, row.createdTime || "12:00");
        }
        if (row.appliedOffset !== undefined) {
          row.applied = offsetToDate(row.appliedOffset, row.appliedTime || "11:00");
        }
      });
    }

    // ✅ Populate known fields
   const fields = [
  "contract_Account", "contract", "contract_Start", "operating_Mode", "payment_Plan",
  "read_Retrieval", "last_Comm", "pod", "device_Guid", "meter_Serial",
  "device_Start", "device_End", "device_Status", "elecOrGas", "BPID",
  "firmware_Version", "SMSO_ID", "device_Location", "smets1_DCC", "contract_End"
];

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id] !== undefined) {
        el.value = data[id];
      }

      const duplicates = document.querySelectorAll(`[data-field="${id}"]`);
      duplicates.forEach(dup => {
        dup.value = data[id];
      });
    });

    // ✅ Full name assembly
    const fullNameEl = document.getElementById("full_Name");
    if (fullNameEl && data.first_Name && data.last_Name) {
      fullNameEl.value = `${data.first_Name} ${data.last_Name}`;
    }

    // ✅ Full address assembly
    const addressEl = document.getElementById("full_address");
    if (addressEl) {
      const parts = [];
      if (data.flatnumber) parts.push(`FLAT ${data.flatnumber.toString().toUpperCase()}`);
      if (data.housenumber && data.street) {
        parts.push(`${data.housenumber.toString().toUpperCase()} ${data.street.toUpperCase()}`);
      } else if (data.housenumber) {
        parts.push(data.housenumber.toString().toUpperCase());
      } else if (data.street) {
        parts.push(data.street.toUpperCase());
      }
      if (data.city) parts.push(data.city.toUpperCase());
      if (data.postcode) parts.push(data.postcode.toUpperCase());
      addressEl.value = parts.join(", ");
    }

    // ✅ Populate UTRN table if present
    if (data.utrnRows) {
      populateUTRNTable(data.utrnRows);
    }

  } catch (error) {
    console.error("Error loading JSON:", error);
    document.body.innerHTML = "<pre style='color:red; padding: 2em;'>Error loading scenario: " + error.message + "</pre>";
  }
}

// ✅ UTRN row click highlighting
document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".utrn-row");
  rows.forEach(row => {
    row.addEventListener("click", () => {
      rows.forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");
    });
  });
});
