setTimeout(() => {
  const dropdown = document.getElementById('scenario_Selector');
  if (!dropdown) return;

  fetch('../scenarios/scenario-list.json')
    .then(res => res.json())
    .then(scenarios => {
      dropdown.innerHTML = '<option value="">Contract Account</option>';
      scenarios.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.file;
        opt.textContent = s.name;
        dropdown.appendChild(opt);
      });

      // Preselect current scenario if one is loaded
      const current = new URLSearchParams(window.location.search).get('scenario');
      if (current) {
        dropdown.value = current;
      }
    });

  dropdown.addEventListener('change', () => {
    const selected = dropdown.value;
    if (selected) {
      const currentPath = window.location.pathname;
      window.location.href = `${currentPath}?scenario=${selected}`;
    }
  });
}, 300);
