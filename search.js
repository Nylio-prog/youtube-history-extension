

function display_vids(search_data){
    alert(search_data);
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