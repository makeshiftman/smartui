
document.addEventListener("DOMContentLoaded", () => {
  if (typeof getScenario === 'function' && typeof loadScenario === 'function') {
    const scenario = getScenario() || "default";
    loadScenario("../scenarios/" + scenario + ".json");
  } else {
    console.warn("getScenario or loadScenario not available yet.");
  }
});
