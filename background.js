chrome.runtime.onMessage.addListener(function (message) { //Listens to the pop up message
    if (message.activateExtension) {
        chrome.tabs.onUpdated.addListener(newYoutubeVid);
    } else if (message.deactivateExtension){
        chrome.tabs.onUpdated.removeListener(newYoutubeVid);
    }
  });

function newYoutubeVid(tabId, tab) {
    if (tab.url && tab.url.includes("youtube.com/watch")){
        const queryParameters = tab.url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);

        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParameters.get("v"),
        });
    }
}
