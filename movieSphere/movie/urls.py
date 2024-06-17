from django.urls import path
from . import views
from .views import AjaxRegisterView, AjaxLoginView

urlpatterns = [
    path('', views.MainView.as_view(), name='home'),
    path('get_random_movie/', views.get_random_movie, name='get_random_movie'),
    path('account/profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/photo_upload/', views.ProfilePhotoUploadView.as_view(), name='profile_photo_upload'),
    path('profile/photo/remove/', views.ProfilePhotoRemoveView.as_view(), name='profile_photo_remove'),
    path('ajax/register/', AjaxRegisterView.as_view(), name='ajax_register'),
    path('ajax/login/', AjaxLoginView.as_view(), name='ajax_login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('actor/<int:pk>/', views.ActorDetailView.as_view(), name='actor_detail'),
    path('movies/', views.MoviesView.as_view(), name='movies'),
    path('add-rating/', views.AddStarRating.as_view(), name='add_rating'),
    path('get-rating/', views.GetRatingView.as_view(), name='get_rating'),
    path('review/<int:pk>/', views.AddReview.as_view(), name='add_review'),
    path('popularity/', views.PopularMoviesView.as_view(), name='popularity'),
    path('editors-choice/', views.EditorsChoiceView.as_view(), name='editors_choice'),
    path('search/', views.SearchView.as_view(), name='movie_search'),
    path('genres/', views.GenreListView.as_view(), name='genre_list'),
    path('favorites/', views.FavoriteMoviesView.as_view(), name='favorite_movies'),
    path('watched/', views.WatchedMoviesView.as_view(), name='watched_movies'),
    path('planned/', views.PlannedMoviesView.as_view(), name='planned_movies'),
    path('<slug:slug>/', views.MovieDetailView.as_view(), name='movie_detail'),
    path('movie/<slug:slug>/actors/', views.ActorListView.as_view(), name='actor_list'),
    path('toggle/<int:movie_id>/<str:interaction_type>/', views.ToggleInteractionView.as_view(), name='toggle_interaction'),


]
