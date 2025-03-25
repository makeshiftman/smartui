function getScenarioKey() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("scenario");
}

function loadScenarioData(callback) {
  const key = getScenarioKey();
  if (!key) return;

  fetch(`scenarios/${key}.json`)
    .then(response => response.json())
    .then(data => callback(data))
    .catch(err => console.error("Failed to load scenario:", err));
}

function populateFieldsFromMetadata(metadata) {
  document.querySelectorAll('[data-field]').forEach(el => {
    const key = el.getAttribute("data-field");
    if (metadata[key]) {
      el.value = metadata[key];
    }
  });
}