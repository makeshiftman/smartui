
// Master SmartUI dropdown handler for all .custom-dropdown elements

function initSmartUIDropdowns() {
  // Attach dropdown toggle and select behaviour to all custom-dropdowns
  document.querySelectorAll(".custom-dropdown").forEach(dropdown => {
    const selected = dropdown.querySelector(".selected-option");
    const options = dropdown.querySelector(".dropdown-options");

    if (!selected || !options) return;

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
      }
    });
  });

  // Close all dropdowns if clicked outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-dropdown")) {
      document.querySelectorAll(".dropdown-options").forEach(opt => opt.style.display = "none");
    }
  });

  // Dynamically populate SCENARIO dropdown
  const scenarioDropdown = document.getElementById("scenario_Selector");
  if (scenarioDropdown) {
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

        const current = new URLSearchParams(window.location.search).get("scenario");
        if (current) {
          const match = scenarios.find(s => s.file === current);
          if (match) selected.textContent = match.name;
        }
      });

    options.addEventListener("click", (e) => {
      const opt = e.target.closest("div");
      if (opt?.dataset.value) {
        const selectedScenario = opt.dataset.value;
        const currentPath = window.location.pathname;
        window.location.href = `${currentPath}?scenario=${selectedScenario}`;
      }
    });
  }

  // Dynamically populate WALKTHROUGH dropdown
  const walkthroughDropdown = document.getElementById("Smart_Menu_Bar");
  if (walkthroughDropdown) {
    const selected = walkthroughDropdown.querySelector(".selected-option");
    const options = walkthroughDropdown.querySelector(".dropdown-options");

    const walkthroughs = [
      { label: "Bronze Walkthrough", value: "bronze" },
      { label: "Silver Walkthrough", value: "silver" },
      { label: "Gold Walkthrough", value: "gold" }
    ];

    walkthroughs.forEach(w => {
      const div = document.createElement("div");
      div.textContent = w.label;
      div.dataset.value = w.value;
      options.appendChild(div);
    });

    options.addEventListener("click", (e) => {
      const opt = e.target.closest("div");
      if (!opt?.dataset.value) return;

      const selectedType = opt.dataset.value.toLowerCase();
      selected.textContent = opt.textContent;

      const currentScenario = new URLSearchParams(window.location.search).get("scenario");
      const basePath = `/smartui/html${selectedType}/openingpage${selectedType.toUpperCase()}.html`;

      window.location.href = `${basePath}?scenario=${currentScenario || ""}`;
    });
  }
}

// Wait for dropdowns to exist using MutationObserver
const observer = new MutationObserver(() => {
  const dropdowns = document.querySelectorAll(".custom-dropdown");
  if (dropdowns.length > 0) {
    observer.disconnect();
    initSmartUIDropdowns();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
