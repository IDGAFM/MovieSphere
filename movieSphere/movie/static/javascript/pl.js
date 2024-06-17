document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector("#film-popup .containerr"),
        mainVideo = container.querySelector("video.film-play"),
        videoTimeline = container.querySelector(".video-timeline"),
        progressBar = container.querySelector(".progress-bar"),
        volumeBtn = container.querySelector(".volume i"),
        volumeSlider = container.querySelector(".left input"),
        currentVidTime = container.querySelector(".current-time"),
        videoDuration = container.querySelector(".video-duration"),
        skipBackward = container.querySelector(".skip-backward i"),
        skipForward = container.querySelector(".skip-forward i"),
        playPauseBtn = container.querySelector(".play-pause i"),
        speedBtn = container.querySelector(".playback-speed span"),
        speedOptions = container.querySelector(".speed-options"),
        pipBtn = container.querySelector(".pic-in-pic span"),
        fullScreenBtn = container.querySelector(".fullscreen i"),
        seriesInfo = container.querySelector(".series-info"),
        seriesSelector = container.querySelector(".series-selector"),
        seriesSelectorContainer = document.querySelector(".series-selector-container"),
        seasonSelect = document.getElementById("season-select"),
        episodeSelect = document.getElementById("episode-select"),
        closeBtn = container.querySelector(".close");

    let timer;

    // Function to hide all elements after 5 seconds
    const hideAllElements = () => {
        container.classList.remove("show-controls");
        seriesInfo.classList.add("hidden");
        seriesSelectorContainer.classList.add("hidden");
    };

    // Update hideControls function
    const hideControls = () => {
        if (mainVideo.paused) return;
        clearTimeout(timer);  // Stop previous timer
        timer = setTimeout(() => {
            hideAllElements();
        }, 5000);
    };
    hideControls();

    // Show controls on mouse move
    container.addEventListener("mousemove", () => {
        container.classList.add("show-controls");
        seriesInfo.classList.remove("hidden");
        seriesSelectorContainer.classList.remove("hidden");
        clearTimeout(timer);
        hideControls();
    });

    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            clearTimeout(timer);
            container.classList.add("show-controls");
            seriesInfo.classList.remove("hidden");
            seriesSelectorContainer.classList.add("hidden");
        } else {
            hideAllElements();
        }
    });

    // Format time
    const formatTime = time => {
        let seconds = Math.floor(time % 60),
            minutes = Math.floor(time / 60) % 60,
            hours = Math.floor(time / 3600);

        seconds = seconds < 10 ? `0${seconds}` : seconds;
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        hours = hours < 10 ? `0${hours}` : hours;

        if (hours == 0) {
            return `${minutes}:${seconds}`;
        }
        return `${hours}:${minutes}:${seconds}`;
    };

    // Show video timeline time on mouse move
    videoTimeline.addEventListener("mousemove", e => {
        let timelineWidth = videoTimeline.clientWidth;
        let offsetX = e.clientX - videoTimeline.getBoundingClientRect().left;
        let percent = Math.floor((offsetX / timelineWidth) * mainVideo.duration);
        const progressTime = videoTimeline.querySelector("span");
        offsetX = offsetX < 20 ? 20 : (offsetX > timelineWidth - 20) ? timelineWidth - 20 : offsetX;
        progressTime.style.left = `${offsetX}px`;
        progressTime.innerText = formatTime(percent);
    });

    // Update video time on timeline click
    videoTimeline.addEventListener("click", e => {
        let timelineWidth = videoTimeline.clientWidth;
        let offsetX = e.clientX - videoTimeline.getBoundingClientRect().left;
        mainVideo.currentTime = (offsetX / timelineWidth) * mainVideo.duration;
    });

    // Update progress bar and current time as video plays
    mainVideo.addEventListener("timeupdate", e => {
        let { currentTime, duration } = e.target;
        let percent = (currentTime / duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentVidTime.innerText = formatTime(currentTime);
    });

    // Set video duration on video load
    mainVideo.addEventListener("loadeddata", () => {
        videoDuration.innerText = formatTime(mainVideo.duration);
    });

    // Dragging progress bar
    videoTimeline.addEventListener("mousedown", e => {
        const timelineWidth = videoTimeline.clientWidth;

        const onMouseMove = e => {
            let offsetX = e.clientX - videoTimeline.getBoundingClientRect().left;
            const percentage = offsetX / timelineWidth;
            offsetX = Math.max(0, Math.min(offsetX, timelineWidth));
            progressBar.style.width = `${(percentage * 100).toFixed(2)}%`;
            mainVideo.currentTime = percentage * mainVideo.duration;
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    // Toggle volume
    volumeBtn.addEventListener("click", () => {
        if (!volumeBtn.classList.contains("fa-volume-high")) {
            mainVideo.volume = 0.5;
            volumeBtn.classList.replace("fa-volume-xmark", "fa-volume-high");
        } else {
            mainVideo.volume = 0.0;
            volumeBtn.classList.replace("fa-volume-high", "fa-volume-xmark");
        }
        volumeSlider.value = mainVideo.volume;
    });

    // Adjust volume with slider
    volumeSlider.addEventListener("input", e => {
        mainVideo.volume = e.target.value;
        volumeBtn.classList[mainVideo.volume == 0 ? 'replace' : 'replace']("fa-volume-xmark", "fa-volume-high");
    });

    // Play/Pause video
    playPauseBtn.addEventListener("click", () => {
        if (mainVideo.paused) {
            mainVideo.play();
            playPauseBtn.classList.replace("fa-play", "fa-pause");
        } else {
            mainVideo.pause();
            playPauseBtn.classList.replace("fa-pause", "fa-play");
        }
    });

    // Skip backward
    skipBackward.addEventListener("click", () => {
        mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 5);
    });

    // Skip forward
    skipForward.addEventListener("click", () => {
        mainVideo.currentTime = Math.min(mainVideo.duration, mainVideo.currentTime + 5);
    });

    // Change playback speed
    speedBtn.addEventListener("click", () => {
        speedOptions.classList.toggle("show");
    });

    speedOptions.querySelectorAll("li").forEach(option => {
        option.addEventListener("click", () => {
            speedOptions.querySelector("li.active").classList.remove("active");
            option.classList.add("active");
            mainVideo.playbackRate = option.dataset.speed;
            speedOptions.classList.remove("show");
        });
    });

    // Picture-in-picture mode
    pipBtn.addEventListener("click", () => {
        mainVideo.requestPictureInPicture();
    });

    // Fullscreen mode
    const openFullscreen = () => {
        if (!document.fullscreenElement) {
            container.requestFullscreen().then(() => {
                container.classList.add("show-controls");
            });
        }
    };

    fullScreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            openFullscreen();
            fullScreenBtn.classList.replace("fa-expand", "fa-compress");
        } else {
            document.exitFullscreen();
            fullScreenBtn.classList.replace("fa-compress", "fa-expand");
        }
    });

    // Fullscreen change event to hide controls
    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            clearTimeout(timer);
            container.classList.add("show-controls");
        }
    });

    // Function to initialize and play video
    const initializeAndPlayVideo = () => {
        mainVideo.play();
        playPauseBtn.classList.replace("fa-play", "fa-pause");
    };

    // Event listener for season selection
    seasonSelect.addEventListener("change", function(event) {
        event.stopPropagation();
        event.preventDefault();
        const seasonNumber = this.value;
        const url = new URL(window.location.href);
        url.searchParams.set('season', seasonNumber);
        url.searchParams.delete('episode'); // Reset episode when changing season

        fetch(url.toString(), { headers: { 'X-Requested-With': 'XMLHttpRequest' }})
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const newEpisodeSelect = doc.querySelector("#episode-select");
                const newMainVideoSrc = doc.querySelector("video.film-play").getAttribute('src');

                episodeSelect.innerHTML = newEpisodeSelect.innerHTML;
                mainVideo.src = newMainVideoSrc;

                const newSeriesInfo = doc.querySelector(".series-info");
                seriesInfo.innerHTML = newSeriesInfo.innerHTML;

                mainVideo.pause();
                playPauseBtn.classList.replace("fa-pause", "fa-play");
            })
            .catch(error => console.error('Error:', error));
    });

    episodeSelect.addEventListener("change", function(event) {
        event.stopPropagation();
        event.preventDefault();
        const episodeNumber = this.value;
        const url = new URL(window.location.href);
        url.searchParams.set('episode', episodeNumber);

        fetch(url.toString(), { headers: { 'X-Requested-With': 'XMLHttpRequest' }})
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const newMainVideoSrc = doc.querySelector("video.film-play").getAttribute('src');
                const newSeriesInfo = doc.querySelector(".series-info");

                mainVideo.src = newMainVideoSrc;
                seriesInfo.innerHTML = newSeriesInfo.innerHTML;

                mainVideo.pause();
                playPauseBtn.classList.replace("fa-pause", "fa-play");
            })
            .catch(error => console.error('Error:', error));
    });

    // Event listener for the close button
    closeBtn.addEventListener("click", function() {
        // Close the player by hiding the container
        document.getElementById("film-popup").style.display = "none";
        mainVideo.pause();
        playPauseBtn.classList.replace("fa-pause", "fa-play");
    });

    // Event listener for "Смотреть Фильм" button
    document.querySelector(".show-player").addEventListener("click", function() {
        container.style.display = "block";
        openFullscreen(); // Open in fullscreen mode
        initializeAndPlayVideo(); // Start playing the video
    });

    window.addEventListener("DOMContentLoaded", (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const seasonNumber = urlParams.get('season');
        const episodeNumber = urlParams.get('episode');

        if (seasonNumber) {
            seasonSelect.value = seasonNumber;
        }

        if (episodeNumber) {
            episodeSelect.value = episodeNumber;
        }

        if (seasonNumber || episodeNumber) {
            const event = new Event('change');
            seasonSelect.dispatchEvent(event);
            episodeSelect.dispatchEvent(event);
        }
    });
});
