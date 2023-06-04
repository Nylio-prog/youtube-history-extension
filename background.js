let extensionActive = false;

chrome.runtime.onMessage.addListener(function (message) {
  if (message.activateExtension) {
    extensionActive = true;
    getActiveTabInfo().then(({ tabId, tab }) => {
      newYoutubeVid(tabId, tab);
    });
  } else if (message.deactivateExtension) {
    extensionActive = false;
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (extensionActive && changeInfo.status === "complete") {
    newYoutubeVid(tabId, tab);
  }
});

function getActiveTabInfo() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        const tabId = activeTab.id;
        const tabUrl = activeTab.url;

        resolve({ tabId, tab: activeTab });
      }
    });
  });
}

function newYoutubeVid(tabId, tab) {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    });
  }
}