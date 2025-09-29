(function () {
  if (document.getElementById("yt-nav-buttons")) return; // prevent duplicates

  // Find the YouTube header start section
  const target = document.querySelector("#start");
  if (!target) return;

  // Create toolbar
  const bar = document.createElement("div");
  bar.id = "yt-nav-buttons";

  // Helper to create a button
  function createBtn(icon, title, action) {
    const btn = document.createElement("button");
    btn.className = "yt-nav-btn";
    btn.innerHTML = icon; // SVG icon
    btn.title = title;
    btn.onclick = action;
    return btn;
  }

  // Buttons with SVG icons
  const backBtn = createBtn(
    `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z"/></svg>`,
    "Back",
    () => history.back()
  );

  const reloadBtn = createBtn(
    `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5a5 5 0 01-5 5 5 5 0 01-4.9-4H6.08c.5 3.39 3.4 6 6.92 6a7 7 0 000-14z"/></svg>`,
    "Reload",
    () => location.reload()
  );

  const forwardBtn = createBtn(
    `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11v2h11.17l-5.58 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H5z"/></svg>`,
    "Forward",
    () => history.forward()
  );

  // Append buttons
  bar.appendChild(backBtn);
  bar.appendChild(reloadBtn);
  bar.appendChild(forwardBtn);

  // Insert next to logo
  target.appendChild(bar);
})();
