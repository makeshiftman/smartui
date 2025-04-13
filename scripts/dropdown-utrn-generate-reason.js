console.log("✅ Active version: dropdown-generate-reason.js (Updated 12 April 23:02)");

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("UTRN_Generate_Reason");
  if (!dropdown) return;

  const selected = dropdown.querySelector(".selected-option");
  const options = dropdown.querySelector(".dropdown-options");

  if (selected && options) {
    selected.addEventListener("click", () => {
      const isOpen = options.style.display === "block";
      options.style.display = isOpen ? "none" : "block";
    });

    options.addEventListener("click", (e) => {
      const opt = e.target.closest("div");
      if (opt?.dataset.value) {
        selected.textContent = opt.textContent;
        selected.dataset.value = opt.dataset.value;
        options.style.display = "none";
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#UTRN_Generate_Reason")) {
      options.style.display = "none";
    }
  });
});