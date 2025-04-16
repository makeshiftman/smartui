// diagselect-loader.js
console.log("✅ Active version: diagselect-loader.js (Updated 16 April 17:53)");

document.addEventListener('DOMContentLoaded', function() {

  const deviceTypeDropdown = document.getElementById('Diagselect_Select_Device_Type');
  const deviceReadDropdown = document.getElementById('Diagselect_Select_Device_Read');
  const executeButton = document.getElementById('diagSelectionExecute');

  // 🔁 Function to toggle dropdown open/close on click
  function setupDropdownToggle(dropdown) {
    const selected = dropdown.querySelector('.selected-option');
    const options = dropdown.querySelector('.dropdown-options');
  
    // Global click handler to close all dropdowns
    document.addEventListener('click', function() {
      document.querySelectorAll('.dropdown-options').forEach(function(opt) {
        opt.style.display = 'none';
      });
    });
  
    // Toggle this specific dropdown
    selected.addEventListener('click', function(event) {
      event.stopPropagation();
      const isVisible = options.style.display === 'block';
  
      // Close all dropdowns before opening the current one
      document.querySelectorAll('.dropdown-options').forEach(function(opt) {
        opt.style.display = 'none';
      });
  
      // Now open the one we clicked (unless it was already open)
      options.style.display = isVisible ? 'none' : 'block';
    });
    
    // Close this dropdown if user clicks outside it
    document.addEventListener('click', function(event) {
      if (!dropdown.contains(event.target)) {
        options.style.display = 'none';
      }
    });
  }

  // Mapping object for dropdown selections and corresponding field data
  const selectionMapping = {
    ESME: {
      "Tariff Info": {
        page: 'diagnosticstariffinfo', // Corrected
        fieldId: 'TariffInfo',
        jsonKey: 'tariffinfo',
      },
      "Payment Mode": {
        page: 'diagnosticsdevicepaymentmode', // ✅ matches diagnosticsdevicepaymentmode.html
        fieldId: 'DevicePaymentMode',
        jsonKey: 'devicepaymentmode',
      },
      "Supply Status": {
        page: 'diagnosticssupplystatus', // ✅ matches diagnosticssupplystatus.html
        fieldId: 'SupplyState',
        jsonKey: 'supplystatus',
      },
      "Auxillary Load Switch": {
        page: 'diagnosticsloadcontrolswitchdata', // Corrected from deviceauxload
        fieldId: 'AuxLoadSwitch',
        jsonKey: 'auxloadswitch',
      },
      "Device Log": {
        page: 'diagnosticsdevicelog', // Corrected from devicedevicelog
        fieldId: 'DeviceLog',
        jsonKey: 'devicelog',
      },
    },
    PPMID: {
      A1: {},
      A2: {},
      A3: {},
      A4: {},
    },
    GPF: {
      B1: {},
      B2: {},
      B3: {},
      B4: {},
    },
    'COMMS HUB': {
      C1: {},
      C2: {},
      C3: {},
      C4: {},
    },
  };

  // Function to update the device read dropdown options based on the selected device type
  function updateDeviceReadOptions() {
    if (!deviceTypeDropdown || !deviceReadDropdown) return;
    
    const selectedElement = deviceTypeDropdown.querySelector('.selected-option');
    if (!selectedElement) return;
    
    const selectedType = selectedElement.getAttribute('data-value');
    if (!selectedType) return;
    
    const options = deviceReadDropdown.querySelector('.dropdown-options');
    if (!options) return;
    
    options.innerHTML = ''; // Clear existing options

    // Add a blank option
    const blankOption = document.createElement('div');
    blankOption.setAttribute('data-value', '');
    blankOption.classList.add('dropdown-option');
    blankOption.textContent = '\u00A0'; // non-breaking space: visually blank but renders
    options.appendChild(blankOption);

    if (selectionMapping[selectedType]) {
      Object.keys(selectionMapping[selectedType]).forEach(function(key) {
        const option = document.createElement('div');
        option.setAttribute('data-value', key);
        option.textContent = key;
        options.appendChild(option);
      });
    }

    // Force blank selection when device type changes
    const selectedDisplay = deviceReadDropdown.querySelector('.selected-option');
    if (selectedDisplay) {
      selectedDisplay.setAttribute('data-value', '');
      selectedDisplay.textContent = '\u00A0'; // visually blank
    }
    localStorage.setItem('smartui_diagselect_device_read', '');

    // If we have a stored read value, try to select it after populating options
    const storedRead = localStorage.getItem('smartui_diagselect_device_read');
    if (storedRead && storedRead !== '') {
      const readOption = options.querySelector(`[data-value="${storedRead}"]`);
      if (readOption) {
        readOption.click();
      }
    }
  }

  // Function to handle the execute button click
  function handleExecuteButtonClick() {
    if (!deviceTypeDropdown || !deviceReadDropdown) {
      console.error("Required dropdown elements not found");
      return;
    }
    
    const typeElement = deviceTypeDropdown.querySelector('.selected-option');
    const readElement = deviceReadDropdown.querySelector('.selected-option');
    
    if (!typeElement || !readElement) {
      console.error("Selected options not found");
      return;
    }
    
    const selectedType = typeElement.getAttribute('data-value');
    const selectedRead = readElement.getAttribute('data-value');

    if (selectedType && selectedRead && selectionMapping[selectedType] && selectionMapping[selectedType][selectedRead]) {
      const mapping = selectionMapping[selectedType][selectedRead];
      const scenarioDataString = localStorage.getItem('smartui_data');

      if (scenarioDataString) {
        try {
          const scenarioData = JSON.parse(scenarioDataString);
          const fieldValue = scenarioData[mapping.jsonKey] || ''; // Use empty string if data is not available

          localStorage.setItem(`smartui_field_${mapping.page}_${mapping.fieldId}`, fieldValue);
          console.log(`Field value set for ${mapping.page} - ${mapping.fieldId}: ${fieldValue}`);
        } catch (error) {
          console.error("Error parsing smartui_data:", error);
        }
      } else {
        console.warn("No scenario data found in localStorage");
      }
    } else {
      console.warn("Invalid or missing selection");
    }
  }

  // 🔧 Activate toggle logic for both dropdowns
  if (deviceTypeDropdown && deviceReadDropdown) {
    setupDropdownToggle(deviceTypeDropdown);
    setupDropdownToggle(deviceReadDropdown);
  
    // Device type dropdown selection
    deviceTypeDropdown.addEventListener('click', function(event) {
      if (event.target.closest('.dropdown-options') && event.target.hasAttribute('data-value')) {
        const selectedOption = event.target;
        const selectedValue = selectedOption.getAttribute('data-value');
    
        console.log("✅ Device Type option clicked:", selectedValue);
  
        // Update .selected-option
        const selectedDisplay = deviceTypeDropdown.querySelector('.selected-option');
        if (selectedDisplay) {
          selectedDisplay.setAttribute('data-value', selectedValue);
          selectedDisplay.textContent = selectedOption.textContent;
      
          localStorage.setItem('smartui_diagselect_device_type', selectedValue);
          updateDeviceReadOptions();
        }
      }
    });
    
    // Device read dropdown selection
    deviceReadDropdown.addEventListener('click', function(event) {
      if (event.target.closest('.dropdown-options') && event.target.hasAttribute('data-value')) {
        const selectedOption = event.target;
        const selectedValue = selectedOption.getAttribute('data-value');
    
        console.log("✅ Device Read option clicked:", selectedValue);
  
        // Update .selected-option
        const selectedDisplay = deviceReadDropdown.querySelector('.selected-option');
        if (selectedDisplay) {
          selectedDisplay.setAttribute('data-value', selectedValue);
          selectedDisplay.textContent = selectedOption.textContent;
      
          localStorage.setItem('smartui_diagselect_device_read', selectedValue);
        }
      }
    });
  
    // Event listener for execute button click
    if (executeButton) {
      executeButton.addEventListener('click', handleExecuteButtonClick);
    }
    
    // Load previous device type selection from localStorage
    const storedType = localStorage.getItem('smartui_diagselect_device_type');
    if (storedType) {
      const typeOptions = deviceTypeDropdown.querySelectorAll('.dropdown-options [data-value]');
      let typeOption = null;
      typeOptions.forEach(opt => {
        if (opt.getAttribute('data-value') === storedType) {
          typeOption = opt;
        }
      });

      if (typeOption) {
        typeOption.click();
        // The device read selection will be handled in updateDeviceReadOptions
      }
    }
  } else {
    console.error("Required dropdown elements not found");
  }
});
