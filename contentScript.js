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

    function extractSimpleText(obj) {
        const results = [];
        for (const key in obj) {
          if (typeof obj[key] === 'object') {
            results.push(...extractSimpleText(obj[key]));
          } else if (key === 'simpleText') {
            results.push(obj[key]);
          }
        }
      
        return results;
      }

    const getCaptions = async (currentVideo) => {
        const param_decoded = '\n\x0b' + currentVideo;
        const param_encoded = btoa(param_decoded);
        const url = 'https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
        const data = {
        context: {
            client: {
            clientName: 'WEB',
            clientVersion: '2.9999099'
            }
        },
        params: param_encoded
        };

        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        })

        const json_response = await response.json();

        const captions = extractSimpleText(json_response);  

        return captions;
    } 

      // Function to retrieve video details using the YouTube API
    const getVideoData = async () => {
        try {
            const request = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=" + currentVideo + "&key=" + APIKey;
            const response = await fetch(request);
            const data = await response.json();
            const captions = await getCaptions(currentVideo);

            const videoItem = data.items[0];
            const videoData = {
                id: currentVideo,
                url: "https://www.youtube.com/watch?v=" + currentVideo,
                title: videoItem.snippet.title,
                channel: videoItem.snippet.channelTitle,
                captions: captions,
                recentDateWatched: new Date().toISOString()
            };

            return videoData;
        
        } catch (error) {
            throw new Error('Error retrieving video details with id:' + currentVideo + " : " + error);
        }
    }

    const storeVideoEventHandler = async () => {

        const statusBtn = document.getElementsByClassName("status-btn")[0];
        videos = await fetchVideos();
    
        const existingVideoIndex = videos.findIndex(video => video.id === currentVideo);
        if (existingVideoIndex === -1) {

            vidData = await getVideoData();

            const newVideo = {
                id: vidData.id,
                url: vidData.url,
                title: vidData.title,
                channel: vidData.channel,
                captions: vidData.captions,
                recentDateWatched: vidData.recentDateWatched
            };

            chrome.storage.local.set({
            [storage_index]: JSON.stringify([...videos, newVideo].sort((a, b) => a.title - b.title))
            });
            statusBtn.style.filter = 'invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%)'; //To make it green

        } else {
            videos.splice(existingVideoIndex, 1);
            chrome.storage.local.set({
                [storage_index]: JSON.stringify(videos)
            });
            statusBtn.style.filter = 'invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%)'; //To make it red
        }

        
    };

    function changeColorStatus(btn, index){
        if (index === -1) {
            btn.style.filter = 'invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%)'; //To make it red
        }
        else{
            btn.style.filter = 'invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%)'; //To make it green
        }
    }

    const newVideoLoaded = async () => {
        const statusBtnExists = document.getElementsByClassName("status-btn")[0];

        videos = await fetchVideos();
        const existingVideoIndex = videos.findIndex(video => video.id === currentVideo);

        if (!statusBtnExists){
            const statusBtn = document.createElement("img");

            statusBtn.src =  chrome.runtime.getURL("assets/status.png");
            statusBtn.className = "ytp-button " + "status-btn";
            statusBtn.title = "Click to add to the history";
            changeColorStatus(statusBtn, existingVideoIndex);

            youtubeRightControls = document.getElementsByClassName("ytp-right-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
        
            youtubeRightControls.prepend(statusBtn);
            statusBtn.addEventListener("click", storeVideoEventHandler);
        }
        else{
            changeColorStatus(statusBtnExists, existingVideoIndex);
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