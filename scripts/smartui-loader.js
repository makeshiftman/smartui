
function smartuiLoadAndPopulate(data) {
  const fields = [
    'contract_Account', 'contract',
    'contract_Start', 'operating_Mode', 'payment_Plan', 'read_Retrieval',
    'last_Comm', 'pod', 'device_Guid', 'meter_Serial', 'device_Start',
    'device_End', 'device_Status', 'elecOrGas', 'BPID'
  ];

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el && data[id] !== undefined) {
      el.value = data[id];
    }

    const duplicates = document.querySelectorAll(`[data-field="${id}"]`);
    duplicates.forEach(dup => {
      dup.value = data[id];
    });
  });

  const fullNameEl = document.getElementById('full_Name');
  if (fullNameEl && data.first_Name && data.last_Name) {
    fullNameEl.value = `${data.first_Name} ${data.last_Name}`;
  }

  const addressEl = document.getElementById('full_address');
  if (addressEl) {
    const parts = [];

    if (data.flatnumber) parts.push(`FLAT ${data.flatnumber.toString().toUpperCase()}`);
    if (data.housenumber && data.street) {
      parts.push(`${data.housenumber.toString().toUpperCase()} ${data.street.toUpperCase()}`);
    } else if (data.housenumber) {
      parts.push(data.housenumber.toString().toUpperCase());
    } else if (data.street) {
      parts.push(data.street.toUpperCase());
    }
    if (data.city) parts.push(data.city.toUpperCase());
    if (data.postcode) parts.push(data.postcode.toUpperCase());

    addressEl.value = parts.join(', ');
  }

  if (typeof smartuiOnLoadExtra === "function") {
    smartuiOnLoadExtra(data);
  }
}
