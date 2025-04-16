// diagselect-loader.js
console.log("✅ Active version: diagselect-loader.js (Updated 16 April 17.01)");

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
        page: 'devicecattariff',
        fieldId: 'TariffInfo',
        jsonKey: 'tariffinfo',
      },
      "Payment Mode": {
        page: 'devicecatpaymentmode', 
        fieldId: 'DevicePaymentMode',
        jsonKey: 'devicepaymentmode',
      },
      "Supply Status": {
        page: 'devicecatsupplystatus',
        fieldId: 'SupplyState',
        jsonKey: 'supplystatus',
      },
      "Auxillary Load Switch": {
        page: 'deviceauxload',
        fieldId: 'AuxLoadSwitch',
        jsonKey: 'auxloadswitch', 
      },
     "Device Log": {
        page: 'devicedevicelog',
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
    if (!deviceTypeDropdown || !deviceReadDropdown) return;
    
    const selectedElement = deviceTypeDropdown.querySelector('.selected-option');
    if (!selectedElement) return;
    
    const selectedType