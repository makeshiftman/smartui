// Last updated: 2024-04-18
console.log('Walkthrough dropdown handler loaded at:', new Date().toISOString());

console.log("✅ Active version: dropdown-scenario-level.js (Updated 18 April 17:29)");

setTimeout(() => {
  const scenarioDropdown = document.getElementById("scenario_Selector");
  const walkthroughDropdown = document.getElementById("Smart_Menu_Bar");

  function closeAllDropdowns() {
    document.querySelectorAll(".dropdown-options").forEach(drop => {
      drop.style.display = "none";
    });
  }

  // WALKTHROUGH DROPDOWN
  if (walkthroughDropdown) {
    const walkthroughSelected = walkthroughDropdown.querySelector(".selected-option");
    const walkthroughOptions = walkthroughDropdown.querySelector(".dropdown-options");

    if (walkthroughSelected && walkthroughOptions) {
      // Add Standard option
      const standardDiv = document.createElement("div");
      standardDiv.textContent = "Standard";
      standardDiv.dataset.value = "standard";
      walkthroughOptions.insertBefore(standardDiv, walkthroughOptions.firstChild);

      walkthroughSelected.addEventListener("click", () => {
        const isOpen = walkthroughOptions.style.display === "block";
        closeAllDropdowns();
        walkthroughOptions.style.display = isOpen ? "none" : "block";
      });

      walkthroughOptions.addEventListener("click", (e) => {
        const opt = e.target.closest("div");
        if (!opt?.dataset.value) return;

        const selectedType = opt.dataset.value.toLowerCase();
        walkthroughSelected.textContent = opt.textContent;

        const currentScenario = new URLSearchParams(window.location.search).get("scenario");
        let basePath;
        
        if (selectedType === "standard") {
          basePath = "../html/openingpage.html";
        } else {
          basePath = `../${selectedType}/openingpage.html`;
        }

        window.location.href = `${basePath}?scenario=${currentScenario || ""}`;
      });
    }
  }

  // SCENARIO DROPDOWN
  if (scenarioDropdown) {
    const scenarioSelected = scenarioDropdown.querySelector(".selected-option");
    const scenarioOptions = scenarioDropdown.querySelector(".dropdown-options");

    if (scenarioSelected && scenarioOptions) {
      fetch("../scenarios/scenario-list.json")
        .then(res => res.json())
        .then(scenarios => {
          scenarios.forEach(s => {
            const div = document.createElement("div");
            div.textContent = s.name;
            div.dataset.value = s.file;
            scenarioOptions.appendChild(div);
          });

          const current = new URLSearchParams(window.location.search).get("scenario");
          scenarioSelected.textContent = "Contract Account";
        });

      scenarioSelected.addEventListener("click", () => {
        const isOpen = scenarioOptions.style.display === "block";
        closeAllDropdowns();
        scenarioOptions.style.display = isOpen ? "none" : "block";
      });

      scenarioOptions.addEventListener("click", (e) => {
        const opt = e.target.closest("div");
        if (opt?.dataset.value) {
          const selectedScenario = opt.dataset.value;
          const currentPath = window.location.pathname;
          window.location.href = `${currentPath}?scenario=${selectedScenario}`;
        }
      });
    }
  }

  // CLOSE all dropdowns if clicked outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-dropdown")) {
      closeAllDropdowns();
    }
  });
}, 300);
