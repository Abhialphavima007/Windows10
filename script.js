/* script.js — Windows 10-like behavior
   - start menu toggle
   - taskbar icons open windows
   - desktop icons interactions
   - context menu with Next background & Refresh
   - wallpaper rotation
   - simple draggable windows
*/

document.addEventListener("DOMContentLoaded", () => {
  const desktop = document.getElementById("desktop");
  const ctx = document.getElementById("desktopContext");
  const startBtn = document.getElementById("startBtn");
  const startMenu = document.getElementById("startMenu");
  const taskbarIcons = document.getElementById("taskbarIcons");

  // Wallpaper list (update path if needed)
  const wallpapers = [
    "linear-gradient(180deg,#0a3b78 0%, #08325f 100%)",
    "url('/mnt/data/4ee4b356-1478-428e-836a-9de5fa88d3ff.png')",
    "linear-gradient(180deg,#1f4068 0%, #203a5a 100%)",
  ];
  let currentWallpaper = 0;
  const setWallpaper = (index) => {
    document.body.style.backgroundImage = wallpapers[index];
    currentWallpaper = index;
  };

  // initialize
  setWallpaper(0);

  /* ---------------------
     Context (right-click) menu
     --------------------- */
  let menuOpen = false;

  desktop.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const x = e.clientX;
    const y = e.clientY;
    showMenu(x, y);
  });

  // Hide menu on mousedown outside (mousedown chosen so clicks still register)
  document.addEventListener("mousedown", (e) => {
    if (menuOpen && !e.target.closest(".context-menu")) {
      hideMenu();
    }
  });

  function showMenu(x, y) {
    ctx.style.display = "block";
    ctx.setAttribute("aria-hidden", "false");
    menuOpen = true;
    positionElementInViewport(ctx, x, y);
  }

  function hideMenu() {
    ctx.style.display = "none";
    ctx.setAttribute("aria-hidden", "true");
    menuOpen = false;
  }

  function positionElementInViewport(el, x, y) {
    const rect = el.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth)
      left = window.innerWidth - rect.width - 10;
    if (top + rect.height > window.innerHeight)
      top = window.innerHeight - rect.height - 10;
    el.style.left = left + "px";
    el.style.top = top + "px";
  }

  // Context menu actions
  const nextBgBtn = document.getElementById("ctx-next-bg");
  const refreshBtn = document.getElementById("refresh");

  nextBgBtn.addEventListener("click", () => {
    const next = (currentWallpaper + 1) % wallpapers.length;
    setWallpaper(next);
    hideMenu();
  });

  refreshBtn.addEventListener("click", () => {
    location.reload();
  });

  /* ---------------------
     Desktop icons behavior
     --------------------- */
  function initIcon(ic) {
    ic.addEventListener("click", (ev) => {
      ev.stopPropagation();
      document
        .querySelectorAll(".icon")
        .forEach((i) => i.classList.remove("selected"));
      ic.classList.add("selected");
    });

    ic.addEventListener("dblclick", () => openWindow(ic.dataset.name));

    ic.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const rect = ic.getBoundingClientRect();
      // show context menu to the right of icon (like windows)
      showMenu(rect.right + 6, rect.top + 6);
    });
  }

  document.querySelectorAll(".icon").forEach(initIcon);

  /* ---------------------
     Simple window system
     --------------------- */
  let z = 50;

  function openWindow(title = "App", content = "") {
    const w = document.createElement("div");
    w.className = "window";
    w.style.left = 150 + Math.random() * 200 + "px";
    w.style.top = 100 + Math.random() * 120 + "px";
    w.style.zIndex = ++z;

    w.innerHTML = `
      <div class="titlebar" role="toolbar">
        <div class="title">${title}</div>
        <div class="controls">
          <button class="min" aria-label="Minimize">—</button>
          <button class="max" aria-label="Maximize">□</button>
          <button class="close" aria-label="Close">✕</button>
        </div>
      </div>
      <div class="content">${content || title + " window content"}</div>
    `;
    document.body.appendChild(w);

    // close
    const closeBtn = w.querySelector(".close");
    closeBtn.addEventListener("click", () => w.remove());

    // basic min (hide) behavior
    const minBtn = w.querySelector(".min");
    minBtn.addEventListener("click", () => {
      w.style.display = "none"; /* could add a taskbar restore later */
    });

    // basic max toggle
    const maxBtn = w.querySelector(".max");
    maxBtn.addEventListener("click", () => {
      if (w.dataset.max === "1") {
        // restore
        w.style.width = "700px";
        w.style.height = "420px";
        w.dataset.max = "0";
      } else {
        w.style.left = "10px";
        w.style.top = "10px";
        w.style.width = window.innerWidth - 20 + "px";
        w.style.height = window.innerHeight - 20 + "px";
        w.dataset.max = "1";
      }
    });

    // bring to front on mousedown
    w.addEventListener("mousedown", () => (w.style.zIndex = ++z));
    makeDraggable(w);
    return w;
  }

  function makeDraggable(el) {
    const bar = el.querySelector(".titlebar");
    let dragging = false,
      sx = 0,
      sy = 0,
      lx = 0,
      ly = 0;

    bar.addEventListener("mousedown", (e) => {
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      lx = parseInt(el.style.left) || 0;
      ly = parseInt(el.style.top) || 0;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      el.style.left = lx + (e.clientX - sx) + "px";
      el.style.top = ly + (e.clientY - sy) + "px";
    });

    document.addEventListener("mouseup", () => {
      dragging = false;
      document.body.style.userSelect = "auto";
    });
  }

  /* ---------------------
     Start menu behaviors
     --------------------- */
  // Always start closed
  startMenu.style.display = "none";

  // Toggle on Start button click
  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = startMenu.style.display === "block";
    startMenu.style.display = isOpen ? "none" : "block";
  });

  // Close start menu when clicking anywhere else
  document.addEventListener("click", (e) => {
    const clickedStart = e.target.closest("#startBtn");
    const clickedMenu = e.target.closest("#startMenu");

    if (!clickedStart && !clickedMenu) {
      startMenu.style.display = "none";
    }
  });

  /* ---------------------
     Taskbar icons behaviors
     --------------------- */
  Array.from(taskbarIcons.querySelectorAll(".app")).forEach((a) => {
    a.addEventListener("click", () => {
      const app = a.dataset.app || a.title || "App";
      if (app === "explorer")
        openWindow("File Explorer", "This is a mock File Explorer");
      else if (app === "browser")
        openWindow("Browser", "This is a mock Browser");
      else if (app === "mail") openWindow("Mail", "This is a mock Mail app");
      else if (app === "music") openWindow("Music", "This is a mock Music app");
    });
  });

  /* ---------------------
     Clock
     --------------------- */
  function tick() {
    const d = new Date();
    const timeEl = document.getElementById("sysTime");
    if (timeEl) {
      timeEl.textContent =
        d.getHours().toString().padStart(2, "0") +
        ":" +
        d.getMinutes().toString().padStart(2, "0");
    }
  }
  setInterval(tick, 1000);
  tick();
});
