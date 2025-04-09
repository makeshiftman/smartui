// --- Full Corrected Code for: /smartui/scripts/ondemandreads-loader.js ---

document.addEventListener('DOMContentLoaded', () => {
    // Get references to the key HTML elements
    const dateInput = document.getElementById("MR_On_Demand_Date");
    const executeBtn = document.getElementById("executeOnDemandReads");
    const tableBody = document.getElementById("ondemandreads-table"); // This element MUST exist in the HTML
    const tableWrapper = tableBody ? tableBody.closest('.utrn-frame') : null; // Optional: find parent wrapper

    /**
     * Parses a "DD.MM.YYYY" string into a JavaScript Date object (at midnight UTC).
     * Returns null if the format is invalid or the date doesn't make sense.
     * @param {string} dateStr - The date string in "DD.MM.YYYY" format.
     * @returns {Date | null} - The corresponding Date object or null if invalid.
     */
    function parseUKDate(dateStr) {
        if (!dateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
            // console.error("Invalid UK date string format:", dateStr); // Keep console logs minimal unless debugging
            return null;
        }
        const parts = dateStr.split(".");
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10); // Month from string is 1-12
        const year = parseInt(parts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
            // console.error("Invalid date components after parsing:", dateStr);
            return null;
        }
        // Create Date object using UTC to avoid timezone issues; month is 0-indexed
        const date = new Date(Date.UTC(year, month - 1, day));

        // Verify that the created date matches the input components (e.g., handles Feb 30th)
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
            // console.error("Date object mismatch (invalid date like Feb 30?):", dateStr);