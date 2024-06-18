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
const timerelement = document.querySelector(".mainTimer");
const noteelement = document.querySelector(".mainNotes");
const timerbtnelement = document.querySelector(".btn-timer");
const notebtnelement = document.querySelector(".btn-note");
document.querySelector(".btn-note").addEventListener("click", () => {
  timerelement.style.display = "none";
  noteelement.style.display = "block";
  notebtnelement.classList.add("active");
  timerbtnelement.classList.remove("active");
});
document.querySelector(".btn-timer").addEventListener("click", () => {
  noteelement.style.display = "none";
  timerelement.style.display = "block";
  notebtnelement.classList.remove("active");
  timerbtnelement.classList.add("active");
});
document.addEventListener("DOMContentLoaded", function () {
  const notesDiv = document.getElementById("notes");
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
  chrome.storage.local.get({ timestamps: [] }, (result) => {
    const timestamps = result.timestamps;

    if (timestamps.length === 0) {
      notesDiv.innerHTML = "<p>No timestamps saved.</p>";
      return;
    }

    timestamps.forEach((timestamp, index) => {
      const noteDiv = document.createElement("div");
      noteDiv.className = "note";

      const frameImage = document.createElement("img");
      frameImage.src = timestamp.frame;
      frameImage.style.width = "100%";
      frameImage.style.marginBottom = "10px";

      const timeLink = document.createElement("a");
      timeLink.href = "#";
      timeLink.textContent = `Timestamp: ${new Date(timestamp.time * 1000)
        .toISOString()
        .substr(11, 8)}`;
      timeLink.dataset.time = timestamp.time;

      timeLink.addEventListener("click", (e) => {
        e.preventDefault();
        const time = e.target.dataset.time;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "goToTimestamp", time: parseFloat(time) },
            (response) => {
              if (response.status === "success") {
                console.log("Timestamp updated successfully.");
              } else {
                console.error("Failed to update timestamp.");
              }
            }
          );
        });
      });

      const noteText = document.createElement("p");
      noteText.textContent = `Note: ${timestamp.note}`;

      noteDiv.appendChild(frameImage);
      noteDiv.appendChild(timeLink);
      noteDiv.appendChild(noteText);

      notesDiv.appendChild(noteDiv);
    });
  });
});
console.log("hello");
