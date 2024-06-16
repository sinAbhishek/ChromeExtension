chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "startTimer") {
    chrome.alarms.create("youtubeTimer", {
      delayInMinutes: message.time / 60000,
    });
  }
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "youtubeTimer") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let currentTab = tabs[0];

      chrome.scripting.executeScript(
        {
          target: { tabId: currentTab.id },
          func: () => {
            let video = document.querySelector("video");
            return video ? video.currentTime : null;
          },
        },
        (results) => {
          if (results[0].result !== null) {
            let timestamp = {
              url: currentTab.url,
              time: results[0].result,
            };
            chrome.storage.sync.set({ timestamp: timestamp });

            chrome.scripting.executeScript({
              target: { tabId: currentTab.id },
              func: () => {
                if (
                  confirm(
                    "Your timer has ended. Do you want to continue watching?"
                  )
                ) {
                  // Continue watching
                } else {
                  chrome.runtime.sendMessage({ action: "closeTab" });
                }
              },
            });
          }
        }
      );
    });
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "closeTab") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.remove(tabs[0].id);
    });
  }
});
