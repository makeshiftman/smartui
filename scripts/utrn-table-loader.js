function populateUTRNTable(utrnList) {
  const container = document.getElementById('utrn-table');
  if (!container || !Array.isArray(utrnList)) return;

  container.innerHTML = ''; // Clear previous rows

  utrnList.forEach(entry => {
    const row = document.createElement('div');
    row.classList.add('table-row', 'utrn-row');

    const fields = [
      entry.created,
      entry.applied,
      entry.value,
      entry.type,
      entry.utrn,
      entry.channel,
      entry.status,
      entry.payout,
      entry.bpem,
      entry.auth
    ];

    fields.forEach(text => {
      const cell = document.createElement('div');
      cell.textContent = text;
      row.appendChild(cell);
    });

    container.appendChild(row);
  });
}