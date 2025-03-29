
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("generate-reason-dropdown");
  if (!dropdown) return;

  const selected = dropdown.querySelector(".selected-option");
  const options = dropdown.querySelector(".dropdown-options");

  selected.addEventListener("click", () => {
    options.style.display = options.style.display === "block" ? "none" : "block";
  });

  options.querySelectorAll("div").forEach(option => {
    option.addEventListener("click", () => {
      selected.textContent = option.textContent;
      options.style.display = "none";

      // ✅ Hook for triggering additional actions
      console.log("Selected value:", option.dataset.value);
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      options.style.display = "none";
    }
  });
});
