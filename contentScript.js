(() => {
    let youtubeRightControls, youtubePlayer;
    let currentVideo = "";
    let APIKey = "AIzaSyCSohPOQtWVY8ZxzlWG4UOkgtrvqNWsqvo";
    let storage_index = 'history_videos';

    const fetchVideos = () => {
        return new Promise((resolve) => {
          chrome.storage.local.get([storage_index], (obj) => {
            resolve(obj[storage_index] ? JSON.parse(obj[storage_index]) : []);
          });
        });
    };

      // Function to retrieve video details using the YouTube API
    const getVideoData = async () => {
        try {
            const request = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=" + currentVideo + "&key=" + APIKey;
            const response = await fetch(request);
            const data = await response.json();

            const videoItem = data.items[0];
            const videoData = {
                title: videoItem.snippet.title,
                channel: videoItem.snippet.channelTitle,
                captions: ""
            };

            return videoData;
        
        } catch (error) {
            throw new Error('Error retrieving video details: ' + error);
        }
    }

    const storeVideoEventHandler = async () => {
        vidData = await getVideoData();
        id = currentVideo;
        url = "https://www.youtube.com/watch?v=" + currentVideo;
        recentDateWatched = new Date().toISOString()
        const newVideo = {
            id: id,
            url: url,
            title: vidData.title,
            channel: vidData.channel,
            captions: vidData.captions,
            recentDateWatched: recentDateWatched
        };

        videos = await fetchVideos();
    
        const existingVideo = videos.find(video => video.id === newVideo.id);
        if (!existingVideo) {
            chrome.storage.local.set({
            [storage_index]: JSON.stringify([...videos, newVideo].sort((a, b) => a.title - b.title))
            });
            console.log("Stored a new video");
        } else {
            console.log("Video already stored");
        }
      };

    const newVideoLoaded = async () => {
        const statusBtnExists = document.getElementsByClassName("status-btn")[0];
        
        if (!statusBtnExists){
            const statusBtn = document.createElement("img");

            statusBtn.src =  chrome.runtime.getURL("assets/status.png");
            statusBtn.className = "ytp-button " + "status-btn";
            statusBtn.title = "Click to add to the history";
            statusBtn.style.filter = 'brightness(0) invert(1)'; //To make the png white

            youtubeRightControls = document.getElementsByClassName("ytp-right-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
        
            youtubeRightControls.prepend(statusBtn);
            statusBtn.addEventListener("click", storeVideoEventHandler);
        }
    }

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, value, videoId} = obj;

        if (type === "NEW"){
            currentVideo = videoId;
            newVideoLoaded();
        } 
    })

    newVideoLoaded();
    
})();