
setTimeout(() => {
  const scenarioDropdown = document.getElementById("scenario_Selector");
  const walkthroughDropdown = document.getElementById("Smart_Menu_Bar");

  // Ensure both dropdowns exist before proceeding
  if (walkthroughDropdown) {
    const walkthroughSelected = walkthroughDropdown.querySelector(".selected-option");
    const walkthroughOptions = walkthroughDropdown.querySelector(".dropdown-options");

    if (walkthroughSelected && walkthroughOptions) {
      walkthroughSelected.addEventListener("click", () => {
        walkthroughOptions.style.display = "block";
      });

      walkthroughOptions.addEventListener("click", (e) => {
        const opt = e.target.closest("div");
        if (!opt?.dataset.value) return;

        const selectedType = opt.dataset.value.toLowerCase();
        walkthroughSelected.textContent = opt.textContent;

        const currentScenario = new URLSearchParams(window.location.search).get("scenario");
        const basePath = `/smartui/html${selectedType}/openingpage${selectedType.toUpperCase()}.html`;

        window.location.href = `${basePath}?scenario=${currentScenario || ""}`;
      });
    }
  }

  if (scenarioDropdown) {
    const scenarioSelected = scenarioDropdown.querySelector(".selected-option");
    const scenarioOptions = scenarioDropdown.querySelector(".dropdown-options");

    if (scenarioSelected && scenarioOptions) {
      fetch("/smartui/scenarios/scenario-list.json")
        .then(res => res.json())
        .then(scenarios => {
          scenarios.forEach(s => {
            const div = document.createElement("div");
            div.textContent = s.name;
            div.dataset.value = s.file;
            scenarioOptions.appendChild(div);
          });

          const current = new URLSearchParams(window.location.search).get("scenario");
          if (current) {
            const match = scenarios.find(s => s.file === current);
            if (match) scenarioSelected.textContent = match.name;
          }
        });

      scenarioSelected.addEventListener("click", () => {
        scenarioOptions.style.display = "block";
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

}, 300);
