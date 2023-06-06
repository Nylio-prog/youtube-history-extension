(async() => {
    let currentVideo = "";
    let APIKey = "AIzaSyCSohPOQtWVY8ZxzlWG4UOkgtrvqNWsqvo";
    let storage_index = 'history_videos';
    let extension_enabled;

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
                thumbnail: videoItem.snippet.thumbnails.default.url,
                recentDateWatched: new Date().toISOString()
            };

            return videoData;
        
        } catch (error) {
            throw new Error('Error retrieving video details with id: ' + currentVideo + " : " + error);
        }
    }

    const storeVideoAuto = async () => {
        const existingVideoIndex = await isVideoStored();
        if (existingVideoIndex === -1) {
            await storeVideo();
        }
    }

    const storeVideo = async () => {
        const videos = await fetchVideos();
        const vidData = await getVideoData();
        const statusBtn = document.getElementsByClassName("status-btn")[0];

        const newVideo = {
            id: vidData.id,
            url: vidData.url,
            title: vidData.title,
            channel: vidData.channel,
            captions: vidData.captions,
            thumbnail: vidData.thumbnail,
            recentDateWatched: vidData.recentDateWatched
        };

        chrome.storage.local.set({
        [storage_index]: JSON.stringify([...videos, newVideo].sort((a, b) => a.title - b.title))
        });
        console.log("We stored vid : " + currentVideo);
        changeStatusGreen(statusBtn);
    }

    const deleteVideo = async () => {
        const statusBtn = document.getElementsByClassName("status-btn")[0];
        const existingVideoIndex = await isVideoStored();
        const videos = await fetchVideos();
        videos.splice(existingVideoIndex, 1);
            chrome.storage.local.set({
                [storage_index]: JSON.stringify(videos)
            });
        changeStatusRed(statusBtn);
    }

    const isVideoStored = async () => {
        const videos = await fetchVideos();
        return videos.findIndex(video => video.id === currentVideo);//-1 if video not stored, index if found   
    }

    const storeVideoEventHandler = async () => {
        
        const existingVideoIndex = await isVideoStored();
        if (existingVideoIndex === -1) {
            storeVideo();
        } else {
            deleteVideo();
        }

    };

    function changeStatusGreen(btn){
        btn.style.filter = 'invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%)'; //To make it green
        btn.title = "Video stored, click to delete";

    }
    function changeStatusRed(btn){
        btn.style.filter = 'invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%)'; //To make it red
        btn.title = "Video not stored, click to store";

    }


    const newVideoLoaded = async () => {
        const statusBtnExists = document.getElementsByClassName("status-btn")[0];
        
        const existingVideoIndex = await isVideoStored();

        if (!statusBtnExists){
            const statusBtn = document.createElement("img");

            statusBtn.src =  chrome.runtime.getURL("assets/status.png");
            statusBtn.className = "ytp-button " + "status-btn";
            statusBtn.title = "Click to add to the history";
            if (existingVideoIndex === -1){
                changeStatusRed(statusBtn);
            } 
            else {
                changeStatusGreen(statusBtn);
            }

            const youtubeRightControls = document.getElementsByClassName("ytp-right-controls")[0];
            if (youtubeRightControls){
                youtubeRightControls.prepend(statusBtn);
            }
            statusBtn.addEventListener("click", storeVideoEventHandler);
        }
        else{
            if (existingVideoIndex === -1){
                changeStatusRed(statusBtnExists);
            } 
            else {
                changeStatusGreen(statusBtnExists);
            }
        }
        if (extension_enabled){
            await storeVideoAuto();
        }


    }

    chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
        const {type, videoId, extension_value} = obj;

        if (type === "NEW"){
            currentVideo = videoId;
            extension_enabled = extension_value;

            await newVideoLoaded();
        } 
    })

    await newVideoLoaded();
    
})();