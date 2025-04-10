// --- Corrected Dropdown Interaction Script ---

document.addEventListener("DOMContentLoaded", function() {
  // Get the dropdown elements
  const dropdown = document.getElementById("readPPS_Display_Latest_Stored_Values");
  // Check if dropdown exists before proceeding
  if (!dropdown) {
      console.error("Dropdown element #readPPS_Display_Latest_Stored_Values not found!");
      return;
  }
  const selectedOptionDiv = dropdown.querySelector(".selected-option");
  const optionsContainer = dropdown.querySelector(".dropdown-options");

  // Check for sub-elements
  if (!selectedOptionDiv || !optionsContainer) {
       console.error("Dropdown structure error: .selected-option or .dropdown-options not found within #readPPS_Display_Latest_Stored_Values.");
       return;
  }

  // --- Function to synchronize radio buttons based on dropdown value/text ---
  function syncRadioButtonsToDropdown(selectedValueOrText) {
      console.log(`Syncing radio buttons for dropdown value/text: ${selectedValueOrText}`);

      let radioToCheck = null;

      // Determine which radio button to check based on the dropdown data-value or text content
      // Target the new radio buttons with name="readMode"
      if (selectedValueOrText === "DisplayLatestStoredValues") { // Match data-value or text
           // Use the new ID or the name/value selector
           // radioToCheck = document.getElementById("radio_PPS_Latest"); 
           radioToCheck = document.querySelector("input[name='readMode'][value='latest']");
           if (!radioToCheck) console.warn("Cannot find radio button input[name='readMode'][value='latest']");

      } else if (selectedValueOrText === "NONE") { // Handle the "NONE" option
          // Uncheck all readMode radio buttons if "NONE" is selected
          document.querySelectorAll("input[name='readMode']").forEach(radio => radio.checked = false);
          console.log("Unchecked all readMode radio buttons for NONE selection.");
          return; // Exit after unchecking, nothing else to check
      
      // *** Add mapping for other dropdown options if they exist ***
      // For example, if you had a dropdown option data-value="SelectDateRange":
      // } else if (selectedValueOrText === "SelectDateRange") { 
      //     radioToCheck = document.querySelector("input[name='readMode'][value='selectDate']");
      //     if (!radioToCheck) console.warn("Cannot find radio button input[name='readMode'][value='selectDate']");
      
      } else {
           console.warn(`No specific radio button sync logic defined for dropdown value/text: ${selectedValueOrText}`);
      }

      // Check the identified radio button
      if (radioToCheck) {
          if (!radioToCheck.checked) { // Only log if changing state
             radioToCheck.checked = true;
             console.log(`Checked radio button with value: ${radioToCheck.value}`);
             // Optional: Dispatch change event if other scripts need to react to programmatic changes
             // radioToCheck.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
             console.log(`Radio button with value: ${radioToCheck.value} was already checked.`);
          }
      } else {
          console.warn(`No corresponding radio button found to check for: ${selectedValueOrText}`);
      }
  }

  // Toggle dropdown options visibility when the selected option is clicked
  selectedOptionDiv.addEventListener("click", function() {
      optionsContainer.style.display = optionsContainer.style.display === "block" ? "none" : "block";
  });

  // When an option is clicked, update the selected option, sync radio, and hide dropdown
  optionsContainer.addEventListener("click", function(e) {
      // Ensure the click was directly on a div element with a data-value (an option)
      if (e.target && e.target.matches("div[data-value]")) { 
          const clickedText = e.target.textContent;
          const clickedValue = e.target.dataset.value; // Get the data-value attribute

          selectedOptionDiv.textContent = clickedText;  // Set the selected option text
          optionsContainer.style.display = "none";  // Hide the dropdown options

          // --- Sync radio buttons based on the clicked option's data-value ---
          syncRadioButtonsToDropdown(clickedValue); 
      }
  });

  // Optional: Close the dropdown if clicked outside
  document.addEventListener("click", function(e) {
      // Check if the click target is the dropdown itself or inside it
      if (!dropdown.contains(e.target)) {
          optionsContainer.style.display = "none";  // Close dropdown if clicking outside
      }
  });

  // --- Initial synchronization on page load ---
  // Sync based on the default text in the dropdown
  const initialSelectedText = selectedOptionDiv.textContent.trim();
  console.log("Performing initial radio button sync based on default dropdown text:", initialSelectedText);
  syncRadioButtonsToDropdown(initialSelectedText);
});