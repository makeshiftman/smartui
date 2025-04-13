console.log("\u2705 Active version: utrn-generate-handler.js (Updated 13 April 11:54)");

// --- UTRN Generate Logic for prepaymentpaymentsUTRNgenerate.html ---
document.addEventListener("DOMContentLoaded", () => {
  const amountField = document.getElementById("utrn_Generate_Amount");
  const reasonDropdown = document.getElementById("UTRN_Generate_Reason");
  const reasonSelected = reasonDropdown?.querySelector(".selected-option");
  const executeBtn = document.getElementById("utrnGenerateExecute");

  if (!amountField || !reasonDropdown || !reasonSelected || !executeBtn) {
    console.warn("UTRN generate handler: Required elements not found.");
    return;
  }

  executeBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const amount = parseFloat(amountField.value);
    const reason = reasonSelected.textContent.trim();

    if (isNaN(amount) || amount < 1 || amount > 500) {
      alert("Please enter a valid amount between 1 and 500.");
      return;
    }
    if (!reason || reason === "\u00a0") { // &nbsp;
      alert("Please select a reason from the dropdown.");
      return;
    }

    const now = new Date();
    const createdTime = now.toTimeString().split(" ")[0].substring(0,5); // HH:MM
    const createdOffset = 0; // Today

    const newUTRN = {
      createdOffset: createdOffset,
      appliedOffset: null,
      value: amount.toFixed(2),
      type: "Manual",
      utrn: generateRandomUTRN(),
      channel: "Manual",
      status: "UTRN generated",
      auth: null,
      createdTime: createdTime,
      appliedTime: null
    };

    // Save to localStorage
    const data = JSON.parse(localStorage.getItem("smartui_data")) || {};
    data.utrnRows = Array.isArray(data.utrnRows) ? data.utrnRows : [];
    data.utrnRows.push(newUTRN);
    localStorage.setItem("smartui_data", JSON.stringify(data));

    console.log("New UTRN generated:", newUTRN);

    // Delay applied status
    const delay = 20000 + Math.floor(Math.random() * (97000 - 20000));
    setTimeout(() => {
      newUTRN.status = "UTRN applied";
      const appliedNow = new Date();
      newUTRN.appliedTime = appliedNow.toTimeString().split(" ")[0].substring(0,5);
      newUTRN.appliedOffset = 0;
      localStorage.setItem("smartui_data", JSON.stringify(data));
      console.log("UTRN updated to 'applied':", newUTRN.utrn);
    }, delay);
  });
});

function generateRandomUTRN() {
  let utrn = "";
  for (let i = 0; i < 20; i++) {
    utrn += Math.floor(Math.random() * 10).toString();
  }
  return utrn;
}
