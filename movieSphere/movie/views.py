from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.db.models import Q
from django.db.models.functions import ExtractYear
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.views.generic import ListView, DetailView, TemplateView
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
import random
from .forms import ReviewForm, RatingForm, UserRegisterForm, UserLoginForm, UserProfileUpdateForm, InteractionForm
from .models import Movie, Rating, RatingStar, Reviews, Genre, Profile, Actor, MovieInteraction, MovieInteractionState


class MainView(ListView):
    model = Movie
    template_name = 'movie/index.html'
    context_object_name = 'movies'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        popular_movies = Movie.get_popular_movies(limit=3)  # Ограничиваем количество популярных фильмов до 3
        current_movie = random.choice(popular_movies) if popular_movies else None
        context['current_movie'] = current_movie
        context['popular_movies'] = popular_movies
        context['genres'] = Genre.objects.all()[:6]
        context['editors_choice_movies'] = Movie.get_editors_choice()[:3]
        if current_movie and current_movie.is_series:
            current_season = current_movie.seasons.first()
            context['current_season'] = current_season
            context['current_episode'] = current_season.episodes.first() if current_season else None
        else:
            context['current_season'] = None
            context['current_episode'] = None
        context['trailer_url'] = current_movie.trailer.url if current_movie.trailer else None
        return context


def index(request):
    popular_movies = Movie.get_popular_movies(limit=10)
    first_movie = random.choice(popular_movies) if popular_movies else None
    genres = Genre.objects.all()[:6]
    trailer_url = first_movie.trailer.url if first_movie and first_movie.trailer else None
    current_season = first_movie.seasons.first() if first_movie and first_movie.is_series else None
    current_episode = current_season.episodes.first() if current_season else None
    return render(request, 'movie/index.html', {
        'current_movie': first_movie,
        'popular_movies': popular_movies,
        'genres': genres,
        'trailer_url': trailer_url,
        'current_season': current_season,
        'current_episode': current_episode,
    })


def get_random_movie(request):
    movie = random.choice(Movie.get_popular_movies(limit=10))
    data = {
        'title': movie.title,
        'description': movie.description,
        'preview_poster': movie.preview_poster.url,
        'trailer_url': movie.trailer.url if movie.trailer else None,
        'movie_url': movie.movie_file.url if movie.movie_file else None,
        'is_series': movie.is_series,
        'seasons': [{
            'id': season.id,
            'season_number': season.season_number,
            'episodes': [{
                'id': episode.id,
                'episode_number': episode.episode_number,
                'title': episode.title,
                'description': episode.description,
                'video_url': episode.video.url
            } for episode in season.episodes.all()]
        } for season in movie.seasons.all()] if movie.is_series else None,
    }
    return JsonResponse(data)


class MoviesView(ListView):
    """Список фильмов или сериалов"""
    model = Movie
    template_name = 'movie/movie_list.html'
    context_object_name = 'movies'
    paginate_by = 5

    def get_queryset(self):
        queryset = Movie.objects.filter(draft=False)
        category = self.request.GET.get('category')
        query = self.request.GET.get('q')
        genres = self.request.GET.getlist('genre')
        years = self.request.GET.getlist('year')

        if query:
            queryset = queryset.filter(Q(title__icontains=query) | Q(description__icontains=query))

        if category == 'serials':
            queryset = queryset.filter(category__name='Сериалы')
        elif category == 'movies':
            queryset = queryset.filter(category__name='Фильмы')
        elif category == 'cartoons':
            queryset = queryset.filter(category__name='Мультфильмы')

        if genres:
            queryset = queryset.filter(genre__name__in=genres).distinct()
        if years:
            queryset = queryset.annotate(movie_year=ExtractYear('world_premiere')).filter(movie_year__in=years)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        category = self.request.GET.get('category')
        all_genres = Genre.objects.all()
        all_years = Movie.objects.annotate(movie_year=ExtractYear('world_premiere')).values_list('movie_year', flat=True).distinct().order_by('movie_year')

        context['first_five_genres'] = all_genres[:5]
        context['remaining_genres'] = all_genres[5:]
        context['first_five_years'] = all_years[:5]
        context['remaining_years'] = all_years[5:]

        context['category'] = category
        context['query'] = self.request.GET.get('q')

        if category == 'serials':
            context['page_title'] = 'Сериалы'
        elif category == 'movies':
            context['page_title'] = 'Фильмы'
        elif category == 'cartoons':
            context['page_title'] = 'Мультфильмы'

        query_params = self.request.GET.copy()
        if 'page' in query_params:
            query_params.pop('page')
        context['query_params'] = query_params

        return context


