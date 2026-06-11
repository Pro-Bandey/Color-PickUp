window.Notify = class {
  constructor() {
    this.fragment = document.createRange().createContextualFragment(`
      <style>
        .notifyContainer {
          bottom: 16px;
          right: 16px;
          position: fixed;
          z-index: 9999;
          font-family: var(--fontSans, sans-serif);
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        }
        .notifyItem {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid var(--borderColor);
          background-color: var(--surfaceColor);
          color: var(--textColor);
          box-shadow: var(--shadowSubtle);
          pointer-events: auto;
          position: relative;
          min-width: 260px;
          max-width: 340px;
          animation: slideInNotify 0.2s ease-out;
        }
        @keyframes slideInNotify {
          from {
            transform: translateY(12px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .notifyContent {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .notifyTitle {
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .notifyText {
          font-size: 12px;
          line-height: 1.4;
          word-break: break-all;
          color: var(--textColorMuted);
        }
        .notifyCloseButton {
          background: transparent;
          border: none;
          color: var(--textColorMuted);
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
          padding: 2px 6px;
          border-radius: 4px;
          transition: background-color 0.15s ease;
        }
        .notifyCloseButton:hover {
          background-color: var(--surfaceColorHover);
          color: var(--textColor);
        }
        .notifyIcon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .warningNotification .notifyIcon { fill: #d97706; }
        .errorNotification .notifyIcon { fill: #dc2626; }
        .infoNotification .notifyIcon { fill: var(--accentColor); }
      </style>
      
      <div class="notifyItem">
        <div class="notifyContent">
          <b class="notifyTitle">Notification</b>
          <span class="notifyText">Placeholder Text</span>
        </div>
        <button type="button" class="notifyCloseButton">&times;</button>
      </div>

      <svg data-id="warning" class="notifyIcon" viewBox="0 0 16 16">
        <path d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"></path>
      </svg>
      <svg data-id="error" class="notifyIcon" viewBox="0 0 16 16">
        <path d="M7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 1.3c1.3 0 2.5.44 3.47 1.17l-8 8A5.755 5.755 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zm0 11.41c-1.3 0-2.5-.44-3.47-1.17l8-8c.73.97 1.17 2.17 1.17 3.47 0 3.14-2.56 5.7-5.7 5.7z"></path>
      </svg>
      <svg data-id="info" class="notifyIcon" viewBox="0 0 16 16">
        <path d="M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"></path>
      </svg>
    `);

    document.head.appendChild(this.fragment.querySelector("style"));

    let root = document.querySelector(".notifyContainer");
    if (!root) {
      root = document.createElement("div");
      root.classList.add("notifyContainer");
      document.body.appendChild(root);
    }
    this.root = root;
  }

  display(message, type = "info", delay = 4000) {
    const item = this.fragment.querySelector(".notifyItem").cloneNode(true);
    item.querySelector(".notifyTitle").textContent = type;
    item.querySelector(".notifyText").textContent = message;

    const closeBtn = item.querySelector(".notifyCloseButton");
    closeBtn.onclick = () => { item.remove(); };

    item.classList.add(`${type}Notification`);

    const originalIcon = this.fragment.querySelector(`svg[data-id="${type}"]`);
    if (originalIcon) {
      const icon = originalIcon.cloneNode(true);
      item.insertBefore(icon, item.firstChild);
    }

    this.root.appendChild(item);
    window.setTimeout(() => {
      if (item.parentNode) {
        item.remove();
      }
    }, delay);
  }
};