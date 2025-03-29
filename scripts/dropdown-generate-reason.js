document.querySelectorAll(".custom-dropdown").forEach(dropdown => {
  const selected = dropdown.querySelector(".selected-option");
  const options = dropdown.querySelector(".dropdown-options");

  selected.addEventListener("click", () => {
    const isOpen = options.style.display === "block";
    document.querySelectorAll(".dropdown-options").forEach(opt => opt.style.display = "none");
    options.style.display = isOpen ? "none" : "block";
  });

  options.querySelectorAll("div").forEach(option => {
    option.addEventListener("click", () => {
      selected.textContent = option.textContent;
      options.style.display = "none";
      console.log("Selected value:", option.dataset.value);
    });
  });
});

// Close dropdown if clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-dropdown")) {
    document.querySelectorAll(".dropdown-options").forEach(opt => opt.style.display = "none");
  }
});
