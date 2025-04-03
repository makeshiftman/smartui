
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
