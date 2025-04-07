const executeBtn = document.getElementById("executeStoredReads");
const tableWrapper = document.getElementById("storedreads-frame");
const tableBody = document.getElementById("storedreads-table");

if (executeBtn && tableWrapper && tableBody) {
  executeBtn.addEventListener("click", e => {
    e.preventDefault();

    // ✅ Get the correct data source
    const selectedRange = document.querySelector("input[name='SMRrange']:checked")?.value;
    const scenario = JSON.parse(localStorage.getItem("smartui_data") || "{}");
    let rows = scenario.storedMeterReads || [];

    if (selectedRange === "custom") {
      const fromInput = document.getElementById("StoredMR_Date_From").value;
      const toInput = document.getElementById("StoreMR_Date_To").value;
      if (!fromInput || !toInput) {
        alert("Please enter both FROM and TO dates.");
        return;
      }

      const fromDate = parseUKDate(fromInput);
      const toDate = parseUKDate(toInput);
      if (fromDate > toDate) {
        alert("FROM date must be before TO date.");
        return;
      }

      rows = rows.filter(row => {
        const rowDate = new Date();
        rowDate.setDate(rowDate.getDate() + row.offset);
        rowDate.setHours(0, 0, 0, 0);
        return rowDate >= fromDate && rowDate <= toDate;
      });
    } else {
      const rowsToShow = parseInt(selectedRange, 10);
      rows = rows
        .sort((a, b) => a.offset - b.offset)
        .slice(-rowsToShow);
    }

    tableBody.innerHTML = "";

    let previousTotal = null;

    rows.forEach(row => {
      const date = new Date();
      date.setDate(date.getDate() + row.offset);
      const formattedDate = date.toLocaleDateString("en-GB").split("/").join("-");
      const datetime = `${formattedDate} 00:00`;

      const total = calculateTotal(row);
      const average = previousTotal !== null ? Math.round(total - previousTotal) : "";

      const div = document.createElement("div");
      div.className = "table-row";
      div.innerHTML = `
        <div>${datetime}</div>
        <div>${row.register1 || ""}</div>
        <div>${row.register2 || ""}</div>
        <div>${row.register3 || ""}</div>
        <div>${row.register4 || ""}</div>
        <div>${total}</div>
        <div>${average}</div>
      `;
      tableBody.appendChild(div);
      previousTotal = total;
    });

    tableWrapper.style.display = "block";
  });
}

function calculateTotal(row) {
  const values = [row.register1, row.register2, row.register3, row.register4]
    .map(val => parseFloat(val)).filter(val => !isNaN(val));
  if (values.length === 0) return 0;
  return Math.round(values.reduce((acc, val) => acc + val, 0));
}

function parseUKDate(dateStr) {
  const [day, month, year] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}