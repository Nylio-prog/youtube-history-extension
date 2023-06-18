var cap_map = new Map();
var flag = false;
var cur_id;
var search_word;

function get_captions(id) {
    // Retrieve the captions for the given video ID
    var caps = cap_map.get(id);
  
    // Select the captions list container
    const cap_div = document.getElementsByClassName("captions-list")[0];
    cap_div.innerHTML = "";
  
    // Display the number of captions found
    var num_of_captions = document.getElementById("number-of-captions");
    num_of_captions.innerText = caps.length.toString() + " clips found";
  
    // Iterate through the captions and create caption elements
    for (let [timestamp, caption] of caps) {
      var captionElement = createCaptionElement(timestamp, caption);
      cap_div.appendChild(captionElement);
    }
  }
  
  function createCaptionElement(timestamp, caption) {
    // Create a <p> element for the caption
    var captionElement = document.createElement("p");
    captionElement.classList.add("caption");
  
    // Split the caption at the search word and highlight it
    var subStr = caption.toLowerCase().split(search_word);
    var captionHTML =
      '<span class="first-word">' +
      timestamp +
      '</span> ' +
      subStr[0] +
      '<span class="highlight">' +
      search_word +
      "</span>" +
      subStr[1];
  
    // Set the HTML content of the caption element
    captionElement.innerHTML = captionHTML;
  
    // Add a click event listener to update the timestamp
    captionElement.addEventListener("click", function () {
      updateTimeStamp(timestamp);
    });
  
    return captionElement;
  }
  
  function updateTimeStamp(time) {
    // Split the timestamp into minutes and seconds
    const min = time.split(":")[0];
    const sec = time.split(":")[1];
  
    // Calculate the total seconds
    const totalSeconds = parseInt(min) * 60 + parseInt(sec);
  
    // Get the main video element
    const main_vid = document.getElementById("main_vid");
  
    // Update the source URL of the main video to include the start time and autoplay
    main_vid.src =
      main_vid.src.split("?")[0] + "?start=" + totalSeconds + "&autoplay=1";
  }
  

  function display_vids(search_data) {
    // Retrieve data from local storage using Chrome storage API
    chrome.storage.local.get(null, function (data) {
      // Clear the caption map and set the flag to true
      cap_map.clear();
      flag = true;
  
      // Store the search word
      search_word = search_data;
  
      // Parse the history_videos data from storage
      var arr_of_vids = JSON.parse(data.history_videos);
  
      // Initialize arrays to store video information
      const st = new Set();
      var ids = [];
      var titles = [];
      var channels = [];
      var dates = [];
      var number_of_captions = [];
      var durations = [];
  
      // Iterate through the videos
      for (var j = 0; j < arr_of_vids.length; j++) {
        var it = arr_of_vids[j];
        var list_of_caps = [];
        var counter_of_caps = 0;
  
        // Iterate through the captions of each video
        for (var i = 1; i < it.captions.length; i += 2) {
          var str = it.captions[i];
          var low_case = str.toLowerCase();
  
          // Check if the caption includes the search word
          if (low_case.includes(search_data)) {
            var pair = [it.captions[i - 1], str];
            list_of_caps.push(pair);
            counter_of_caps += 1;
          }
        }
  
        // Check if any matching captions were found
        if (list_of_caps.length !== 0) {
          ids.push(it.id);
          titles.push(it.title);
          channels.push(it.channel);
          dates.push(it.recentDateWatched.split("T")[0]);
          number_of_captions.push(counter_of_caps);
          durations.push(it.duration);
          cap_map.set(it.id, list_of_caps);
        }
      }
  
      // Check if any matching videos were found
      if (ids.length !== 0) {
        cur_id = ids[0];
        get_captions(ids[0]);
      } else {
        no_captions_found();
      }
  
      // Clear the video and caption containers
      const vid_div = document.getElementsByClassName("video-list")[0];
      vid_div.innerHTML = "";
      const one_vid = document.getElementsByClassName("video-frame")[0];
      one_vid.innerHTML = "";
  
      // Display the main video and its duration bar
      if (ids.length > 0) {
        var src = "https://www.youtube.com/embed/" + ids[0];
        var iframe = createIframeElement(src, '854px', '480px', 'main_vid');
        one_vid.appendChild(iframe);
        one_vid.appendChild(addVideoDurationBar(ids[0], durations[0]));
      }
  
      // Display the remaining videos
      for (var i = 1; i < ids.length; i += 1) {
        var src = "https://www.youtube.com/embed/" + ids[i];
        var container = createVideoContainer(src);
  
        var videoInfo = createVideoInfoElement(titles[i], channels[i], dates[i], number_of_captions[i]);
        container.appendChild(videoInfo);
  
        vid_div.appendChild(container);
      }
    });
  }
  
  
  function createIframeElement(src, width, height, id) {
    // Create an iframe element with the specified source, width, height, and id
    var iframe = document.createElement("iframe");
    iframe.style.width = width;
    iframe.style.height = height;
    iframe.src = src;
    iframe.id = id;
    return iframe;
  }
  
  function createVideoContainer(src) {
    // Create a container div for a video
    var container = document.createElement("div");
    container.classList.add("video-container");
  
    var videoBox = document.createElement("div");
    videoBox.classList.add("video-box");
  
    // Create an iframe element for the video thumbnail
    var iframe = createIframeElement(src, "240px", "160px");
    iframe.style.borderRadius = "8px";
  
    videoBox.appendChild(iframe);
    container.appendChild(videoBox);
    return container;
  }
  
  function createVideoInfoElement(title, channel, date, numCaptions) {
    // Create a div element to display video information
    var videoInfo = document.createElement("div");
    videoInfo.classList.add("video-info");
  
    // Create a paragraph element for the video title
    var videoTitle = document.createElement("p");
    videoTitle.classList.add("video-title");
    videoTitle.innerText = title;
    videoInfo.appendChild(videoTitle);
  
    // Create a paragraph element for the channel name
    var channelName = document.createElement("p");
    channelName.classList.add("channel-name");
    channelName.innerText = channel;
    videoInfo.appendChild(channelName);
  
    // Create a paragraph element for the watched date
    var watchedDate = document.createElement("p");
    watchedDate.classList.add("watched-date");
    watchedDate.innerText = "Watched on: " + date;
    videoInfo.appendChild(watchedDate);
  
    // Create a paragraph element for the number of captions
    var captionsNumber = document.createElement("p");
    captionsNumber.classList.add("video-list-num-captions");
    captionsNumber.innerText = numCaptions + " clips";
    videoInfo.appendChild(captionsNumber);
  
    return videoInfo;
  }
  
  function getCaptionsTimeStamps(id) {
    // Get the captions for the specified video ID
    var caps = cap_map.get(id);
    var list_of_timestamps = [];
    for (let x of caps) {
      // Extract the timestamps and add them to the list
      list_of_timestamps.push(x[0]);
    }
    return list_of_timestamps;
  }
  
  function getTotalSeconds(time) {
    // Calculate the total number of seconds from a timestamp in the format mm:ss
    const min = time.split(':')[0];
    const sec = time.split(':')[1];
    return parseInt(min) * 60 + parseInt(sec);
  }
  

