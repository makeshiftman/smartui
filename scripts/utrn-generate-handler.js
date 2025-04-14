console.log("✅ Active version: utrn-generate-handler.js (Updated 13 April 14:52)");

document.addEventListener("DOMContentLoaded", () => {
  const amountInput = document.getElementById("utrn_Generate_Amount");
  const reasonDropdown = document.getElementById("UTRN_Generate_Reason");
  const executeButton = document.getElementById("utrnGenerateExecute");

  // ✅ NEW: Get display fields
  const resultField = document.getElementById("utrn_generated_result");
  const valueField = document.getElementById("utrn_generated_value");
  const channelField = document.getElementById("utrn_generated_channel");
  const statusField = document.getElementById("utrn_generated_status");

  if (!amountInput || !reasonDropdown || !executeButton) {
    console.warn("UTRN generate elements not found. Script disabled.");
    return;
  }

  executeButton.addEventListener("click", () => {
    const amount = parseFloat(amountInput.value);
    const reasonOption = reasonDropdown.querySelector(".selected-option");
    const reason = reasonOption ? reasonOption.textContent.trim() : "";

    if (isNaN(amount) || amount < 1 || amount > 500) {
      alert("Please enter a valid amount between 1 and 500.");
      return;
    }

    if (!reason) {
      alert("Please select a reason from the dropdown.");
      return;
    }

    const now = new Date();
    const createdTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntry = {
      createdOffset: 0,
      appliedOffset: null,
      value: amount.toFixed(2),
      type: "Manual",
      utrn: generate20DigitUTRN(),
      channel: "SMART_UI - Non Payme", // ✅ Corrected capitalisation
      status: "UTRN generated",
      auth: null,
      createdTime: createdTime,
      appliedTime: null,
      reason: reason
    };

    const dataString = localStorage.getItem("smartui_data");
    let data = dataString ? JSON.parse(dataString) : {};
    if (!Array.isArray(data.utrnRows)) data.utrnRows = [];
    data.utrnRows.push(newEntry);
    localStorage.setItem("smartui_data", JSON.stringify(data));

    console.log("✅ UTRN generated and stored:", newEntry);

    // ✅ NEW: Fill result display fields
    if (resultField) resultField.value = newEntry.utrn;
    if (valueField) valueField.value = newEntry.value;
    if (channelField) channelField.value = newEntry.channel;
    if (statusField) statusField.value = newEntry.status;

    // Delayed update for UTRN applied
    const delay = Math.floor(20000 + Math.random() * 77000);
    setTimeout(() => {
      const nowApplied = new Date();
      const appliedTime = `${String(nowApplied.getHours()).padStart(2, '0')}:${String(nowApplied.getMinutes()).padStart(2, '0')}`;

      newEntry.status = "UTRN applied";
      newEntry.appliedOffset = 0;
      newEntry.appliedTime = appliedTime;

      const updatedData = JSON.parse(localStorage.getItem("smartui_data"));
      const index = updatedData.utrnRows.findIndex(e => e.utrn === newEntry.utrn);
      if (index !== -1) updatedData.utrnRows[index] = newEntry;
      localStorage.setItem("smartui_data", JSON.stringify(updatedData));

      console.log("✅ UTRN applied and updated in localStorage:", newEntry);
    }, delay);
  });
});

function generate20DigitUTRN() {
  let utrn = "";
  for (let i = 0; i < 20; i++) {
    utrn += Math.floor(Math.random() * 10);
  }
  return utrn;
}