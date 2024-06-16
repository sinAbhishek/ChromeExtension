chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "timerEnded") {
    if (confirm("Your timer has ended. Do you want to continue watching?")) {
      // Continue watching
    } else {
      chrome.runtime.sendMessage({ action: "closeTab" });
    }
  }
});
