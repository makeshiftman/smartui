
// Load SmartUI input fields fragment (core fields on left side)
fetch("/smartui/fragments/core-input-fields.html")
  .then(res => {
    if (!res.ok) throw new Error("Failed to fetch core-input-fields.html");
    return res.text();
  })
  .then(html => {
    const wrapper = document.getElementById("wrapper");
    if (!wrapper) throw new Error("No #wrapper element found in the page");
    wrapper.insertAdjacentHTML("afterbegin", html);

    // ✅ Activate Tippy tooltips after fields are injected (timed after DOM update)
    requestAnimationFrame(() => {
      tippy('[data-tippy-content]', {
        placement: 'right',
        theme: 'light-border',
        delay: [100, 0],
        allowHTML: true
      });
    });
  })
  .then(() => {
    // ✅ Load JSON from scenario param (or fallback)
    const scenarioPath = getScenarioPath();
    if (scenarioPath) {
      fetchScenarioData(scenarioPath).then(data => {
        window.smartuiData = data;
        populateFields(data);
      });
    }
  });
