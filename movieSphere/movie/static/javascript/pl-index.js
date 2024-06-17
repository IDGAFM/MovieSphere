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

    // Update the preview block content
    function updatePreviewBlock(movieData) {
        previewBlock.classList.add('fade-out');
        previewTitle.classList.add('fade-out');
        previewDesc.classList.add('fade-out');

        setTimeout(() => {
            previewTitle.textContent = movieData.title;
            previewDesc.textContent = movieData.description;
            previewBlock.style.backgroundImage = `url(${movieData.preview_poster})`;
            mainVideo.src = movieData.is_series ? '' : (movieData.movie_url ? movieData.movie_url : '');
            trailerVideo.src = movieData.trailer_url ? movieData.trailer_url : '';

            if (movieData.is_series) {
                seriesInfo.style.display = 'block';
                seriesSelectorContainer.style.display = 'block';

                seasonInfo.textContent = `Сезон: ${movieData.seasons[0].season_number}`;
                episodeInfo.textContent = `Серия: ${movieData.seasons[0].episodes[0].episode_number}`;

                seasonSelect.innerHTML = '';
                episodeSelect.innerHTML = '';

                movieData.seasons.forEach((season, seasonIndex) => {
                    const seasonOption = document.createElement('option');
                    seasonOption.value = seasonIndex;
                    seasonOption.textContent = `Сезон ${season.season_number}`;
                    seasonSelect.appendChild(seasonOption);
                });

                const updateEpisodeOptions = (seasonIndex) => {
                    const selectedSeason = movieData.seasons[seasonIndex];
                    episodeSelect.innerHTML = '';
                    selectedSeason.episodes.forEach((episode, episodeIndex) => {
                        const episodeOption = document.createElement('option');
                        episodeOption.value = episodeIndex;
                        episodeOption.textContent = `Серия ${episode.episode_number}`;
                        episodeSelect.appendChild(episodeOption);
                    });
                    episodeSelect.dispatchEvent(new Event('change'));
                };

                seasonSelect.addEventListener('change', function() {
                    const selectedSeasonIndex = seasonSelect.value;
                    updateEpisodeOptions(selectedSeasonIndex);
                });

                episodeSelect.addEventListener('change', function() {
                    const selectedSeasonIndex = seasonSelect.value;
                    const selectedEpisodeIndex = episodeSelect.value;
                    const selectedSeason = movieData.seasons[selectedSeasonIndex];
                    const selectedEpisode = selectedSeason.episodes[selectedEpisodeIndex];
                    mainVideo.src = selectedEpisode.video_url;
                    seasonInfo.textContent = `Сезон: ${selectedSeason.season_number}`;
                    episodeInfo.textContent = `Серия: ${selectedEpisode.episode_number}`;
                });

                seasonSelect.dispatchEvent(new Event('change'));
            } else {
                seriesInfo.style.display = 'none';
                seriesSelectorContainer.style.display = 'none';
            }

            previewBlock.classList.remove('fade-out');
            previewBlock.classList.add('fade-in');
            previewTitle.classList.remove('fade-out');
            previewTitle.classList.add('fade-in');
            previewDesc.classList.remove('fade-out');
            previewDesc.classList.add('fade-in');
        }, 300);
    }

    // Fetch a random movie from the server
    function fetchRandomMovie() {
        fetch("{% url 'get_random_movie' %}")
            .then(response => response.json())
            .then(data => updatePreviewBlock(data))
            .catch(error => console.error('Error fetching random movie:', error));
    }

    // Auto-switch between movies
    function startAutoSwitching() {
        intervalId = setInterval(fetchRandomMovie, 10000);
    }

    // Stop auto-switching
    function stopAutoSwitching() {
        clearInterval(intervalId);
    }

    // Add event listeners for the buttons
    previewTrailerBtn.addEventListener('click', function() {
        document.getElementById('trailer-popup').style.display = 'block';
        stopAutoSwitching();
    });

    previewFilmBtn.addEventListener('click', function() {
        document.getElementById('film-popup').style.display = 'block';
        stopAutoSwitching();
    });

    // Close buttons for the popups
    document.querySelector('#trailer-popup .close').addEventListener('click', function() {
        document.getElementById('trailer-popup').style.display = 'none';
        startAutoSwitching();
    });

    document.querySelector('#film-popup .close').addEventListener('click', function() {
        document.getElementById('film-popup').style.display = 'none';
        startAutoSwitching();
    });

    // Initial data setup
    updatePreviewBlock({
        title: "{{ current_movie.title }}",
        description: "{{ current_movie.description|truncatewords:60 }}",
        preview_poster: "{{ current_movie.preview_poster.url }}",
        trailer_url: "{{ trailer_url }}",
        movie_url: "{% if current_movie.movie_file %}{{ current_movie.movie_file.url }}{% endif %}",
        is_series: {{ current_movie.is_series|yesno:"true,false" }},
        seasons: [
            {% for season in current_movie.seasons.all %}
            {
                season_number: {{ season.season_number }},
                episodes: [
                    {% for episode in season.episodes.all %}
                    {
                        episode_number: {{ episode.episode_number }},
                        video_url: "{{ episode.video.url }}"
                    }
                    {% if not forloop.last %},{% endif %}
                    {% endfor %}
                ]
            }
            {% if not forloop.last %},{% endif %}
            {% endfor %}
        ]
    });

    startAutoSwitching();
});

