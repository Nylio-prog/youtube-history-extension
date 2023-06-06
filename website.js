var cap_map = new Map();
var flag = false;
var cur_id;
var search_word;

    function get_caps(id){
        var caps = cap_map.get(id);
        const cap_div = document.getElementById("captions-list");
        cap_div.innerHTML = "";
        var num_of_caps = document.getElementById("number_of_captions");
        num_of_caps.innerText = "Number of captions is: " + caps.length.toString();
        var ma = Math.min(30 * caps.length, 300);
        cap_div.style.height = ma.toString() + "px";
        var highlited_part = '<mark class="highlight">' + search_word + '</mark>';
        for(let x of caps){
            var par = document.createElement('p');
            var sub_str = x[1].toLowerCase().split(search_word);
            par.innerHTML = x[0] + " " + sub_str[0] + highlited_part + sub_str[1];
            cap_div.appendChild(par);
        }
    }

    function display_vids(search_data){
        chrome.storage.local.get(null, function(data) {
            cap_map.clear();
            flag = true;
            search_word = search_data;
            var arr_of_vids = JSON.parse(data.history_videos);
            const st = new Set();
            for(var j = 0; j < arr_of_vids.length; j++){
                var it = arr_of_vids[j];
                var list_of_caps = [];
                for(var i = 1; i < it.captions.length; i += 2){
                    var str = it.captions[i];
                    var low_case = str.toLowerCase();
                    if (low_case.includes(search_data)){
                        st.add(j);
                        var pair = [it.captions[i-1], str];
                        list_of_caps.push(pair);
                    }
                }
                if(list_of_caps.length != 0){
                    cap_map.set(it.id, list_of_caps);
                }
            }
            var elems = Array.from(st);
            var thumbs = [];
            var ids = [];
            for(let x in elems){
                //thumbs.push(arr_of_vids[x].thumbnail);
                ids.push(arr_of_vids[x].id);
            }
            cur_id = ids[0];
            get_caps(ids[0]);
            const vid_div = document.getElementById("video-list");
            const one_vid = document.getElementById("video-frame");
            vid_div.innerHTML = "";
            one_vid.innerHTML = "";
            //https://www.youtube.com/watch?v=zz_SjeT_-M4&ab_channel=Naritsa to https://www.youtube.com/embed/zz_SjeT_-M4
            if(ids.length > 0){
                var src = "https://www.youtube.com/embed/" + ids[0];
                var iframe = document.createElement('iframe');
                iframe.style.width = '320px';
                iframe.style.height = '240px';
                iframe.src = src;
                one_vid.appendChild(iframe);
            }

            for(let it of ids){
                var src = "https://www.youtube.com/embed/" + it;
                var iframe = document.createElement('iframe');
                iframe.style.width = '240px';
                iframe.style.height = '160px';
                iframe.src = src;
                one_vid.appendChild(iframe);
            }
        });
    }

    function perform_change(){
        alert("Clicked.")

    }


    
    var storedValue = localStorage.getItem('searchField');
    window.onload = display_vids(storedValue);
    document.addEventListener("DOMContentLoaded", function () {
        const get_button = document.getElementById("get_results");
        const hide_show_cap = document.getElementById("hide-show-captions");
        get_button.onclick = function(){
            var input = document.getElementById('search-input');
            var inputValue = input.value;
            display_vids(inputValue);
        };
        hide_show_cap.onclick = function(){
            toggleCaptions();
        }
    });

function toggleCaptions() {
    if(flag){
        const cap_div = document.getElementById("captions-list");
        var num_of_caps = document.getElementById("number_of_captions");
        num_of_caps.innerText = "";
        cap_div.innerHTML = "";
        cap_div.style.height = "0px";
        flag = false;
    }
    else{
        get_caps(cur_id);
        flag = true;
    }
}

function toggleSortOptions() {
    // Show/hide sort options
}

function toggleFilters() {
    // Show/hide filters
}