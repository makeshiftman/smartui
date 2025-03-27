
window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  let scenario = urlParams.get("scenario");
  let data;

  if (scenario) {
    try {
      const response = await fetch(scenario);
      data = await response.json();
      localStorage.setItem("smartui_data", JSON.stringify(data));
      console.log("✅ Scenario loaded and saved to localStorage:", scenario);
    } catch (err) {
      console.error("❌ Error fetching scenario:", err);
      return;
    }
  } else {
    const stored = localStorage.getItem("smartui_data");
    if (!stored) {
      console.warn("⚠️ No scenario in URL and no saved data in localStorage.");
      return;
    }
    data = JSON.parse(stored);
    console.log("✅ Loaded data from localStorage.");
  }

  // ✅ Populate standard SmartUI fields
  const fields = [
    'contract_Account', 'contract',
    'contract_Start', 'operating_Mode', 'payment_Plan', 'read_Retrieval',
    'last_Comm', 'pod', 'device_Guid', 'meter_Serial', 'device_Start',
    'device_End', 'device_Status', 'elecOrGas', 'BPID'
  ];

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el && data[id] !== undefined) {
      el.value = data[id];
    }

    // ✅ Handle duplicate fields
    const duplicates = document.querySelectorAll(`[data-field="${id}"]`);
    duplicates.forEach(dup => {
      dup.value = data[id];
    });
  });

  // ✅ Populate full name
  const fullNameEl = document.getElementById('full_Name');
  if (fullNameEl && data.first_Name && data.last_Name) {
    fullNameEl.value = `${data.first_Name} ${data.last_Name}`;
  }

  // ✅ Compose and populate full address
  const addressEl = document.getElementById('full_address');
  if (addressEl) {
    const parts = [];

    if (data.flatnumber) {
      parts.push(`FLAT ${data.flatnumber.toString().toUpperCase()}`);
    }

    if (data.housenumber && data.street) {
      parts.push(\`\${data.housenumber.toString().toUpperCase()} \${data.street.toUpperCase()}\`);
    } else if (data.housenumber) {
      parts.push(data.housenumber.toString().toUpperCase());
    } else if (data.street) {
      parts.push(data.street.toUpperCase());
    }

    if (data.city) {
      parts.push(data.city.toUpperCase());
    }

    if (data.postcode) {
      parts.push(data.postcode.toUpperCase());
    }

    addressEl.value = parts.join(', ');
  }

  // ✅ Optional hook: let the page add custom logic
  if (typeof smartuiOnLoadExtra === "function") {
    smartuiOnLoadExtra(data);
  }
};
