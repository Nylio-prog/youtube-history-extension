var cap_map = new Map();
var flag = false;
var cur_id;
var search_word;

function get_captions(id){
    var caps = cap_map.get(id);
    const cap_div = document.getElementsByClassName("captions-list")[0];
    cap_div.innerHTML = "";
    var num_of_captions = document.getElementById("number-of-captions");
    num_of_captions.innerText = caps.length.toString() + " clips found";
    for(let x of caps){
        var caption = document.createElement('p');
        caption.classList.add("caption");
        var sub_str = x[1].toLowerCase().split(search_word);
        caption.innerHTML = '<span class="first-word">' + x[0] + '</span> ' + sub_str[0] + '<span class="highlight">' + search_word + '</span>' + sub_str[1];
        cap_div.appendChild(caption);
    }
}

function display_vids(search_data){
    chrome.storage.local.get(null, function(data) {
        cap_map.clear();
        flag = true;
        search_word = search_data;
        var arr_of_vids = JSON.parse(data.history_videos);
        const st = new Set();
        var ids = [];
        var titles = [];
        var channels = [];
        var dates = [];
        var number_of_captions = [];
        for(var j = 0; j < arr_of_vids.length; j++){
            var it = arr_of_vids[j];
            var list_of_caps = [];
            var counter_of_caps = 0;
            for(var i = 1; i < it.captions.length; i += 2){
                var str = it.captions[i];
                var low_case = str.toLowerCase();
                if (low_case.includes(search_data)){
                    var pair = [it.captions[i-1], str];
                    list_of_caps.push(pair);
                    counter_of_caps +=1;
                }
            }
            if(list_of_caps.length != 0){
                ids.push(it.id);
                titles.push(it.title);
                channels.push(it.channel);
                dates.push(it.recentDateWatched.split('T')[0]);
                number_of_captions.push(counter_of_caps);
                cap_map.set(it.id, list_of_caps);
            }
        }
        if(ids.length != 0){
            cur_id = ids[0];
            get_captions(ids[0]);
        }
        else{
            no_captions_found();
        }
        const vid_div = document.getElementsByClassName("video-list")[0];
        vid_div.innerHTML = '';
        const one_vid = document.getElementsByClassName("video-frame")[0];
        one_vid.innerHTML = '';

        if(ids.length > 0){
            var src = "https://www.youtube.com/embed/" + ids[0];
            var iframe = document.createElement('iframe');
            iframe.style.width = '854px';
            iframe.style.height = '480px';
            iframe.src = src;
            one_vid.appendChild(iframe);
        }

        for (var i = 1; i < ids.length; i += 1) {
            var src = "https://www.youtube.com/embed/" + ids[i];
            var container = document.createElement('div');
            container.classList.add('video-container');
          
            var videoBox = document.createElement('div');
            videoBox.classList.add('video-box');
          
            var iframe = document.createElement('iframe');
            iframe.style.width = '240px';
            iframe.style.height = '160px';
            iframe.src = src;
            iframe.style.borderRadius = '8px';

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
          
            var captionsNumber = document.createElement('p');
            captionsNumber.classList.add('video-list-num-captions');
            captionsNumber.innerText = number_of_captions[i] + " clips";
            videoInfo.appendChild(captionsNumber);
          
            container.appendChild(videoInfo);
            vid_div.appendChild(container);
          }
          
          
    });
}

function sortVideos(sortBy) {
    var vid_div = document.getElementsByClassName("video-list")[0];
    var videos = Array.from(vid_div.getElementsByClassName("video-container"));
    
    if (sortBy === "Name") {
      videos.sort(function(a, b) {
        var titleA = a.getElementsByClassName("video-title")[0].innerText.toLowerCase();
        var titleB = b.getElementsByClassName("video-title")[0].innerText.toLowerCase();
        return titleA.localeCompare(titleB);
      });
    } else if (sortBy === "Clip count") {
      videos.sort(function(a, b) {
        var countA = parseInt(a.getElementsByClassName("video-list-num-captions")[0].innerText);
        var countB = parseInt(b.getElementsByClassName("video-list-num-captions")[0].innerText);
        return countB - countA;
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

    hide_show_cap.onclick = function () {
        toggleCaptions();
    };
});