class FavoriteMoviesView(LoginRequiredMixin, ListView):
    model = Movie
    template_name = 'movie/movie_list_interaction.html'
    context_object_name = 'movies'
    paginate_by = 13

    def get_queryset(self):
        return Movie.objects.filter(movieinteraction__user=self.request.user, movieinteraction__is_favorite=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Любимые фильмы'
        return context


class WatchedMoviesView(LoginRequiredMixin, ListView):
    model = Movie
    template_name = 'movie/movie_list_interaction.html'
    context_object_name = 'movies'
    paginate_by = 13

    def get_queryset(self):
        return Movie.objects.filter(movieinteraction__user=self.request.user, movieinteraction__is_watched=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Просмотренные фильмы'
        return context


class PlannedMoviesView(LoginRequiredMixin, ListView):
    model = Movie
    template_name = 'movie/movie_list_interaction.html'
    context_object_name = 'movies'
    paginate_by = 13

    def get_queryset(self):
        return Movie.objects.filter(movieinteraction__user=self.request.user, movieinteraction__is_planned=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Фильмы в планах'
        return context


class ToggleInteractionView(View):
    def get(self, request, movie_id, interaction_type):
        movie = get_object_or_404(Movie, id=movie_id)
        interaction, created = MovieInteraction.objects.get_or_create(user=request.user, movie=movie)

        if interaction_type == 'favorite':
            interaction.is_favorite = not interaction.is_favorite
            state = interaction.is_favorite
        elif interaction_type == 'watched':
            interaction.is_watched = not interaction.is_watched
            state = interaction.is_watched
        elif interaction_type == 'planned':
            interaction.is_planned = not interaction.is_planned
            state = interaction.is_planned
        else:
            return JsonResponse({'error': 'Invalid interaction type'}, status=400)

        interaction.save()
        return JsonResponse({f'is_{interaction_type}': state})


class EditorsChoiceView(ListView):
    model = Movie
    template_name = 'movie/editors_choice.html'
    context_object_name = 'editors_choice_movies'

    def get_queryset(self):
        return Movie.get_editors_choice()


class MovieDetailView(DetailView):
    model = Movie
    slug_field = "url"
    template_name = 'movie/movie_detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        movie = self.object
        context["star_form"] = RatingForm()
        context["review_form"] = ReviewForm(initial={'parent': self.request.POST.get('parent_id')})
        context["reviews"] = movie.get_reviews()
        context["review_replies"] = self.get_review_replies(context["reviews"])
        context["current_season"], context["current_episode"] = self.get_current_season_and_episode(movie)
        context["has_movie_file"] = bool(movie.movie_file)


        if self.request.user.is_authenticated:
            interaction = MovieInteraction.objects.filter(user=self.request.user, movie=movie).first()
            context['interaction'] = interaction

        context['interaction_states'] = MovieInteractionState.objects.all()

        # Добавляем количество актеров в контекст
        context['actors_count'] = movie.actors.count()

        return context

    def get_review_replies(self, reviews):
        review_replies = {}
        for review in reviews:
            replies = Reviews.objects.filter(parent=review)
            if replies:
                review_replies[review.id] = replies
        return review_replies

    def get_current_season_and_episode(self, movie):
        current_season_number = self.request.GET.get('season')
        if not current_season_number:
            current_season = movie.seasons.first()
        else:
            current_season = movie.seasons.filter(season_number=current_season_number).first()

        if current_season:
            current_episode_number = self.request.GET.get('episode')
            if not current_episode_number:
                current_episode = current_season.episodes.first()
            else:
                current_episode = current_season.episodes.filter(episode_number=current_episode_number).first()
        else:
            current_episode = None

        return current_season, current_episode

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get(self, request, slug):

        movie = get_object_or_404(Movie, url=slug)
        self.object = movie
        context = self.get_context_data()
        context.update({
            'movie': movie,
            'average_rating': movie.calculate_average_rating(),
            'user_rating': self.get_user_rating(movie, request),
            'trailer_url': movie.trailer.url,
            'series_info': movie.get_series_info() if movie.is_series else None
        })
        return render(request, self.template_name, context)

    def get_user_rating(self, movie, request):
        try:
            return Rating.objects.get(movie=movie, ip=self.get_client_ip(request)).star.value
        except Rating.DoesNotExist:
            return None

    def post(self, request, slug):
        movie = get_object_or_404(Movie, url=slug)
        form = RatingForm(request.POST)
        interaction_form = InteractionForm(request.POST)

        if form.is_valid():
            self.save_user_rating(movie, form.cleaned_data['rating'], request)
            movie.calculate_average_rating()

        if interaction_form.is_valid() and request.user.is_authenticated:
            self.save_user_interaction(movie, interaction_form.cleaned_data, request)

        return redirect('movie_detail', slug=slug)

    def save_user_rating(self, movie, rating, request):
        ip = self.get_client_ip(request)
        try:
            user_rating = Rating.objects.get(movie=movie, ip=ip)
            user_rating.star.value = rating
            user_rating.star.save()
            user_rating.save()
        except Rating.DoesNotExist:
            star = RatingStar.objects.create(value=rating)
            Rating.objects.create(movie=movie, star=star, ip=ip)

    def save_user_interaction(self, movie, cleaned_data, request):
        interaction, created = MovieInteraction.objects.get_or_create(user=request.user, movie=movie)
        interaction.is_favorite = cleaned_data['is_favorite']
        interaction.is_watched = cleaned_data['is_watched']
        interaction.is_planned = cleaned_data['is_planned']
        interaction.save()


class ActorDetailView(DetailView):
    model = Actor
    template_name = 'movie/act.html'
    context_object_name = 'actor'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        actor = self.get_object()
        context['popular_movies'] = actor.get_popular_movies()
        return context


class ActorListView(ListView):
    model = Actor
    template_name = 'movie/actor_list.html'
    context_object_name = 'actors'
    paginate_by = 10

    def get_queryset(self):
        movie = get_object_or_404(Movie, url=self.kwargs['slug'])
        queryset = movie.actors.all()

        search_query = self.request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['movie'] = get_object_or_404(Movie, url=self.kwargs['slug'])
        context['search'] = self.request.GET.get('search', '')
        return context


class AddReview(View):
    """Отзывы"""

    def post(self, request, pk):
        form = ReviewForm(request.POST)
        movie = get_object_or_404(Movie, id=pk)
        parent_id = request.POST.get('parent_id')

        if form.is_valid():
            review = form.save(commit=False)
            review.user = request.user
            review.movie = movie
            if parent_id:
                review.parent = Reviews.objects.get(id=parent_id)
            review.save()
        return redirect(movie.get_absolute_url())


class AddStarRating(View):
    """Добавление рейтинга фильму"""

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def post(self, request):
        form = RatingForm(request.POST)
        if form.is_valid():
            rating, created = Rating.objects.update_or_create(
                ip=self.get_client_ip(request),
                movie_id=int(request.POST.get("movie")),
                defaults={'star_id': int(request.POST.get("star"))}
            )
            return JsonResponse({'rating': rating.star.value}, status=201)
        else:
            return HttpResponse(status=400)


class GetRatingView(View):
    def get(self, request):
        movie_id = request.GET.get('movie_id')
        try:
            movie = Movie.objects.get(pk=movie_id)
            ratings = Rating.objects.filter(movie=movie)
            if ratings.exists():
                rating_value = ratings.first().star.value
                return JsonResponse({'rating': rating_value})
            else:
                return JsonResponse({'rating': 0})
        except Movie.DoesNotExist:
            return JsonResponse({'error': 'Фильм не найден'}, status=404)


class SearchView(View):
    def get(self, request):
        query = request.GET.get('q')
        if query:
            movies = Movie.objects.filter(Q(title__icontains=query) | Q(description__icontains=query))
            return render(request, 'movie/movie_list.html', {'movies': movies})
        else:
            return redirect('movies')


class GenreListView(ListView):
    model = Genre
    template_name = 'movie/genre.html'
    context_object_name = 'genres'
    paginate_by = 10

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        paginator = context.get('paginator')
        page_obj = context.get('page_obj')

        # Ensure the page is within the valid range
        try:
            context['page_obj'] = paginator.page(page_obj.number)
        except PageNotAnInteger:
            context['page_obj'] = paginator.page(1)
        except EmptyPage:
            context['page_obj'] = paginator.page(paginator.num_pages)

        context['is_paginated'] = page_obj.has_other_pages()
        return context


class PopularMoviesView(TemplateView):
    template_name = 'movie/popularity.html'
    paginate_by = 5

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        popular_movies = Movie.get_popular_movies().all()

        paginator = Paginator(popular_movies, self.paginate_by)
        page_number = self.request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context['page_obj'] = page_obj
        context['is_paginated'] = page_obj.has_other_pages()
        return context


class AjaxLoginView(View):
    def post(self, request):
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('/account/profile/')
            else:
                return JsonResponse({'success': False, 'message': 'Invalid credentials'})
        else:
            return JsonResponse({'success': False, 'message': 'Invalid form data'})


class AjaxRegisterView(View):
    def post(self, request):
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()  # This saves the user and profile
            user.backend = 'movie.backends.EmailBackend'  # Укажите ваш кастомный бэкенд
            login(request, user)  # Automatically log in the user after registration
            return redirect('/account/profile/')
        else:
            return JsonResponse({'success': False, 'message': 'Invalid form data.', 'errors': form.errors})


class ProfileView(View):
    def get(self, request):
        user_profile, created = Profile.objects.get_or_create(user=request.user)
        initial_data = {
            'username': request.user.username,
            'email': request.user.email,
            'phone': user_profile.phone,
            'photo': user_profile.photo.url if user_profile.photo else None,
        }
        form = UserProfileUpdateForm(initial=initial_data)
        context = {'form': form}
        return render(request, 'movie/profile.html', context)

    def post(self, request):
        form = UserProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            user = request.user
            user.username = form.cleaned_data['username']
            user.email = form.cleaned_data['email']
            user.save()

            profile = user.profile
            profile.phone = form.cleaned_data['phone']
            if form.cleaned_data['photo']:
                profile.photo = form.cleaned_data['photo']
            profile.save()

            response_data = {
                'success': True,
                'username': user.username,
                'email': user.email,
                'phone': profile.phone,
                'photo_url': profile.photo.url if profile.photo else None,
            }
            return JsonResponse(response_data)
        else:
            errors = form.errors.as_json()
            return JsonResponse({'success': False, 'errors': errors})


@method_decorator(login_required, name='dispatch')
class ProfilePhotoUploadView(View):
    def post(self, request):
        user = request.user
        profile = user.profile
        if 'photo' in request.FILES:
            profile.photo = request.FILES['photo']
            profile.save()
            # Get the URL of the uploaded photo
            photo_url = profile.photo.url
            response_data = {
                'success': True,
                'photo_url': photo_url,  # Return the URL instead of the ImageFieldFile object
            }
            return redirect('profile')
        return JsonResponse({'success': False, 'errors': 'No photo uploaded'})


@method_decorator(login_required, name='dispatch')
class ProfilePhotoRemoveView(View):
    def post(self, request):
        user = request.user
        profile = user.profile
        if profile.photo:
            profile.photo.delete(save=False)  # Remove the photo without saving immediately
            profile.photo = None
            profile.save()  # Now save the profile
            return JsonResponse({'success': True})
        return JsonResponse({'success': False, 'errors': 'No photo to delete'})


class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('home')
