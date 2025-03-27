// smartui-loader.js
// ✅ Shared loader script for all SmartUI pages

// Load SmartUI input fields fragment (core fields on left side)
fetch("../fragments/core-input-fields.html")
  .then(res => res.text())
  .then(html => {
    const wrapper = document.getElementById("wrapper");
    if (wrapper) {
      wrapper.insertAdjacentHTML("afterbegin", html);
    }
  })
  .then(() => {
    // ✅ Load JSON from scenario param (or fallback)
    const urlParams = new URLSearchParams(window.location.search);
    let scenario = urlParams.get("scenario");

    // ✅ Use default if no scenario given
    if (!scenario) {
      scenario = "/smartui/scenarios/default.json";
    }

    loadScenario(scenario);
  });

// ✅ Function to fetch JSON and populate fields
async function loadScenario(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Failed to load JSON");

    const data = await response.json();
    localStorage.setItem("smartui_data", JSON.stringify(data));

    // ✅ Field mapping
    const fields = [
      "contract_Account", "contract", "contract_Start", "operating_Mode", "payment_Plan",
      "read_Retrieval", "last_Comm", "pod", "device_Guid", "meter_Serial",
      "device_Start", "device_End", "device_Status", "elecOrGas", "BPID"
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

    // ✅ Full name
    const fullNameEl = document.getElementById("full_Name");
    if (fullNameEl && data.first_Name && data.last_Name) {
      fullNameEl.value = `${data.first_Name} ${data.last_Name}`;
    }

    // ✅ Full address
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
  } catch (error) {
    console.error("Error loading JSON:", error);
  }
}
