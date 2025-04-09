
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".custom-dropdown").forEach(dropdown => {
    const selected = dropdown.querySelector(".selected-option");
    const options = dropdown.querySelector(".dropdown-options");

    if (!selected || !options) return;

    // Toggle dropdown visibility on click
    selected.addEventListener("click", () => {
      const isOpen = options.style.display === "block";
      // Close all other dropdowns
      document.querySelectorAll(".dropdown-options").forEach(opt => opt.style.display = "none");
      // Toggle current
      options.style.display = isOpen ? "none" : "block";
    });

    // Handle option selection
    options.addEventListener("click", (e) => {
      const opt = e.target.closest("div");
      if (opt && opt.dataset.value !== undefined) {
        selected.textContent = opt.textContent;
        selected.dataset.value = opt.dataset.value;
        options.style.display = "none";
      }
    });
  });

  // Close dropdowns if clicked outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-dropdown")) {
      document.querySelectorAll(".dropdown-options").forEach(opt => opt.style.display = "none");
    }
  });
});

// In your dropdown-bsr-handler.js or a similar file
const dropdown = document.getElementById("readPPS_Display_Latest_Stored_Values");
const selectedOptionDiv = dropdown.querySelector('.selected-option');
const optionsDiv = dropdown.querySelector('.dropdown-options');

// Add event listener for clicking options
optionsDiv.querySelectorAll('div').forEach(option => {
  option.addEventListener('click', () => {
    const selectedValue = option.getAttribute('data-value');
    selectedOptionDiv.textContent = option.textContent;  // Show selected option in the dropdown
    localStorage.setItem("readPPS_Display_Latest_Stored_Values", selectedValue); // Save selection to localStorage
  });
});