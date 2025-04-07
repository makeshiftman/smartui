
// smartui-loader.js

const level = document.body.dataset.level || "standard";
const fragmentPath = `/smartui/fragments/core-input-fields-${level}.html`;

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

    function initTippyWhenReady() {
      if (typeof tippy !== 'undefined') {
        tippy('[data-tippy-content]', {
          placement: 'right',
          theme: 'light-border',
          delay: [100, 0],
          allowHTML: true
        });
      } else {
        setTimeout(initTippyWhenReady, 50);
      }
    }

    initTippyWhenReady();
  })
  .then(() => {
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
    document.body.innerHTML = `<pre style='color:red; padding: 2em;'>Error loading page: ${err.message}</pre>`;
  });

// ✅ Function to fetch JSON and populate fields
async function loadScenario(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Failed to load JSON");

    const data = await response.json();

    if (!data.contract_End || data.contract_End.trim() === "") {
      data.contract_End = "31.12.9999";
    }

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

    const fullNameEl = document.getElementById("full_Name");
    if (fullNameEl && data.first_Name && data.last_Name) {
      fullNameEl.value = `${data.first_Name} ${data.last_Name}`;
    }

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

    if (data.utrnRows) {
      populateUTRNTable(data.utrnRows);
    }

    if (Array.isArray(data.storedMeterReads)) {
      const today = new Date();
      data.storedMeterReads = data.storedMeterReads.map(entry => {
        const d = new Date(today);
        d.setDate(d.getDate() + entry.offset);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return { ...entry, date: `${dd}.${mm}.${yyyy}` };
      });
    }

    localStorage.setItem("smartui_data", JSON.stringify(data));

  } catch (error) {
    console.error("Error loading JSON:", error);
    document.body.innerHTML = `<pre style='color:red; padding: 2em;'>Error loading scenario: ${error.message}</pre>`;
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
