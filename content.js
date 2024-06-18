chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "timerEnded") {
    if (confirm("Your timer has ended. Do you want to continue watching?")) {
      // Continue watching
    } else {
      chrome.runtime.sendMessage({ action: "closeTab" });
    }
  }
});
(function () {
  // Ensure the script runs only on video pages
  if (!window.location.href.includes("youtube")) return;

  // Create a button to mark timestamp
  const button = document.createElement("button");
  button.textContent = "Mark Timestamp";
  button.style.position = "fixed";
  button.style.top = "80px";
  button.style.right = "10px";
  button.style.zIndex = 1000;
  document.body.appendChild(button);

  button.addEventListener("click", () => {
    const video = document.querySelector("video");
    if (!video) return;

    const currentTime = video.currentTime;
    const note = prompt("Enter a note for this timestamp:");

    if (note) {
      // Capture the current frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameImage = canvas.toDataURL("image/png");

      chrome.storage.local.get({ timestamps: [] }, (result) => {
        const timestamps = result.timestamps;
        timestamps.push({
          time: currentTime,
          note: note,
          frame: frameImage,
          url: window.location.href,
        });
        chrome.storage.local.set({ timestamps: timestamps }, () => {
          alert("Timestamp and frame saved!");
        });
      });
    }
  });

  // Listen for messages from the popup script to update the timestamp
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "goToTimestamp") {
      const video = document.querySelector("video");
      if (video) {
        video.currentTime = message.time;
        sendResponse({ status: "success" });
      } else {
        sendResponse({ status: "failure" });
      }
    }
  });
})();
