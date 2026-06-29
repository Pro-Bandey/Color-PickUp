const config = {
  clipboard: "",
  addon: {
    getHomepageUrl: function () {
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest) {
        return chrome.runtime.getManifest().homepage_url;
      }
      return "https://Pro-Bandey.github.io/?id==Color-PickUp";
    }
  },
  notifications: {
    create: function (message) {
      if (typeof Notify !== "undefined") {
        const notify = new Notify();
        notify.display(message, "info");
      } else {
        console.info(message);
      }
    }
  },
  copy: {
    copyListener: function (e) {
      e.clipboardData.setData("text/plain", config.clipboard);
      e.preventDefault();
    },
    copyToClipboard: async function () {
      try {
        const result = await navigator.permissions.query({ name: "clipboard-write" });
        if (result.state === "granted" || result.state === "prompt") {
          await navigator.clipboard.writeText(config.clipboard);
        }
      } catch (err) {
        document.execCommand("copy");
      }
    }
  },
  resize: {
    timeoutId: null,
    updateWindowSize: function () {
      const context = document.documentElement.getAttribute("context");
      if (context === "win" && typeof chrome !== "undefined" && chrome.windows) {
        if (config.resize.timeoutId) {
          window.clearTimeout(config.resize.timeoutId);
        }
        config.resize.timeoutId = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
          config.storage.writeValue("interfaceSize", {
            top: current.top,
            left: current.left,
            width: current.width,
            height: current.height
          });
        }, 1000);
      }
    }
  },
  updateColorInfo: function (color) {
    if (color) {
      config.storage.writeValue("colorPickerCurrent", color);

      const pickerNative = document.getElementById("pickerNative");
      const titleHeaderHeading = document.getElementById("titleHeaderHeading");
      if (pickerNative) {
        pickerNative.value = color;
        pickerNative.parentNode.style.backgroundColor = color;
        titleHeaderHeading.style.color = color;
        document.documentElement.style.setProperty('--accentColor', `${color}`);
      }

      const detailsElement = document.getElementById("colorDetails");
      if (detailsElement) {
        detailsElement.textContent = "";
        config.color.addNumericValues(detailsElement, color, null);
        config.color.addNumericValues(detailsElement, color, "hexToHsb");
        config.color.addNumericValues(detailsElement, color, "hexToRgb");
        config.color.addNumericValues(detailsElement, color, "hexToHsl");
        config.color.addNumericValues(detailsElement, color, "hexToHwb");
        config.color.addNumericValues(detailsElement, color, "hexToCmyk");
      }
    }
  },
  storage: {
    localCache: {},
    readValue: function (id) {
      return config.storage.localCache[id];
    },
    loadValues: function (callback) {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(null, function (items) {
          config.storage.localCache = items;
          callback();
        });
      } else {
        config.storage.localCache = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          try {
            config.storage.localCache[key] = JSON.parse(localStorage.getItem(key));
          } catch (e) {
            config.storage.localCache[key] = localStorage.getItem(key);
          }
        }
        callback();
      }
    },
    writeValue: function (id, data) {
      if (id) {
        if (data !== "" && data !== null && data !== undefined) {
          config.storage.localCache[id] = data;
          if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
            const temp = {};
            temp[id] = data;
            chrome.storage.local.set(temp);
          } else {
            localStorage.setItem(id, JSON.stringify(data));
          }
        } else {
          delete config.storage.localCache[id];
          if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
            chrome.storage.local.remove(id);
          } else {
            localStorage.removeItem(id);
          }
        }
      }
    }
  },
  portConnection: {
    name: "",
    establish: function () {
      config.portConnection.name = "webapp";
      const context = document.documentElement.getAttribute("context");

      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.connect) {
        if (context !== config.portConnection.name) {
          if (document.location.search === "?tab") config.portConnection.name = "tab";
          if (document.location.search === "?win") config.portConnection.name = "win";
          if (document.location.search === "?popup") config.portConnection.name = "popup";

          if (config.portConnection.name === "popup") {
            document.documentElement.style.width = "770px";
            document.documentElement.style.height = "570px";
          }

          chrome.runtime.connect({ name: config.portConnection.name });
        }
      }

      document.documentElement.setAttribute("context", config.portConnection.name);
    }
  },
  renderPaletteTiles: function (key, isOpen) {
    const selectorClass = `.${key}Tiles`;
    const tilesElement = document.querySelector(selectorClass);
    if (!tilesElement) return;

    tilesElement.textContent = "";

    if (isOpen && config.color[key]) {
      const fragment = document.createDocumentFragment();
      const listLength = config.color[key].list ? config.color[key].list.length : 0;

      for (let i = 0; i < listLength; i++) {
        const input = document.createElement("input");
        const storedSize = config.storage.readValue("tileSize");
        const size = storedSize !== undefined ? storedSize : config.color.jsSettings.tile.size;

        input.addEventListener("click", function (e) {
          config.color.storePickedColor(key, e.target.getAttribute("color"));
        });

        document.documentElement.style.setProperty("--tileHeight", `${size}px`);
        document.documentElement.style.setProperty("--tileWidth", `${size}px`);

        const colorVal = config.color[key].list[i];
        input.style.backgroundColor = colorVal;
        input.setAttribute("color", colorVal);
        input.setAttribute("readonly", "true");
        input.setAttribute("type", "text");

        if (colorVal === config.color[key].current) {
          input.value = "✓";
          input.style.boxShadow = "0 0 0 1.5px var(--accentColor), var(--shadowSubtle)";
        }

        fragment.appendChild(input);
      }

      tilesElement.appendChild(fragment);
    }

    config.resize.updateWindowSize();
  },
  app: {
    initialize: async function () {
      const sizeInput = document.getElementById("sizeInput");
      const pickerNative = document.getElementById("pickerNative");
      const detailAccordions = [...document.querySelectorAll(".paletteAccordion")];
      const currentActiveColor = config.storage.readValue("colorPickerCurrent");

      if (pickerNative) {
        pickerNative.parentNode.style.background = "url('src/192.png') no-repeat center";
        pickerNative.parentNode.style.backgroundSize = "contain";
      }

      const initialSize = config.storage.readValue("tileSize") !== undefined
        ? config.storage.readValue("tileSize")
        : config.color.jsSettings.tile.size;

      if (sizeInput) {
        sizeInput.value = initialSize;
      }

      document.documentElement.setAttribute(
        "theme",
        config.storage.readValue("theme") !== undefined ? config.storage.readValue("theme") : "light"
      );

      for (let i = 0; i < detailAccordions.length; i++) {
        detailAccordions[i].addEventListener("click", function (e) {
          if (e.target.tagName.toLowerCase() === "summary") {
            const indexValue = parseInt(this.getAttribute("index"), 10);
            if (indexValue > -1) {
              const key = config.color.jsSettings.keys[indexValue];
              const value = config.color.jsSettings.values[indexValue];
              const list = config.storage.readValue(`color-${key}-list`);
              const current = config.storage.readValue(`color-${key}-current`);

              config.color[key] = {};
              config.color[key].list = list !== undefined ? list : value;
              config.color[key].current = current !== undefined ? current : (value && value.length ? value[0] : "");

              config.renderPaletteTiles(key, this.open === false);
            }
          }
        });
      }

      for (let i = 0; i < config.color.jsSettings.max.detailsToLoad; i++) {
        const accordion = document.querySelector(`.paletteAccordion[index='${i}']`);
        if (accordion) {
          const summary = accordion.querySelector(".paletteSummary");
          if (summary) summary.click();
        }
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }

      if (currentActiveColor) {
        config.updateColorInfo(currentActiveColor);
      } else {
        const defaultInput = document.querySelector("input[color='#3b82f6']");
        if (defaultInput) {
          defaultInput.click();
        } else {
          config.updateColorInfo("#b48ead");
        }
      }
    }
  },
  color: {
    jsSettings: {
      values: [
        [],
        window.artisticPalette || [],
        window.bluishPalette || [],
        window.favoritePalette || [],
        window.uiDesignPalette || [],
        window.popularPalette || [],
        window.drawingPalette || [],
        window.gamePalette || [],
        window.css3Palette || [],
        window.materialPalette || [],
        window.rainbowPalette || [],
        window.spectrumPalette || [],
        window.safePalette || [],
        window.randomPalette || [],
        window.monitorPalette || [],
        window.comicPalette || [],
        window.largePalette || [],
        window.huesPalette || []
      ],
      keys: [
        "user", "artistic", "bluish", "favorite", "uiDesign", "popular", "drawing", "game",
        "css3", "material", "rainbow", "spectrum", "safe", "random", "monitor",
        "comic", "large", "hues"
      ],
      tile: {
        size: 28
      },
      max: {
        detailsToLoad: 6
      }
    },
    addNumericValues: function (parent, color, method) {
      const input = document.createElement("input");
      input.setAttribute("type", "text");
      input.setAttribute("readonly", "true");
      input.className = "colorCodeInput";
      input.value = method ? config.convert[method](color) : color;
      input.style.textTransform = method ? "none" : "uppercase";
      parent.appendChild(input);

      input.addEventListener("click", function (e) {
        const message = `Copied to clipboard: ${e.target.value}`;
        config.notifications.create(message);
        config.clipboard = e.target.value;
        config.copy.copyToClipboard();
      });
    },
    storePickedColor: function (key, current) {
      if (current) {
        config.updateColorInfo(current);
      }
      if (key) {
        if (key === "user") {
          if (current) {
            let list = config.color.user.list || [];
            list.push(current);
            list = [...new Set(list)];
            while (list.length > 100) {
              list.shift();
            }
            config.color.user.list = list;
            config.color.user.current = current;
          } else {
            config.color.user.list = [];
            config.color.user.current = "";
          }

          config.storage.writeValue("color-user-list", config.color.user.list);
          config.storage.writeValue("color-user-current", config.color.user.current);
          config.renderPaletteTiles("user", true);
        } else {
          if (config.color[key]) {
            config.color[key].current = current;
            config.storage.writeValue(`color-${key}-current`, config.color[key].current);
            config.renderPaletteTiles(key, true);
          }
        }
      }
    }
  },
  convert: {
    hexToRgb: function (hex) {
      const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!match) return "RGB(184, 39, 179)";
      const r = parseInt(match[1], 16);
      const g = parseInt(match[2], 16);
      const b = parseInt(match[3], 16);
      return `RGB(${r}, ${g}, ${b})`;
    },
    hexToCmyk: function (hex) {
      const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!match) return "CMYK(0%, 0%, 0%, 100%)";
      let r = parseInt(match[1], 16) / 255;
      let g = parseInt(match[2], 16) / 255;
      let b = parseInt(match[3], 16) / 255;

      const max = Math.max(r, g, b);
      const k = 1 - max;
      if (k === 1) {
        return "CMYK(0%, 0%, 0%, 100%)";
      }
      const c = (1 - r - k) / (1 - k);
      const m = (1 - g - k) / (1 - k);
      const y = (1 - b - k) / (1 - k);

      return `CMYK(${Math.floor(c * 100)}%, ${Math.floor(m * 100)}%, ${Math.floor(y * 100)}%, ${Math.floor(k * 100)}%)`;
    },
    hexToHwb: function (hex) {
      const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!match) return "HWB(0, 0%, 100%)";
      const r = parseInt(match[1], 16) / 255;
      const g = parseInt(match[2], 16) / 255;
      const b = parseInt(match[3], 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      let h = 0;
      if (delta !== 0) {
        if (r === max) {
          h = (g - b) / delta;
        } else if (g === max) {
          h = (b - r) / delta + 2;
        } else {
          h = (r - g) / delta + 4;
        }
        h = Math.min(h * 60, 360);
        if (h < 0) h += 360;
      }

      const w = min;
      const blackness = 1 - max;
      return `HWB(${Math.floor(h)}, ${Math.floor(w * 100)}%, ${Math.floor(blackness * 100)}%)`;
    },
    hexToHsb: function (hex) {
      const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!match) return "HSB(0, 0%, 0%)";
      const r = parseInt(match[1], 16) / 255;
      const g = parseInt(match[2], 16) / 255;
      const b = parseInt(match[3], 16) / 255;

      const min = Math.min(r, g, b);
      const max = Math.max(r, g, b);
      if (min === max) {
        return `HSB(0, 0%, ${Math.floor(min * 100)}%)`;
      }

      const d = r === min ? g - b : b === min ? r - g : b - r;
      const h = r === min ? 3 : b === min ? 1 : 5;
      const computedH = Math.floor(60 * (h - d / (max - min)));
      const computedS = Math.floor((100 * (max - min)) / max);
      const computedV = Math.floor(100 * max);

      return `HSB(${computedH}, ${computedS}, ${computedV})`;
    },
    hexToHsl: function (hex) {
      const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!match) return "HSL(0, 0%, 0%)";
      const rgb = [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255];

      let min = rgb[0];
      let max = rgb[0];
      let maxColor = 0;

      for (let i = 0; i < rgb.length - 1; i++) {
        if (rgb[i + 1] <= min) min = rgb[i + 1];
        if (rgb[i + 1] >= max) {
          max = rgb[i + 1];
          maxColor = i + 1;
        }
      }

      let h = 0;
      if (maxColor === 0) h = (rgb[1] - rgb[2]) / (max - min);
      if (maxColor === 1) h = 2 + (rgb[2] - rgb[0]) / (max - min);
      if (maxColor === 2) h = 4 + (rgb[0] - rgb[1]) / (max - min);
      if (isNaN(h)) h = 0;

      h = h * 60;
      if (h < 0) h = h + 360;

      const l = (min + max) / 2;
      let s = 0;
      if (min !== max) {
        s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
      }

      return `HSL(${Math.floor(h)}, ${Math.floor(s * 100)}%, ${Math.floor(l * 100)}%)`;
    }
  },
  load: function () {
    const sizeInput = document.getElementById("sizeInput");
    const themeToggle = document.getElementById("themeToggle");
    const clearHistory = document.getElementById("clearHistory");
    const reloadUi = document.getElementById("reloadUi");
    const pickerNative = document.getElementById("pickerNative");
    const eyeDropper = document.getElementById("eyeDropper");
    const colorPicker = document.getElementById("colorPicker");

    if (clearHistory) {
      clearHistory.addEventListener("click", function () {
        const action = window.confirm("Do you really want to clear all the user colors from storage?");
        if (action === true) {
          config.color.storePickedColor("user", null);
        }
      }, false);
    }

    if (sizeInput) {
      sizeInput.addEventListener("change", function (e) {
        config.storage.writeValue("tileSize", e.target.value);
        document.documentElement.style.setProperty("--tileWidth", `${e.target.value}px`);
        document.documentElement.style.setProperty("--tileHeight", `${e.target.value}px`);
      }, false);
    }

    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        let attribute = document.documentElement.getAttribute("theme");
        attribute = attribute === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("theme", attribute);
        config.storage.writeValue("theme", attribute);
      });
    }

    if (eyeDropper) {
      eyeDropper.addEventListener("click", function () {
        if (window.EyeDropper) {
          const target = new window.EyeDropper();
          target.open().then((e) => {
            if (e.sRGBHex) {
              config.color.storePickedColor("user", e.sRGBHex);
            }
          }).catch((err) => {
            console.warn("Eyedropper selection canceled or failed:", err);
          });
        } else {
          config.notifications.create("Eyedropper API is not supported in this browser. Please use the native color picker.");
        }
      });
    }

    if (pickerNative) {
      const container = pickerNative.parentNode;
      container.addEventListener("click", function () {
        pickerNative.click();
      });
      pickerNative.addEventListener("input", function (e) {
        config.color.storePickedColor(null, e.target.value);
      }, false);
      pickerNative.addEventListener("change", function (e) {
        config.color.storePickedColor("user", e.target.value);
      }, false);
    }

    if (colorPicker && pickerNative) {
      colorPicker.addEventListener("click", function () {
        pickerNative.click();
      });
    }

    if (reloadUi) {
      reloadUi.addEventListener("click", function () {
        document.location.reload();
      }, false);
    }

    config.storage.loadValues(config.app.initialize);
    window.removeEventListener("load", config.load, false);
  }
};

config.portConnection.establish();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.updateWindowSize, false);
document.addEventListener("copy", config.copy.copyListener, false);