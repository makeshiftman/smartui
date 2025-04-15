// diagselect-loader.js
console.log("✅ Active version: diagselect-loader.js (Updated 15 April 16:13)");

document.addEventListener('DOMContentLoaded', function() {

  const deviceTypeDropdown = document.getElementById('Diagselect_Select_Device_Type');
  const deviceReadDropdown = document.getElementById('Diagselect_Select_Device_Read');
  const executeButton = document.getElementById('diagSelectionExecute');

   // 🔁 Function to toggle dropdown open/close on click
   function setupDropdownToggle(dropdown) {
    const selected = dropdown.querySelector('.selected-option');
    const options = dropdown.querySelector('.dropdown-options');

    // Close this dropdown if user clicks outside it
    document.addEventListener('click', function(event) {
      if (!dropdown.contains(event.target)) {
        options.style.display = 'none';
      }
    });

    // Toggle open/close on click
    selected.addEventListener('click', function(event) {
      event.stopPropagation(); // Prevent global click from closing it instantly
      const isVisible = options.style.display === 'block';
      options.style.display = isVisible ? 'none' : 'block';
    });
  }

  // Mapping object for dropdown selections and corresponding field data
  const selectionMapping = {
    ESME: {
      devicecattariff: {
        page: 'diagnosticstariffinfo',
        fieldId: 'TariffInfo',
        jsonKey: 'tariffinfo',
      },
      devicecatpaymentmode: {
        page: 'diagnosticsdevicepaymentmode', 
        fieldId: 'DevicePaymentMode',
        jsonKey: 'devicepaymentmode',
      },
      devicecatsupplystatus: {
        page: 'diagnosticssupplystatus',
        fieldId: 'SupplyState',
        jsonKey: 'supplystatus',
      },
      deviceauxload: {
        page: 'diagnosticsloadcontrolswitchdata',
        fieldId: 'AuxLoadSwitch',
        jsonKey: 'auxloadswitch', 
      },
      devicedevicelog: {
        page: 'diagnosticsdevicelog',
        fieldId: 'DeviceLog',
        jsonKey: 'devicelog',
      },
    },
    PPMID: {
      // Placeholder mappings for PPMID
      A1: {},
      A2: {},
      A3: {},
      A4: {},
    },
    GPF: {
      // Placeholder mappings for GPF  
      B1: {},
      B2: {},
      B3: {},
      B4: {},
    },
    'COMMS HUB': {
      // Placeholder mappings for COMMS HUB
      C1: {},
      C2: {},
      C3: {},
      C4: {},
    },
  };

  // Function to update the device read dropdown options based on the selected device type
  function updateDeviceReadOptions() {
    const selectedType = deviceTypeDropdown.querySelector('.selected-option').getAttribute('data-value');
    const options = deviceReadDropdown.querySelector('.dropdown-options');
    options.innerHTML = ''; // Clear existing options

    if (selectionMapping[selectedType]) {
      Object.keys(selectionMapping[selectedType]).forEach(function(key) {
        const option = document.createElement('div');
        option.setAttribute('data-value', key);
        option.textContent = key;
        options.appendChild(option);
      });
    }
  }

  // Function to handle the execute button click
  function handleExecuteButtonClick() {
    const selectedType = deviceTypeDropdown.querySelector('.selected-option').getAttribute('data-value');
    const selectedRead = deviceReadDropdown.querySelector('.selected-option').getAttribute('data-value');

    if (selectedType && selectedRead && selectionMapping[selectedType] && selectionMapping[selectedType][selectedRead]) {
      const mapping = selectionMapping[selectedType][selectedRead];
      const scenarioData = JSON.parse(localStorage.getItem('smartui_data'));

      if (scenarioData && scenarioData[mapping.jsonKey]) {
        const fieldValue = scenarioData[mapping.jsonKey];
        localStorage.setItem(`smartui_field_${mapping.page}_${mapping.fieldId}`, fieldValue);
      }
    }
  }

  // Load previous dropdown selections from localStorage
  const storedType = localStorage.getItem('smartui_diagselect_device_type');
  const storedRead = localStorage.getItem('smartui_diagselect_device_read');

  if (storedType) {
    deviceTypeDropdown.querySelector(`.dropdown-options [data-value="${storedType}"]`).click();
  }

  if (storedRead) {
    deviceReadDropdown.querySelector(`.dropdown-options [data-value="${storedRead}"]`).click();
  }

    // 🔧 Activate toggle logic for both dropdowns
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
        selectedDisplay.setAttribute('data-value', selectedValue);
        selectedDisplay.textContent = selectedOption.textContent;
  
        localStorage.setItem('smartui_diagselect_device_type', selectedValue);
        updateDeviceReadOptions();
      }
    });
  
    // Device read dropdown selection
    deviceReadDropdown.addEventListener('click', function(event) {
      if (event.target.closest('.dropdown-options') && event.target.hasAttribute('data-value')) {
        const selectedOption = event.target;
        const selectedValue = selectedOption.getAttribute('data-value');
  
        console.log("✅ Device Type option clicked:", selectedValue);

        // Update .selected-option
        const selectedDisplay = deviceReadDropdown.querySelector('.selected-option');
        selectedDisplay.setAttribute('data-value', selectedValue);
        selectedDisplay.textContent = selectedOption.textContent;
  
        localStorage.setItem('smartui_diagselect_device_read', selectedValue);
      }
    });

  // Event listener for execute button click
  executeButton.addEventListener('click', handleExecuteButtonClick);
});
