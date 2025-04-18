console.log("✅ Active version: walkthrough-dropdown-handler.js (Updated 18 April 17:05)");

document.addEventListener('DOMContentLoaded', () => {
  const walkthroughMenu = document.getElementById('Smart_Menu_Bar');
  if (!walkthroughMenu) return;

  const walkthroughs = [
    { label: "Standard Walkthrough", url: "../html/openingpage.html" },
    { label: "Bronze Walkthrough", url: "../html/htmlbronze/openingpageBRONZE.html" },
    { label: "Silver Walkthrough", url: "../html/htmlsilver/openingpageSILVER.html" },
    { label: "Gold Walkthrough", url: "../html/htmlgold/openingpageGOLD.html" }
  ];

  walkthroughMenu.innerHTML = '<option value="">Choose walkthrough</option>';
  walkthroughs.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w.url;
    opt.textContent = w.label;
    walkthroughMenu.appendChild(opt);
  });

  walkthroughMenu.addEventListener('change', () => {
    const selected = walkthroughMenu.value;
    if (selected) {
      window.location.href = selected;
    }
  });
});
