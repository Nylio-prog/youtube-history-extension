
    function display_vids(search_data){
        chrome.storage.local.get(null, function(data) {
            var arr_of_vids = JSON.parse(data.history_videos);
            const st = new Set();
            for(let it of arr_of_vids){
                for(var i = 1; i < it.captions.length; i += 2){
                    var str = it.captions[i];
                    var low_case = str.toLowerCase();
                    if (low_case.includes(search_data)){
                        st.add(it.id);
                    }
                }
            }
            var res = Array.from(st);
            const vid_div = document.getElementById("video-frame");
            vid_div.innerHTML = "";
            //https://www.youtube.com/watch?v=zz_SjeT_-M4&ab_channel=Naritsa to https://www.youtube.com/embed/zz_SjeT_-M4
            for(let it of res){
                var src = "https://www.youtube.com/embed/" + it;
                var iframe = document.createElement('iframe');
                iframe.style.width = '320px';
                iframe.style.height = '240px';
                iframe.src = src;
                vid_div.appendChild(iframe);
            }
        });
    }
    
    var storedValue = localStorage.getItem('searchField');
    window.onload = display_vids(storedValue);
    document.addEventListener("DOMContentLoaded", function () {
        const searchField = document.getElementById("search-input");
        const get_button = document.getElementById("get_results");
        get_button.onclick = function(){
            var input = document.getElementById('search-input');
            var inputValue = input.value;
            display_vids(inputValue);
        };
    });

function toggleCaptions() {
    // Show/hide captions
}

function toggleSortOptions() {
    // Show/hide sort options
}

function toggleFilters() {
    // Show/hide filters
}