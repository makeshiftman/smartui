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

      // Fix pointer behavior
      row.style.pointerEvents = "auto";
      [...row.children].forEach(cell => cell.style.pointerEvents = "none");
  
      // ✅ Highlight row on click
      row.addEventListener("click", () => {
        document.querySelectorAll('.utrn-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
      });
  
      // ✅ Right-click context menu
      row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const target = e.currentTarget; // Always the .utrn-row
        const menu = document.getElementById("context-menu");
        menu.style.top = `${e.clientY}px`;
        menu.style.left = `${e.clientX}px`;
        menu.style.display = "block";
        menu.dataset.utrn = entry.utrn;
      });
    });
  
    // ✅ Global listener to hide menu on click anywhere else
    document.addEventListener("click", () => {
      document.getElementById("context-menu").style.display = "none";
    });
  
    // ✅ "Find..." logic
    document.getElementById("context-find").addEventListener("click", () => {
      const utrn = document.getElementById("context-menu").dataset.utrn;
      alert(`Simulated Find for UTRN:\n${utrn}`);
    });
  }