// reset-scenario-handler.js
// Handles the reset button: clears scenario data and reloads with default

document.addEventListener('DOMContentLoaded', () => {
  const resetBtn = document.getElementById('reset-scenario');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('smartui_data');
      localStorage.removeItem('smartui_scenarioPath');
      // Force reload using default scenario
      window.location.href = "openingpage.html?scenario=/smartui/scenarios/default.json";
    });
  }
});
