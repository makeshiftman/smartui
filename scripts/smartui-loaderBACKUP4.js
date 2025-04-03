
// 🚨 Load and inject the core input fields HTML fragment
fetch("/smartui/fragments/core-input-fields.html")
  .then(res => {
    if (!res.ok) throw new Error("Failed to fetch core-input-fields.html");
    return res.text();
  })
  .then(html => {
    const wrapper = document.getElementById("wrapper");
    if (!wrapper) throw new Error("No #wrapper element found in the page");
    wrapper.insertAdjacentHTML("afterbegin", html);
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
    document.body.innerHTML = "<pre style='color:red; padding: 2em;'>Error loading page: " + err.message + "</pre>";
  });


// 🧠 Load scenario JSON and populate fields
async function loadScenario(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Failed to fetch scenario JSON: " + path);
    const data = await response.json();

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
      return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
    }

    if (data.contract_Start_Offset !== undefined) {
      data.contract_Start = offsetToDate(data.contract_Start_Offset);
    }

    if (data.last_Comm_Offset !== undefined) {
      data.last_Comm = offsetToDate(data.last_Comm_Offset);
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

    localStorage.setItem("smartui_data", JSON.stringify(data));

    // Populate all matching fields on the page
    for (const key in data) {
      const el = document.getElementById(key);
      if (el) el.value = data[key];

      const duplicates = document.querySelectorAll(`[data-field="${key}"]`);
      duplicates.forEach(dup => {
        dup.value = data[key];
      });
    }

  } catch (err) {
    console.error("Scenario Load Error:", err);
    document.body.innerHTML = "<pre style='color:red; padding: 2em;'>Error loading scenario: " + err.message + "</pre>";
  }
}
