document.addEventListener("DOMContentLoaded", function() {
  // Get the dropdown elements
  const dropdown = document.getElementById("readPPS_Display_Latest_Stored_Values");
  const selectedOption = dropdown.querySelector(".selected-option");
  const options = dropdown.querySelector(".dropdown-options");

  // Toggle dropdown options visibility when the selected option is clicked
  selectedOption.addEventListener("click", function() {
    options.style.display = options.style.display === "block" ? "none" : "block";
  });

  // When an option is clicked, update the selected option and hide the dropdown
  options.addEventListener("click", function(e) {
    if (e.target && e.target.matches("div")) {
      selectedOption.textContent = e.target.textContent;  // Set the selected option text
      options.style.display = "none";  // Hide the dropdown options
    }
  });

  // Optional: Close the dropdown if clicked outside
  document.addEventListener("click", function(e) {
    if (!dropdown.contains(e.target)) {
      options.style.display = "none";  // Close dropdown if clicking outside
    }
  });
});