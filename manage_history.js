function display_vids(){
    chrome.storage.local.get(null, function(data) {
        var arr_of_vids = JSON.parse(data.history_videos);
        var ids = [];
        var titles = [];
        var channels = [];
        var dates = [];
        for(var j = 0; j < arr_of_vids.length; j++){
            var it = arr_of_vids[j];
            ids.push(it.id);
            titles.push(it.title);
            channels.push(it.channel);
            dates.push(it.recentDateWatched.split('T')[0]);      
        }
        const vid_div = document.getElementsByClassName("video-grid")[0];
        vid_div.innerHTML = '';

        for (var i = 0; i < ids.length; i += 1) {
            var src = "https://www.youtube.com/embed/" + ids[i];
            var container = document.createElement('div');
            container.classList.add('video-container');
          
            var videoBox = document.createElement('div');
            videoBox.classList.add('video-box');
          
            var iframe = document.createElement('iframe');
            iframe.style.width = '240px';
            iframe.style.height = '160px';
            iframe.src = src;
            videoBox.appendChild(iframe);
          
            container.appendChild(videoBox);
          
            var videoInfo = document.createElement('div');
            videoInfo.classList.add('video-info');
          
            var videoTitle = document.createElement('p');
            videoTitle.classList.add('video-title');
            videoTitle.innerText = titles[i];
            videoInfo.appendChild(videoTitle);
          
            var channelName = document.createElement('p');
            channelName.classList.add('channel-name');
            channelName.innerText = channels[i];
            videoInfo.appendChild(channelName);
          
            var watchedDate = document.createElement('p');
            watchedDate.classList.add('watched-date');
            watchedDate.innerText = "Watched on: " + dates[i];
            videoInfo.appendChild(watchedDate);
          
            container.appendChild(videoInfo);
            vid_div.appendChild(container);
          }
          
          
    });
}

function sortVideos(sortBy) {
    var vid_div = document.getElementsByClassName("video-grid")[0];
    var videos = Array.from(vid_div.getElementsByClassName("video-container"));
    
    if (sortBy === "Name") {
      videos.sort(function(a, b) {
        var titleA = a.getElementsByClassName("video-title")[0].innerText.toLowerCase();
        var titleB = b.getElementsByClassName("video-title")[0].innerText.toLowerCase();
        return titleA.localeCompare(titleB);
      });
    } else if (sortBy === "Channel") {
        videos.sort(function(a, b) {
            var channelA = a.getElementsByClassName("channel-name")[0].innerText.toLowerCase();
            var channelB = b.getElementsByClassName("channel-name")[0].innerText.toLowerCase();
            return channelA.localeCompare(channelB);
        });
    } else if (sortBy === "Date") {
        videos.sort(function(a, b) {
          var dateA = a.getElementsByClassName("watched-date")[0].innerText.split(": ")[1];
          var dateB = b.getElementsByClassName("watched-date")[0].innerText.split(": ")[1];
          return new Date(dateB) - new Date(dateA);
    });
}
  
    // Reattach sorted videos to the video list
    videos.forEach(function(video) {
      vid_div.appendChild(video);
    });
  }
   

function toggleCaptions() {
    if(flag){
        const cap_div = document.getElementsByClassName("captions-list")[0];
        var num_of_captions = document.getElementById("number-of-captions");
        num_of_captions.innerText = "";
        cap_div.innerHTML = "";
        const iframe = document.querySelector('iframe');;
        iframe.style.width = '1066px';
        iframe.style.height = '600px';
        const hide_btn = document.getElementsByClassName("hide-captions-button")[0];
        hide_btn.innerHTML= "Show";
        flag = false;
    } 
    else{
        const iframe = document.querySelector('iframe');;
        iframe.style.width = '854px';
        iframe.style.height = '480px';
        get_captions(cur_id);
        const hide_btn = document.getElementsByClassName("hide-captions-button")[0];
        hide_btn.innerHTML= "Hide";
        flag = true;
    }
}

function no_captions_found(){
    const cap_div = document.getElementsByClassName("captions-list")[0];
    var num_of_caps = document.getElementById("number-of-captions");
    num_of_caps.innerText = "No captions found";
    cap_div.innerHTML = "";
}

function toggleFilters() {
    // Show/hide filters
}

var storedValue = localStorage.getItem('searchField');
window.onload = display_vids(storedValue);
document.addEventListener("DOMContentLoaded", function () {
    const get_button = document.getElementsByClassName("search-button")[0];
    const hide_show_cap = document.getElementsByClassName("hide-captions-button")[0];
    const search_input = document.getElementById("search-input");
    var dropdownContent = document.querySelector('.dropdown-content');

    dropdownContent.addEventListener('click', function(e) {
        var sortBy = e.target.text;  
        sortVideos(sortBy);
    });

    get_button.onclick = function () {
        var inputValue = search_input.value;
        display_vids(inputValue);
    };

    search_input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            var inputValue = search_input.value;
            display_vids(inputValue);
        }
    });

});
