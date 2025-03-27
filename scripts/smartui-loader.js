
window.addEventListener("DOMContentLoaded", () => {
  fetch("/smartui/fragments/core-input-fields.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("wrapper").insertAdjacentHTML("beforeend", html);
    })
    .then(() => {
      const urlParams = new URLSearchParams(window.location.search);
      let scenario = urlParams.get("scenario");
      let data = null;

      if (scenario) {
        fetch(scenario)
          .then(res => res.json())
          .then(json => {
            data = json;
            localStorage.setItem("smartui_data", JSON.stringify(data));
            populateFields(data);
          })
          .catch(err => console.error("Failed to fetch scenario:", err));
      } else {
        const stored = localStorage.getItem("smartui_data");
        if (stored) {
          data = JSON.parse(stored);
          populateFields(data);
        }
      }
    });

  function populateFields(data) {
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
      if (data.flatnumber) parts.push(`FLAT ${data.flatnumber.toUpperCase()}`);
      if (data.housenumber && data.street) {
        parts.push(`${data.housenumber.toUpperCase()} ${data.street.toUpperCase()}`);
      } else if (data.housenumber) {
        parts.push(data.housenumber.toUpperCase());
      } else if (data.street) {
        parts.push(data.street.toUpperCase());
      }
      if (data.city) parts.push(data.city.toUpperCase());
      if (data.postcode) parts.push(data.postcode.toUpperCase());

      addressEl.value = parts.join(', ');
    }
  }
});
