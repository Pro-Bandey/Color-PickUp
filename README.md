# Color PickUp

**Color PickUp** is a minimalist color picker extension and web tool designed to help you inspect, convert, and organize color palettes from a clean, responsive popup.

> The interface is divided into three key functional areas:

### 1. The Top Control Bar

Divided into two streamlined groups to keep your workspace uncluttered:

- **Left Controls:** Includes the **Clear History** button to wipe your custom palette, the **Color Picker** shortcut, the **Eye Dropper** tool, and a dynamic **Tile Size** field to scale the size of color tiles (from 8px to 128px) dynamically across the entire application.
- **Right Tools:** Houses the **Reload UI** utility, the **Theme Toggle** (for seamless Light/Dark mode transitions), and standard links to **Support** and **Donation** pages (hidden automatically when run as a standalone web application).

### 2. The Main Workspace

Consists of an adaptive dual-column layout:

- **Color Preview Block (Left):** Displays a large preview of your active color. Clicking this area triggers your operating system or browser's native color picker. _(Please note: the visual style of the native color picker varies depending on your platform and operating system)._
- **Conversion Panel (Right):** Displays the selected color automatically converted into six standard formats: **HEX, HSB, RGB, HSL, HWB, and CMYK**. Clicking any field copies the formatted code to your clipboard instantly while showing a subtle popup alert.

### 3. Palette Sections

Located at the bottom of the interface, this area features collapsible, grid-based accordions containing several predefined palettes (Artistic, Favorite, UI Design, Material, Safe, etc.).

- Clicking any color tile automatically updates the main workspace, showing a checkmark (`✓`) on the active tile to indicate your current selection.
- The **User defined** section at the top of the list acts as your historical log. Your custom picks are saved automatically and can be cleared at any time using the **Clear History** button in the top control bar.

---

**Note on the Eye Dropper Feature:**  
The Eye Dropper allows you to inspect and capture colors from anywhere on your desktop screen, including areas outside of your browser window. This utilizes the modern browser `EyeDropper` API; on unsupported environments or mobile devices, the extension will gracefully notify you and prompt you to use the standard color picker block.

You can [install](https://Pro-Bandey.github.io/Color-PickUp) this application as a Progressive Web App (PWA) on your mobile device, run it as a standalone web application, or deploy it as a browser extension on Google Chrome, Mozilla Firefox, and other Chromium-based browsers.

---

Support & FAQ: [Visit Repository](https://github.com/Pro-Bandey/Color-PickUp)
