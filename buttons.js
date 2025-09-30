(function () {
  if (window.matchMedia("(display-mode: standalone)").matches === false) {
    return; // Exit if not in PWA mode
  }

  if (document.getElementById("global-nav-buttons")) return; // prevent duplicates

  const siteKey = "navButtonsPos:" + location.hostname;
  const loadingKey = "navLoading:" + location.hostname;

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
  function createBtn(icon, title, action, id = "") {
    const btn = document.createElement("button");
    btn.className = "global-nav-btn";
    if (id) btn.id = id;
    btn.innerHTML = icon;
    btn.title = title;
    btn.onclick = action;
    return btn;
  }

  // Buttons
  const backBtn = createBtn(
    `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z"/></svg>`,
    "Back",
    () => {
      startLoading();
      history.back();
    }
  );

  const reloadBtn = createBtn(
    `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5a5 5 0 01-5 5 5 5 0 01-4.9-4H6.08c.5 3.39 3.4 6 6.92 6a7 7 0 000-14z"/></svg>`,
    "Reload",
    () => {
      startLoading();
      location.reload();
    },
    "reload-btn"
  );

  const forwardBtn = createBtn(
    `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11v2h11.17l-5.58 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H5z"/></svg>`,
    "Forward",
    () => {
      startLoading();
      history.forward();
    }
  );

  bar.appendChild(backBtn);
  bar.appendChild(reloadBtn);
  bar.appendChild(forwardBtn);

  document.body.appendChild(bar);

  // ---- Dragging logic ----
  let isDragging = false;
  let offsetX, offsetY;

  bar.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return; // don't drag when clicking buttons
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

  // ---- Page Loading Indicator (Works for both SPA and Regular Pages) ----
  const reloadButton = document.getElementById("reload-btn");
  let loadingTimeout = null;
  let spaTimeout = null;

  function startLoading() {
    sessionStorage.setItem(loadingKey, "true");
    reloadButton.classList.add("loading");
    
    // Clear any existing timeouts
    if (loadingTimeout) clearTimeout(loadingTimeout);
    if (spaTimeout) clearTimeout(spaTimeout);
    
    // Fallback: auto-stop after 5 seconds for safety
    loadingTimeout = setTimeout(stopLoading, 5000);
  }
  
  function stopLoading() {
    sessionStorage.removeItem(loadingKey);
    reloadButton.classList.remove("loading");
    
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    if (spaTimeout) {
      clearTimeout(spaTimeout);
      spaTimeout = null;
    }
  }

  // Check if we should show loading on page load
  if (sessionStorage.getItem(loadingKey) === "true") {
    reloadButton.classList.add("loading");
  }

  // Stop loading immediately if page is already complete (for regular pages)
  if (document.readyState === "complete") {
    stopLoading();
  }

  // Listen for all link clicks
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && link.href) {
      try {
        const url = new URL(link.href, location.href);
        // Only trigger for same-origin links that aren't new tabs or anchors
        if (url.origin === location.origin && !link.target && url.pathname !== location.pathname) {
          startLoading();
        }
      } catch (err) {
        // Invalid URL, ignore
      }
    }
  }, true);

  // Listen for form submissions
  document.addEventListener("submit", () => {
    startLoading();
  }, true);

  // ---- For Regular Page Loads ----
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
      stopLoading();
    }
  });

  window.addEventListener("load", () => {
    stopLoading();
  });

  // Handle back/forward cache (for regular pages)
  window.addEventListener("pageshow", (e) => {
    stopLoading();
  });

  // ---- For SPA Navigation ----
  let lastUrl = location.href;
  
  // MutationObserver to detect DOM changes (SPA navigation)
  const observer = new MutationObserver((mutations) => {
    // Check if URL changed
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      
      // Clear existing SPA timeout
      if (spaTimeout) clearTimeout(spaTimeout);
      
      // Give SPA time to render content, then stop loading
      spaTimeout = setTimeout(() => {
        if (sessionStorage.getItem(loadingKey) === "true") {
          stopLoading();
        }
      }, 800);
    }
    
    // Check for significant content changes while loading
    if (sessionStorage.getItem(loadingKey) === "true") {
      const hasSignificantChanges = mutations.some(mutation => {
        return mutation.addedNodes.length > 3 || 
               (mutation.addedNodes.length > 0 && 
                Array.from(mutation.addedNodes).some(node => 
                  node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE'
                ));
      });
      
      if (hasSignificantChanges) {
        // Clear existing SPA timeout
        if (spaTimeout) clearTimeout(spaTimeout);
        
        // Content is changing, wait a bit more
        spaTimeout = setTimeout(() => {
          if (sessionStorage.getItem(loadingKey) === "true") {
            stopLoading();
          }
        }, 600);
      }
    }
  });

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for popstate (back/forward navigation)
  window.addEventListener("popstate", () => {
    startLoading();
  });

  // Intercept History API for SPAs
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    startLoading();
    const result = originalPushState.apply(this, args);
    return result;
  };

  history.replaceState = function(...args) {
    const result = originalReplaceState.apply(this, args);
    return result;
  };
})();