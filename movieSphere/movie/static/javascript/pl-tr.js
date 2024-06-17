const trailerContainer = document.querySelector(".container-trailer"),
    trailerMainVideo = trailerContainer.querySelector(".tr"),
    trailerVideoTimeline = trailerContainer.querySelector(".video-timeline-trailer"),
    trailerProgressBar = trailerContainer.querySelector(".progress-bar-trailer"),
    trailerVolumeBtn = trailerContainer.querySelector(".volume i"),
    trailerVolumeSlider = trailerContainer.querySelector(".left input"),
    trailerCurrentVidTime = trailerContainer.querySelector(".current-time"),
    trailerVideoDuration = trailerContainer.querySelector(".video-duration"),
    trailerSkipBackward = trailerContainer.querySelector(".skip-backward i"),
    trailerSkipForward = trailerContainer.querySelector(".skip-forward i"),
    trailerPlayPauseBtn = trailerContainer.querySelector(".play-pause i"),
    trailerSpeedBtn = trailerContainer.querySelector(".playback-speed span"),
    trailerSpeedOptions = trailerContainer.querySelector(".speed-options-trailer"),
    trailerPipBtn = trailerContainer.querySelector(".pic-in-pic span"),
    trailerFullScreenBtn = trailerContainer.querySelector(".fullscreen i"),
    trailerCloseBtn = trailerContainer.querySelector(".close");

let trailerTimer;

// Function to hide all elements after 5 seconds
const trailerHideAllElements = () => {
    trailerContainer.classList.remove("show-controls");
};

// Update hideControls function
const trailerHideControls = () => {
    if (trailerMainVideo.paused) return;
    clearTimeout(trailerTimer);  // Stop previous timer
    trailerTimer = setTimeout(() => {
        trailerHideAllElements();
    }, 5000);
};
trailerHideControls();

// Show controls on mouse move
trailerContainer.addEventListener("mousemove", () => {
    trailerContainer.classList.add("show-controls");
    clearTimeout(trailerTimer);
    trailerHideControls();
});

document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        clearTimeout(trailerTimer);
        trailerContainer.classList.add("show-controls");
    } else {
        trailerHideAllElements();
    }
});

// Format time
const trailerFormatTime = time => {
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
trailerVideoTimeline.addEventListener("mousemove", e => {
    let timelineWidth = trailerVideoTimeline.clientWidth;
    let offsetX = e.offsetX;
    let percent = Math.floor((offsetX / timelineWidth) * trailerMainVideo.duration);
    const progressTime = trailerVideoTimeline.querySelector("span");
    offsetX = offsetX < 20 ? 20 : (offsetX > timelineWidth - 20) ? timelineWidth - 20 : offsetX;
    progressTime.style.left = `${offsetX}px`;
    progressTime.innerText = trailerFormatTime(percent);
});

// Update video time on timeline click
trailerVideoTimeline.addEventListener("click", e => {
    let timelineWidth = trailerVideoTimeline.clientWidth;
    trailerMainVideo.currentTime = (e.offsetX / timelineWidth) * trailerMainVideo.duration;
});

// Update progress bar and current time as video plays
trailerMainVideo.addEventListener("timeupdate", e => {
    let { currentTime, duration } = e.target;
    let percent = (currentTime / duration) * 100;
    trailerProgressBar.style.width = `${percent}%`;
    trailerCurrentVidTime.innerText = trailerFormatTime(currentTime);
});

// Set video duration on video load
trailerMainVideo.addEventListener("loadeddata", () => {
    trailerVideoDuration.innerText = trailerFormatTime(trailerMainVideo.duration);
});

// Dragging progress bar
trailerVideoTimeline.addEventListener("mousedown", e => {
    const onMouseMove = e => {
        let timelineWidth = trailerVideoTimeline.clientWidth;
        let offsetX = e.offsetX;
        trailerProgressBar.style.width = `${offsetX}px`;
        trailerMainVideo.currentTime = (offsetX / timelineWidth) * trailerMainVideo.duration;
    };
    const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
});

// Toggle volume
trailerVolumeBtn.addEventListener("click", () => {
    if (!trailerVolumeBtn.classList.contains("fa-volume-high")) {
        trailerMainVideo.volume = 0.5;
        trailerVolumeBtn.classList.replace("fa-volume-xmark", "fa-volume-high");
    } else {
        trailerMainVideo.volume = 0.0;
        trailerVolumeBtn.classList.replace("fa-volume-high", "fa-volume-xmark");
    }
    trailerVolumeSlider.value = trailerMainVideo.volume;
});

// Adjust volume with slider
trailerVolumeSlider.addEventListener("input", e => {
    trailerMainVideo.volume = e.target.value;
    trailerVolumeBtn.classList[trailerMainVideo.volume == 0 ? 'replace' : 'replace']("fa-volume-xmark", "fa-volume-high");
});

// Play/Pause video
trailerPlayPauseBtn.addEventListener("click", () => {
    if (trailerMainVideo.paused) {
        trailerMainVideo.play();
        trailerPlayPauseBtn.classList.replace("fa-play", "fa-pause");
    } else {
        trailerMainVideo.pause();
        trailerPlayPauseBtn.classList.replace("fa-pause", "fa-play");
    }
});

// Skip backward
trailerSkipBackward.addEventListener("click", () => {
    trailerMainVideo.currentTime -= 5;
});

// Skip forward
trailerSkipForward.addEventListener("click", () => {
    trailerMainVideo.currentTime += 5;
});

// Change playback speed
trailerSpeedBtn.addEventListener("click", () => {
    trailerSpeedOptions.classList.toggle("show");
});

trailerSpeedOptions.querySelectorAll("li").forEach(option => {
    option.addEventListener("click", () => {
        trailerSpeedOptions.querySelector("li.active").classList.remove("active");
        option.classList.add("active");
        trailerMainVideo.playbackRate = option.dataset.speed;
        trailerSpeedOptions.classList.remove("show");
    });
});

// Picture-in-picture mode
trailerPipBtn.addEventListener("click", () => {
    trailerMainVideo.requestPictureInPicture();
});

// Fullscreen mode
const trailerOpenFullscreen = () => {
    if (!document.fullscreenElement) {
        trailerContainer.requestFullscreen().then(() => {
            trailerContainer.classList.add("show-controls");
        });
    }
};

trailerFullScreenBtn.addEventListener("click", () =>
{
    if (!document.fullscreenElement) {
        trailerOpenFullscreen();
        trailerFullScreenBtn.classList.replace("fa-expand", "fa-compress");
    } else {
        document.exitFullscreen();
        trailerFullScreenBtn.classList.replace("fa-compress", "fa-expand");
    }
});

// Fullscreen change event to hide controls
document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        clearTimeout(trailerTimer);
        trailerContainer.classList.add("show-controls");
    }
});

// Close video player
trailerCloseBtn.addEventListener("click", function() {
    // Close the player by hiding the popup
    document.getElementById("trailer-popup").style.display = "none";
    trailerMainVideo.pause();
    trailerPlayPauseBtn.classList.replace("fa-pause", "fa-play");
});
