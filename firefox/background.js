// Service Worker Initialization
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.info("Color PickUp Extension installed successfully.");
  }
});

// Port communication lifecycle initialization
chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => {
    // Graceful teardown of communication channels when popup panel closes
  });
});