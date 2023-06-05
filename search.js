

function display_vids(search_data){
    chrome.storage.local.get(null, function(data) {
        var arr_of_vids = JSON.parse(data.history_videos);
        var res = [];
        for(let it of arr_of_vids){
            for(var i = 1; i < it.captions.length; i += 2){
                var str = it.captions[i];
                var low_case = str.toLowerCase();
                if (low_case.includes(search_data)){
                    res.push(low_case);
                }
            }
        }
        alert(res);
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