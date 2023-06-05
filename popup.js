document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleButton");
  const searchField = document.getElementById("searchField");
  const manageButton = document.getElementById("manageButton");

  //Shows the correct states of the switch button when we click on the extension
  chrome.storage.local.get({extension_enabled: 0}, function (result) {
    var extension_enabled = result.extension_enabled;
    if (extension_enabled == 0) {
      toggleButton.classList.remove("active");
    }
    else {
      toggleButton.classList.add("active");
    }
  });

  toggleButton.addEventListener("click", function () {
    chrome.storage.local.get({extension_enabled: 0}, function (result) {
      var extension_enabled = result.extension_enabled;
      if (extension_enabled == 0) {
        toggleButton.classList.add("active"); //Shows the button enabled
        chrome.runtime.sendMessage({ activateExtension: true });

      }
      else {
        toggleButton.classList.remove("active"); //Shows the button deactivated
        chrome.runtime.sendMessage({ deactivateExtension: true });
      }
      chrome.storage.local.set({extension_enabled: 1 - extension_enabled});
  });
  });

  searchField.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      launchWebsite();
    }
  });

  manageButton.addEventListener("click", function () {
    launchWebsite();
  });

  function launchWebsite() {
    chrome.tabs.create({ url: "website.html" });
  }
});
