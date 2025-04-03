document.querySelectorAll(".custom-dropdown").forEach(dropdown => {
  const selected = dropdown.querySelector(".selected-option");
  const options = dropdown.querySelector(".dropdown-options");

  selected.addEventListener("click", () => {
    const isOpen = options.style.display === "block";
    document.querySelectorAll(".dropdown-options").forEach(opt => opt.style.display = "none");
    options.style.display = isOpen ? "none" : "block";
  });

  options.addEventListener("click", (e) => {
    const option = e.target.closest("div");
    if (option && option.dataset.value !== undefined) {
      selected.textContent = option.textContent;
      options.style.display = "none";
      console.log("Selected value:", option.dataset.value);
    }
  });
});

// Close dropdown if clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-dropdown")) {
    document.querySelectorAll(".dropdown-options").forEach(opt => opt.style.display = "none");
  }
});

// 🆕 Dynamically populate #scenario_Selector from scenario-list.json
setTimeout(() => {
  const scenarioDropdown = document.getElementById("scenario_Selector");
  if (!scenarioDropdown) return;

  const selected = scenarioDropdown.querySelector(".selected-option");
  const options = scenarioDropdown.querySelector(".dropdown-options");

  fetch("/smartui/scenarios/scenario-list.json")
    .then(res => res.json())
    .then(scenarios => {
      scenarios.forEach(s => {
        const div = document.createElement("div");
        div.textContent = s.name;
        div.dataset.value = s.file;
        options.appendChild(div);
      });

      // Pre-select current scenario if it matches
      const current = new URLSearchParams(window.location.search).get("scenario");
      if (current) {
        const match = scenarios.find(s => s.file === current);
        if (match) selected.textContent = match.name;
      }
    });

  // Navigation on select
  options.addEventListener("click", (e) => {
    const opt = e.target.closest("div");
    if (opt?.dataset.value) {
      const selectedScenario = opt.dataset.value;
      const currentPath = window.location.pathname;
      window.location.href = `${currentPath}?scenario=${selectedScenario}`;
    }
  });
}, 300);

setTimeout(() => {
  const walkthroughDropdown = document.getElementById("Smart_Menu_Bar");
  if (!walkthroughDropdown) return;

  const selected = walkthroughDropdown.querySelector(".selected-option");
  const options = walkthroughDropdown.querySelector(".dropdown-options");

  walkthroughDropdown.addEventListener("click", () => {
    walkthroughDropdown.classList.toggle("open");
  });

  options.addEventListener("click", (e) => {
    const opt = e.target.closest("div");
    if (!opt?.dataset.value) return;

    const selectedType = opt.dataset.value.toLowerCase();
    selected.textContent = opt.textContent;

    const currentScenario = new URLSearchParams(window.location.search).get("scenario");
    const basePath = `/smartui/html${selectedType}/openingpage${selectedType.toUpperCase()}.html`;

    // Redirect while preserving current scenario
    window.location.href = `${basePath}?scenario=${currentScenario || ""}`;
  });

  // Close if clicked outside
  document.addEventListener("click", (e) => {
    if (!walkthroughDropdown.contains(e.target)) {
      walkthroughDropdown.classList.remove("open");
    }
  });
}, 300);