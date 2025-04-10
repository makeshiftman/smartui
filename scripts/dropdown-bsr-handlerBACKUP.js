// Complete code for dropdown handling (e.g., dropdown-bsr-handler.js)

// --- Block 1: General Handler for ALL elements with class="custom-dropdown" ---
document.addEventListener("DOMContentLoaded", () => {
  // Find all generic custom dropdowns on the page
  document.querySelectorAll(".custom-dropdown").forEach(dropdown => {
      const selected = dropdown.querySelector(".selected-option");
      const options = dropdown.querySelector(".dropdown-options");

      // If the expected inner elements aren't found, skip this dropdown
      if (!selected || !options) {
          // console.warn("Skipping custom dropdown setup for an element lacking .selected-option or .dropdown-options.", dropdown);
          return;
      }

      // Toggle dropdown visibility when the selected part is clicked
      selected.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent click from immediately closing dropdown via document listener
          const isOpen = options.style.display === "block";
          // Close all *other* custom dropdowns first
          document.querySelectorAll(".custom-dropdown .dropdown-options").forEach(opt => {
              if (opt !== options) { // Don't close the current one yet
                  opt.style.display = "none";
              }
          });
          // Toggle the display of the current dropdown's options
          options.style.display = isOpen ? "none" : "block";
      });

      // Handle option selection when an option is clicked
      options.addEventListener("click", (e) => {
          // Find the actual option div that was clicked (might be text inside)
          const opt = e.target.closest("div[data-value]"); // Ensure the clicked div has a data-value

          if (opt) { // Check if a valid option was clicked
              selected.textContent = opt.textContent; // Update displayed text
              // If the selected element itself should store the value (optional)
              if ('value' in selected) {
                   selected.value = opt.dataset.value; // For input/select elements
              }
              // Store value in dataset for potential JS use
              selected.dataset.value = opt.dataset.value;
              options.style.display = "none"; // Hide options after selection

              // Optional: Dispatch a change event if other code needs to react
              // selected.dispatchEvent(new Event('change', { bubbles: true }));
          }
      });
  });

  // Add a listener to the whole document to close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
      // If the click was not inside *any* element with class "custom-dropdown"
      if (!e.target.closest(".custom-dropdown")) {
          // Hide all dropdown option lists
          document.querySelectorAll(".custom-dropdown .dropdown-options").forEach(opt => {
              opt.style.display = "none";
          });
      }
  });
});


// --- Block 2: Corrected Specific Handler for the "#readPPS_Display_Latest_Stored_Values" dropdown ---
// (This block now includes the check to prevent errors if the element doesn't exist)
document.addEventListener("DOMContentLoaded", () => {
  // Attempt to find the specific dropdown element required by this handler
  const dropdown = document.getElementById("readPPS_Display_Latest_Stored_Values");

  // *** IMPORTANT CHECK ***
  // Only proceed with the rest of the setup if the dropdown element actually exists on this page
  if (dropdown) {

      // Now it's safe to query for elements inside the found dropdown
      const selectedOptionDiv = dropdown.querySelector('.selected-option');
      const optionsDiv = dropdown.querySelector('.dropdown-options');

      // Further check if the necessary inner elements were found
      if (selectedOptionDiv && optionsDiv) {

          // Add event listener for clicking options within this specific dropdown
          optionsDiv.querySelectorAll('div').forEach(option => {
              // Ensure we're adding listener to elements that actually have a data-value
              if (option.hasAttribute('data-value')) {
                  option.addEventListener('click', () => {
                      const selectedValue = option.getAttribute('data-value');

                      // Update the displayed text in the dropdown
                      selectedOptionDiv.textContent = option.textContent;

                      // Update localStorage with the selected value
                      localStorage.setItem("readPPS_Display_Latest_Stored_Values", selectedValue);

                      // Optional: Hide the options list after selection
                      optionsDiv.style.display = 'none';
                  });
              }
          });

          // You could add other event listeners or setup specific
          // to '#readPPS_Display_Latest_Stored_Values' here if needed
          // For example, maybe clicking the selectedOptionDiv should also toggle optionsDiv?
          // selectedOptionDiv.addEventListener('click', () => { ... });

      } else {
          // Log a warning if the structure inside the found dropdown is not as expected
          console.warn("Could not find '.selected-option' or '.dropdown-options' inside #readPPS_Display_Latest_Stored_Values.");
      }

  } else {
      // Optional: Log that this specific dropdown isn't on the current page.
      // This is normal if this script is loaded on pages without this dropdown.
      // console.log("Dropdown #readPPS_Display_Latest_Stored_Values not found on this page, skipping specific handler setup.");
  }

}); // End DOMContentLoaded wrapper for the specific handler
