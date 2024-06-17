document.addEventListener('DOMContentLoaded', function() {
    const previewBlock = document.getElementById('preview-block');
    const previewTitle = document.getElementById('preview-title');
    const previewDesc = document.getElementById('preview-desc');
    const previewTrailerBtn = document.querySelector('.preview-trailer-btn');
    const previewFilmBtn = document.querySelector('.preview-film-btn');
    const mainVideo = document.getElementById('main-video');
    const trailerVideo = document.getElementById('main-video-tr');
    const seriesInfo = document.querySelector('.series-info');
    const seriesSelectorContainer = document.querySelector('.series-selector-container');
    const seasonSelect = document.getElementById('season-select');
    const episodeSelect = document.getElementById('episode-select');
    const seasonInfo = document.querySelector('.series-info span:nth-child(1)');
    const episodeInfo = document.querySelector('.series-info span:nth-child(2)');
    let intervalId;

    const container = document.querySelector("#film-popup .containerr"),
        filmMainVideo = container.querySelector("video.film-play"),
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
        seriesSelectorContainerFilm = document.querySelector(".series-selector-container"),
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
        if (filmMainVideo.paused) return;
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
        let percent = Math.floor((offsetX / timelineWidth) * filmMainVideo.duration);
        const progressTime = videoTimeline.querySelector("span");
        offsetX = offsetX < 20 ? 20 : (offsetX > timelineWidth - 20) ? timelineWidth - 20 : offsetX;
        progressTime.style.left = `${offsetX}px`;
        progressTime.innerText = formatTime(percent);
    });

    // Update video time on timeline click
    videoTimeline.addEventListener("click", e => {
        let timelineWidth = videoTimeline.clientWidth;
        let offsetX = e.clientX - videoTimeline.getBoundingClientRect().left;
        filmMainVideo.currentTime = (offsetX / timelineWidth) * filmMainVideo.duration;
    });

    // Update progress bar and current time as video plays
    filmMainVideo.addEventListener("timeupdate", e => {
        let { currentTime, duration } = e.target;
        let percent = (currentTime / duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentVidTime.innerText = formatTime(currentTime);
    });

    // Set video duration on video load
    filmMainVideo.addEventListener("loadeddata", () => {
        videoDuration.innerText = formatTime(filmMainVideo.duration);
    });

    // Dragging progress bar
    videoTimeline.addEventListener("mousedown", e => {
        const timelineWidth = videoTimeline.clientWidth;

        const onMouseMove = e => {
            let offsetX = e.clientX - videoTimeline.getBoundingClientRect().left;
            const percentage = offsetX / timelineWidth;
            offsetX = Math.max(0, Math.min(offsetX, timelineWidth));
            progressBar.style.width = `${(percentage * 100).toFixed(2)}%`;
            filmMainVideo.currentTime = percentage * filmMainVideo.duration;
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
            filmMainVideo.volume = 0.5;
            volumeBtn.classList.replace("fa-volume-xmark", "fa-volume-high");
        } else {
            filmMainVideo.volume = 0.0;
            volumeBtn.classList.replace("fa-volume-high", "fa-volume-xmark");
        }
        volumeSlider.value = filmMainVideo.volume;
    });

    // Adjust volume with slider
    volumeSlider.addEventListener("input", e => {
        filmMainVideo.volume = e.target.value;
        volumeBtn.classList[filmMainVideo.volume == 0 ? 'replace' : 'replace']("fa-volume-xmark", "fa-volume-high");
    });

    // Play/Pause video
    playPauseBtn.addEventListener("click", () => {
        if (filmMainVideo.paused) {
            filmMainVideo.play();
            playPauseBtn.classList.replace("fa-play", "fa-pause");
        } else {
            filmMainVideo.pause();
            playPauseBtn.classList.replace("fa-pause", "fa-play");
        }
    });

    // Skip backward
    skipBackward.addEventListener("click", () => {
        filmMainVideo.currentTime = Math.max(0, filmMainVideo.currentTime - 5);
    });

    // Skip forward
    skipForward.addEventListener("click", () => {
        filmMainVideo.currentTime = Math.min(filmMainVideo.duration, filmMainVideo.currentTime + 5);
    });

    // Change playback speed
    speedBtn.addEventListener("click", () => {
        speedOptions.classList.toggle("show");
    });

    speedOptions.querySelectorAll("li").forEach(option => {
        option.addEventListener("click", () => {
            speedOptions.querySelector("li.active").classList.remove("active");
            option.classList.add("active");
            filmMainVideo.playbackRate = option.dataset.speed;
            speedOptions.classList.remove("show");
        });
    });

    // Picture-in-picture mode
    pipBtn.addEventListener("click", () => {
        filmMainVideo.requestPictureInPicture();
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
        filmMainVideo.play();
        playPauseBtn.classList.replace("fa-play", "fa-pause");
    };

    // Function to stop video
    const stopVideo = () => {
        filmMainVideo.pause();
        playPauseBtn.classList.replace("fa-pause", "fa-play");
        filmMainVideo.currentTime = 0;
    };

    // Initialize controls on video
    container.classList.add("show-controls");

    // Close video player
    closeBtn.addEventListener("click", () => {
        stopVideo();
        container.classList.remove("show-controls");
        container.classList.remove("open");
    });

    // Show season and episode info
    seasonSelect.addEventListener('change', updateSeriesInfo);
    episodeSelect.addEventListener('change', updateSeriesInfo);

    function updateSeriesInfo() {
        const selectedSeason = seasonSelect.value;
        const selectedEpisode = episodeSelect.value;
        seasonInfo.textContent = `Сезон ${selectedSeason}`;
        episodeInfo.textContent = `Эпизод ${selectedEpisode}`;
    }

    // Example initialization of video player with series data
    function initializeVideoPlayer(season, episode) {
        seasonSelect.value = season;
        episodeSelect.value = episode;
        updateSeriesInfo();
        initializeAndPlayVideo();
    }

    // Event listeners for series selector
    seasonSelect.addEventListener('change', () => {
        const selectedSeason = seasonSelect.value;
        episodeSelect.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Эпизод ${i}`;
            episodeSelect.appendChild(option);
        }
        episodeSelect.value = 1;
        updateSeriesInfo();
        initializeAndPlayVideo();
    });

    episodeSelect.addEventListener('change', () => {
        updateSeriesInfo();
        initializeAndPlayVideo();
    });

    // Initial setup
    initializeVideoPlayer(1, 1);  // Assuming you want to start with Season 1, Episode 1


});
