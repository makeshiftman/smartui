// ✅ Active version: utrn-generate-handler.js (Updated 13 April 17:08)

document.addEventListener("DOMContentLoaded", () => {
  const executeBtn = document.getElementById("utrnGenerateExecute");
  const amountInput = document.getElementById("utrn_Generate_Amount");
  const reasonDropdown = document.getElementById("UTRN_Generate_Reason");

  const resultField = document.getElementById("utrn_generated_result");
  const valueField = document.getElementById("utrn_generated_value");
  const channelField = document.getElementById("utrn_generated_channel");
  const statusField = document.getElementById("utrn_generated_status");

  function generate20DigitNumber() {
    let number = "";
    for (let i = 0; i < 20; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return number;
  }

  function getCurrentTimeFormatted() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  if (executeBtn && amountInput && reasonDropdown) {
    executeBtn.addEventListener("click", () => {
      const valueRaw = parseFloat(amountInput.value);
      const selectedReason = reasonDropdown.querySelector(".selected-option")?.textContent.trim();

      if (isNaN(valueRaw) || valueRaw < 1 || valueRaw > 500) {
        alert("Please enter a valid amount between 1 and 500.");
        return;
      }
      if (!selectedReason) {
        alert("Please select a reason for UTRN generation.");
        return;
      }

      const formattedValue = valueRaw.toFixed(2);
      const createdTime = getCurrentTimeFormatted();
      const newUTRN = {
        createdOffset: 0,
        appliedOffset: null,
        value: formattedValue,
        type: "Manual",
        utrn: generate20DigitNumber(),
        channel: "SMART_UI - Non Payme",
        status: "UTRN generated",
        auth: null,
        createdTime: createdTime,
        appliedTime: null,
        reason: selectedReason
      };

      const scenarioRaw = localStorage.getItem("smartui_data");
      const scenarioData = scenarioRaw ? JSON.parse(scenarioRaw) : {};
      if (!Array.isArray(scenarioData.utrnRows)) scenarioData.utrnRows = [];

      scenarioData.utrnRows.push(newUTRN);
      localStorage.setItem("smartui_data", JSON.stringify(scenarioData));

      // Fill result fields
      if (resultField) resultField.value = newUTRN.utrn;
      if (valueField) valueField.value = newUTRN.value;
      if (channelField) channelField.value = newUTRN.channel;
      if (statusField) statusField.value = newUTRN.status;

      // Schedule UTRN application
      const delay = Math.floor(Math.random() * (97 - 20 + 1) + 20) * 1000;
      setTimeout(() => {
        const applyTime = new Date();
        const applyTimeStr = \`\${String(applyTime.getHours()).padStart(2, "0")}:\${String(applyTime.getMinutes()).padStart(2, "0")}\`;
        newUTRN.appliedOffset = 0;
        newUTRN.appliedTime = applyTimeStr;
        newUTRN.status = "UTRN applied";
        localStorage.setItem("smartui_data", JSON.stringify(scenarioData));
        console.log("UTRN applied:", newUTRN.utrn);
      }, delay);

      console.log("✅ UTRN generated and stored:", newUTRN);
    });
  } else {
    console.warn("UTRN Generate button or input fields not found.");
  }
});
