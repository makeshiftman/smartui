// initial-display-handler.js

// Wait until the main HTML structure is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("Initial display handler: DOM loaded. Starting check for data...");

    const checkInterval = 100; // Check every 100 milliseconds
    const maxWaitTime = 5000; // Wait a maximum of 5 seconds
    let timeWaited = 0;

    // Define the function that displays the reads (replace with actual name!)
    function displayLatestReads() {
         // This is where the logic to get data from localStorage 
         // and update the HTML display lives.
         console.log("Executing displayLatestReads()..."); 
         // --- Add the actual logic here or ensure the real function is accessible ---
         const dataString = localStorage.getItem("smartui_data");
         if (dataString) {
             const data = JSON.parse(dataString);
             if (data && data.storedMeterReads) {
                 console.log("Found stored reads, calling populate function...");
                 // Example: populateMeterReadTable(data.storedMeterReads); // Replace with your actual function call
             } else { console.warn("Stored reads not found in parsed data."); }
         } else { console.error("Could not get 'smartui_data' from localStorage."); }
         // --- End of display logic ---
    }


    const intervalId = setInterval(() => {
        // Check if the data is in localStorage
        if (localStorage.getItem("smartui_data")) {
            console.log("Initial display handler: Found smartui_data in localStorage!");
            clearInterval(intervalId); // Stop checking

            // Now, trigger the display function
             if (typeof displayLatestReads === 'function') { 
                 displayLatestReads(); 
             } else {
                 console.error("Error: The function 'displayLatestReads' is not defined!");
             }

        } else {
            // Data not found yet, check if we've waited too long
            timeWaited += checkInterval;
            if (timeWaited >= maxWaitTime) {
                clearInterval(intervalId); // Stop checking
                console.error("Initial display handler: Timed out waiting for smartui_data in localStorage.");
            } else {
                // Optional: Log that we're still waiting
                // console.log("Initial display handler: Waiting for data...");
            }
        }
    }, checkInterval);

}); // End of DOMContentLoaded listener