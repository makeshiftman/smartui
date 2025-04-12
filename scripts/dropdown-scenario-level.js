console.log("✅ Active version: dropdown-scenario-level.js (Updated 12 April 22:53)");

// --- Handles version and scenario dropdowns on openingpage.html only ---

document.addEventListener("DOMContentLoaded", () => {
  const scenarioDropdown = document.getElementById("scenarioDropdown");
  const versionDropdown = document.getElementById("versionDropdown");

  if (scenarioDropdown) {
    scenarioDropdown.querySelectorAll(".dropdown-options div").forEach(option => {
      option.addEventListener("click", () => {
        const selectedScenario = option.getAttribute("data-value");
        const selectedText = option.textContent;
        scenarioDropdown.querySelector(".selected-option").textContent = selectedText;
        localStorage.setItem("smartui_scenario", selectedScenario);
      });
    });
  }

  if (versionDropdown) {
    versionDropdown.querySelectorAll(".dropdown-options div").forEach(option => {
      option.addEventListener("click", () => {
        const selectedVersion = option.getAttribute("data-value");
        const selectedText = option.textContent;
        versionDropdown.querySelector(".selected-option").textContent = selectedText;
        localStorage.setItem("smartui_version", selectedVersion);
      });
    });
  }
});