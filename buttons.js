(function () {
  if (document.getElementById("global-nav-buttons")) return; // prevent duplicates

  const siteKey = "navButtonsPos:" + location.hostname;

  // Load saved position from localStorage
  let savedPos = JSON.parse(localStorage.getItem(siteKey) || "null");

  // Create toolbar
  const bar = document.createElement("div");
  bar.id = "global-nav-buttons";

  // Apply saved position if available
  if (savedPos) {
    bar.style.top = savedPos.top;
    bar.style.left = savedPos.left;
  }

  // Helper to create a button
  function createBtn(icon, title, action) {
    const btn = document.createElement("button");
    btn.className = "global-nav-btn";
    btn.innerHTML = icon;
    btn.title = title;
    btn.onclick = action;
    return btn;
  }

  // Buttons
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

  bar.appendChild(backBtn);
  bar.appendChild(reloadBtn);
  bar.appendChild(forwardBtn);

  document.body.appendChild(bar);

  // ---- Dragging logic ----
  let isDragging = false;
  let offsetX, offsetY;

  bar.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return; // don’t drag when clicking buttons
    isDragging = true;
    offsetX = e.clientX - bar.offsetLeft;
    offsetY = e.clientY - bar.offsetTop;
    bar.style.transition = "none"; // disable smooth repositioning while dragging
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    bar.style.left = e.clientX - offsetX + "px";
    bar.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    bar.style.transition = ""; // restore smooth movement
    // Save position
    localStorage.setItem(
      siteKey,
      JSON.stringify({ top: bar.style.top, left: bar.style.left })
    );
  });
})();
