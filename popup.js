document
  .getElementById("timerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let hours = parseInt(document.getElementById("hours").value);
    let minutes = parseInt(document.getElementById("minutes").value);

    let totalTime = (hours * 3600 + minutes * 60) * 1000; // Convert to milliseconds

    let timerEnd = Date.now() + totalTime;
    chrome.storage.sync.set({ timerEnd: timerEnd });

    chrome.runtime.sendMessage({ action: "startTimer", time: totalTime });

    window.close();
  });

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.sync.get(["timerEnd"], function (result) {
    if (result.timerEnd) {
      let countdownDiv = document.getElementById("countdown");
      let timeRemainingSpan = document.getElementById("timeRemaining");
      countdownDiv.style.display = "block";

      function updateCountdown() {
        let now = Date.now();
        let timeRemaining = result.timerEnd - now;

        if (timeRemaining > 0) {
          let hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
          let minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
          let seconds = Math.floor((timeRemaining / 1000) % 60);

          timeRemainingSpan.textContent = `${hours}h ${minutes}m ${seconds}s`;
          requestAnimationFrame(updateCountdown);
        } else {
          timeRemainingSpan.textContent = `0h 0m 0s`;
        }
      }

      updateCountdown();
    }
  });

  chrome.storage.sync.get(["timestamp"], function (result) {
    if (result.timestamp) {
      let timestampDiv = document.getElementById("timestamp");
      let link = document.createElement("a");
      link.href =
        result.timestamp.url + "&t=" + Math.floor(result.timestamp.time);
      link.textContent = `Continue watching from ${new Date(
        result.timestamp.time * 1000
      )
        .toISOString()
        .substr(11, 8)}`;
      link.addEventListener("click", function () {
        chrome.tabs.create({
          url: result.timestamp.url + "&t=" + Math.floor(result.timestamp.time),
        });
      });
      timestampDiv.appendChild(link);
    }
  });
});
