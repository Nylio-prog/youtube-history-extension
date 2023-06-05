let extension_enabled;

chrome.storage.local.get({ extension_enabled: 0 }, function (result) {
  if (result.extension_enabled === 0) {
    extension_enabled = false;
  } else {
    extension_enabled = true;
  }
});

chrome.runtime.onMessage.addListener(function (message) {
  if (message.activateExtension) {
    extension_enabled = true;
    getTabsInfo().then((tabs) => {
      tabs.forEach(({ tabId, status, tab }) => {
        newYoutubeVid(tabId, status, tab);
      });
    });
  } else if (message.deactivateExtension) {
    extension_enabled = false;
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  newYoutubeVid(tabId, changeInfo.status, tab);
});

function getTabsInfo() {
  return new Promise((resolve) => {
    chrome.tabs.query({}, function (tabs) {
      const tabsInfo = tabs.map((tab) => {
        return {
          tabId: tab.id,
          status: tab.status,
          tab: tab
        };
      });
      resolve(tabsInfo);
    });
  });
}

function newYoutubeVid(tabId, status, tab) {
  if (
    status === "complete" &&
    tab.url &&
    tab.url.includes("youtube.com/watch")
  ) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
      extension_value: extension_enabled
    });
  }
}
