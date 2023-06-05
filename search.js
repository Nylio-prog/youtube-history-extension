

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
        const vid_div = document.getElementById("videos");
        vid_div.innerHTML = "";
        //https://www.youtube.com/watch?v=zz_SjeT_-M4&ab_channel=Naritsa to https://www.youtube.com/embed/zz_SjeT_-M4
        for(let it of res){
            var src = "https://www.youtube.com/embed/" + it;
            var iframe = document.createElement('iframe');
            iframe.style.width = '720px';
            iframe.style.height = '450px';
            iframe.src = src;
            vid_div.appendChild(iframe);
        }
      });
}

var storedValue = localStorage.getItem('searchField');
window.onload = display_vids(storedValue);
document.addEventListener("DOMContentLoaded", function () {
    const searchField = document.getElementById("myInput");
    searchField.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          var input = document.getElementById('myInput');
          var inputValue = input.value;
          display_vids(inputValue);
        }
      });
});