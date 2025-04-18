// Complete code for dropdown handling (dropdown-bsr-handler.js)
// Includes:
// 1. General handler for elements with class="custom-dropdown"
// 2. Specific handler for element with id="readPPS_Display_Latest_Stored_Values" (now checks for element existence)

// --- Block 1: General Handler for ALL elements with class="custom-dropdown" ---
document.addEventListener("DOMContentLoaded", () => {
    // General handler for all elements with class 'custom-dropdown'
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    
    if (!dropdowns.length) {
        console.warn('No custom-dropdown elements found on the page');
        return;
    }

    dropdowns.forEach(dropdown => {
        const selected = dropdown.querySelector('.selected');
        const optionsList = dropdown.querySelector('.options-list');
        
        if (!selected || !optionsList) {
            console.error('Dropdown structure is invalid. Missing required elements:', {
                dropdown: dropdown.id || 'unnamed',
                hasSelected: !!selected,
                hasOptionsList: !!optionsList
            });
            return;
        }

        // Toggle dropdown visibility
        selected.addEventListener('click', () => {
            const isOpen = optionsList.classList.contains('show');
            
            // Close all other dropdowns first
            document.querySelectorAll('.options-list.show').forEach(list => {
                if (list !== optionsList) {
                    list.classList.remove('show');
                }
            });
            
            optionsList.classList.toggle('show');
        });

        // Handle option selection
        const options = optionsList.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                if (!value) {
                    console.warn('Option clicked has no data-value attribute:', option);
                    return;
                }
                
                selected.textContent = option.textContent;
                optionsList.classList.remove('show');
                
                // Trigger change event
                const event = new Event('change');
                dropdown.dispatchEvent(event);
            });
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
    // Specific handler for readPPS_Display_Latest_Stored_Values dropdown
    const readPPSDropdown = document.getElementById('readPPS_Display_Latest_Stored_Values');
    if (!readPPSDropdown) {
        console.warn('readPPS_Display_Latest_Stored_Values dropdown not found on the page');
        return;
    }

    const selectedElement = readPPSDropdown.querySelector('.selected');
    const optionsListElement = readPPSDropdown.querySelector('.options-list');
    
    if (!selectedElement || !optionsListElement) {
        console.error('readPPS dropdown structure is invalid. Missing required elements:', {
            hasSelected: !!selectedElement,
            hasOptionsList: !!optionsListElement
        });
        return;
    }

    // Load saved value from localStorage
    const savedValue = localStorage.getItem('readPPS_Display_Latest_Stored_Values');
    if (savedValue) {
        const option = optionsListElement.querySelector(`[data-value="${savedValue}"]`);
        if (option) {
            selectedElement.textContent = option.textContent;
        } else {
            console.warn(`Saved value "${savedValue}" not found in dropdown options`);
        }
    }

    // Save selected value to localStorage
    readPPSDropdown.addEventListener('change', () => {
        const selectedOption = selectedElement.textContent;
        const optionElement = optionsListElement.querySelector(`.option:contains("${selectedOption}")`);
        
        if (optionElement) {
            const value = optionElement.dataset.value;
            if (value) {
                localStorage.setItem('readPPS_Display_Latest_Stored_Values', value);
                console.log(`Saved value "${value}" to localStorage`);
            } else {
                console.warn('Selected option has no data-value attribute:', optionElement);
            }
        } else {
            console.warn('Could not find option element for selected text:', selectedOption);
        }
    });
});
