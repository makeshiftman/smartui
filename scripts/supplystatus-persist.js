document.addEventListener('DOMContentLoaded', function() {
  const supplyStateField = document.getElementById('SupplyState');
  const storedValue = localStorage.getItem('smartui_field_diagnosticssupplystatus_SupplyState');

  if (storedValue) {
    supplyStateField.value = storedValue;
  }
});