function addVideoDurationBar(id, duration) {
    const durationBar = document.createElement('div');
    durationBar.classList.add('video-duration-bar');

    const timestamps = getCaptionsTimeStamps(id);

    // Iterate through the captions array and create circles at the corresponding moments
    for (let i = 0; i < timestamps.length; i++) {
      
      const timestamp = timestamps[i];
      const totalSeconds = getTotalSeconds(timestamp);
      const circle = document.createElement('div');
      circle.style.left = `${(totalSeconds / duration) * 100}%`;
      circle.classList.add('circle-ring');
      circle.title = "Go to " + timestamp;
  
      // Add a click event listener to each circle
      circle.addEventListener('click', () => {
        updateTimeStamp(timestamp);
      });
  
      // Append the circle to the duration bar
      durationBar.appendChild(circle);
    }

    return durationBar;
  }

  function sortVideos(sortBy) {
    // Get the video list container
    var vid_div = document.getElementsByClassName("video-list")[0];
    // Get an array of video containers
    var videos = Array.from(vid_div.getElementsByClassName("video-container"));
    
    // Sort the videos based on the specified sorting option
    if (sortBy === "Name") {
      videos.sort(function(a, b) {
        // Get the titles of the videos for comparison
        var titleA = a.getElementsByClassName("video-title")[0].innerText.toLowerCase();
        var titleB = b.getElementsByClassName("video-title")[0].innerText.toLowerCase();
        // Compare the titles using localeCompare for alphabetical sorting
        return titleA.localeCompare(titleB);
      });
    } else if (sortBy === "Clip count") {
      videos.sort(function(a, b) {
        // Get the number of captions for each video for comparison
        var countA = parseInt(a.getElementsByClassName("video-list-num-captions")[0].innerText);
        var countB = parseInt(b.getElementsByClassName("video-list-num-captions")[0].innerText);
        // Compare the caption counts in descending order
        return countB - countA;
      });
    } else if (sortBy === "Date") {
      videos.sort(function(a, b) {
        // Get the watched dates of the videos for comparison
        var dateA = a.getElementsByClassName("watched-date")[0].innerText.split(": ")[1];
        var dateB = b.getElementsByClassName("watched-date")[0].innerText.split(": ")[1];
        // Compare the dates using Date objects for chronological sorting
        return new Date(dateB) - new Date(dateA);
      });
    }
  
    // Reattach the sorted videos to the video list container
    videos.forEach(function(video) {
      vid_div.appendChild(video);
    });
  }
  
   

  function toggleCaptions() {
    // Get the captions list container, number of captions element, iframe, and hide button
    const cap_div = document.getElementsByClassName("captions-list")[0];
    var num_of_captions = document.getElementById("number-of-captions");
    const iframe = document.querySelector("iframe");
    const hide_btn = document.getElementsByClassName("hide-captions-button")[0];
  
    if (flag) {
      // Hide the captions
      num_of_captions.innerText = "";
      cap_div.innerHTML = "";
      iframe.style.width = "1066px";
      iframe.style.height = "600px";
      hide_btn.innerHTML = "Show";
      flag = false;
    } else {
      // Show the captions
      iframe.style.width = "854px";
      iframe.style.height = "480px";
      get_captions(cur_id);
      hide_btn.innerHTML = "Hide";
      flag = true;
    }
  }
  
  function no_captions_found(){
    // Get the captions list container and number of captions element
    const cap_div = document.getElementsByClassName("captions-list")[0];
    var num_of_caps = document.getElementById("number-of-captions");
    // Display a message indicating no captions found
    num_of_caps.innerText = "No captions found";
    cap_div.innerHTML = "";
  }
  
  var storedValue = localStorage.getItem('searchField');
  window.onload = display_vids(storedValue);
  document.title = "Video playback";
  
  document.addEventListener("DOMContentLoaded", function () {
    // Get the search button, hide/show captions button, search input, and dropdown content
    const get_button = document.getElementsByClassName("search-button")[0];
    const hide_show_cap = document.getElementsByClassName("hide-captions-button")[0];
    const search_input = document.getElementById("search-input");
    var dropdownContent = document.querySelector('.dropdown-content');
  
    dropdownContent.addEventListener('click', function(e) {
      // Sort videos based on the selected option from the dropdown menu
      var sortBy = e.target.text;  
      sortVideos(sortBy);
    });
  
    get_button.onclick = function () {
      // Handle the search button click event
      var inputValue = search_input.value;
      display_vids(inputValue);
    };
  
    search_input.addEventListener("keydown", function (event) {
      // Handle the enter key press event in the search input
      if (event.key === "Enter") {
        var inputValue = search_input.value;
        display_vids(inputValue);
      }
    });
  
    hide_show_cap.onclick = function () {
      // Toggle the visibility of captions
      toggleCaptions();
    };
  });
  
