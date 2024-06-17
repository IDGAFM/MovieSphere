from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Genre, Movie, MovieShots, Actor, Rating, RatingStar, Reviews, Profile, Season, Episode, \
    MovieInteraction, MovieInteractionState
from django.db import models
from django import forms


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'url')
    search_fields = ('name',)


class GenreAdmin(admin.ModelAdmin):
    list_display = ('name', 'genre_image', 'url')
    search_fields = ('name',)
    prepopulated_fields = {"url": ("name",)}

    def genre_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; border-radius: 6px;" />', obj.image.url)
        return "No Image"

    genre_image.short_description = 'Image'


class ActorAdmin(admin.ModelAdmin):
    list_display = ('name', 'age', 'actor_image')
    search_fields = ('name',)
    list_filter = ('age',)
    save_on_top = True
    fieldsets = (
        ('Инфо', {
            'fields': ('name', 'age', 'birth_date', 'birth_place', 'descriptions', 'image')
        }),

        ('Жанры', {
            'fields': ('genres', 'movies_count')
        }),

        ('Карьера', {
            'fields': ('career', 'height')
        }),

    )

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == 'genres':
            kwargs['widget'] = admin.widgets.FilteredSelectMultiple(db_field.verbose_name, is_stacked=False)
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def actor_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 100px; height: 100px; border-radius: 6px;" />',
                               obj.image.url)
        return "No Image"

    actor_image.short_description = 'Image'

    class Media:
        css = {
            'all': ('css/custom_admin.css',)
        }
        js = ('js/admin.js',)


class ReviewInline(admin.TabularInline):
    model = Reviews
    extra = 1
    readonly_fields = ('email', 'text')


class MovieAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'world_premiere', 'category',
        'draft', 'is_series', 'poster_thumbnail', 'duration_hours', 'duration_minutes',
    )
    list_filter = ('year', 'category', 'draft')
    search_fields = ('title', 'description')
    prepopulated_fields = {"url": ("title",)}
    readonly_fields = ('preview_poster_thumbnail', 'poster_thumbnail')
    fieldsets = (
        ('Название', {
            'fields': ('title', 'tagline', 'description')
        }),
        ('Файлы', {
            'fields': ('preview_poster', 'preview_poster_thumbnail', 'poster', 'poster_thumbnail', 'trailer', 'movie_file')
        }),

        ('Люди', {
            'fields': ('directors', 'actors', 'genre'),
            'classes': ('collapse',)
        }),

        ('Год', {
            'fields': ('country', 'year', 'world_premiere', 'average_rating',)

        }),

        ('Время', {
            'fields': ('duration_hours', 'duration_minutes')

        }),

        ('Сборы', {
            'fields': ('budget', 'box_office_usa', 'box_office_world')

        }),

        ('Доп данные', {
            'fields': ('category', 'url', 'draft', 'is_series', 'is_editors_choice')

        }),

        ('Additional Information', {
            'fields': ('external_link',),
            'classes': ('collapse',)
        }),
    )

    inlines = [ReviewInline]
    save_on_top = True
    list_editable = ('draft', 'is_series')

    class Media:
        css = {
            'all': ('css/custom_admin.css',)
        }
        js = ('js/admin.js',)

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name in ['directors', 'actors', 'genre']:
            kwargs['widget'] = admin.widgets.FilteredSelectMultiple(db_field.verbose_name, is_stacked=False)
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def preview_poster_thumbnail(self, obj):
        if obj.preview_poster:
            return format_html('<img src="{}" style="width: 350px; height: 100px;" />', obj.preview_poster.url)
        return "No Image"

    preview_poster_thumbnail.short_description = 'Постер ListView'

    def poster_thumbnail(self, obj):
        if obj.poster:
            return format_html('<img src="{}" style="width: 100px; height: 100px;" />', obj.poster.url)
        return "No Image"

    poster_thumbnail.short_description = 'Постер'


class SeasonAdmin(admin.ModelAdmin):
    list_display = ('movie', 'season_number', 'title')
    list_filter = ('movie', 'season_number')
    search_fields = ('movie__title', 'season_number', 'title')


class EpisodeAdmin(admin.ModelAdmin):
    list_display = ('season', 'episode_number', 'title')
    list_filter = ('season', 'episode_number')
    search_fields = ('season__movie__title', 'season__season_number', 'episode_number', 'title')


class MovieShotsAdmin(admin.ModelAdmin):
    list_display = ('title', 'movie')
    search_fields = ('title', 'movie__title')


class RatingAdmin(admin.ModelAdmin):
    list_display = ('movie', 'star', 'ip')
    list_filter = ('star',)
    search_fields = ('movie__title', 'ip')


class RatingStarAdmin(admin.ModelAdmin):
    list_display = ('value',)


class ReviewsAdmin(admin.ModelAdmin):
    list_display = ('email', 'movie', 'parent')
    search_fields = ('email', 'movie__title', 'text')


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'email', 'username')
    search_fields = ('user__username', 'email')


# Регистрация моделей с кастомными администраторами
admin.site.register(Category, CategoryAdmin)
admin.site.register(Genre, GenreAdmin)
admin.site.register(Movie, MovieAdmin)
admin.site.register(MovieShots, MovieShotsAdmin)
admin.site.register(Actor, ActorAdmin)
admin.site.register(Rating, RatingAdmin)
admin.site.register(RatingStar, RatingStarAdmin)
admin.site.register(Reviews, ReviewsAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Season, SeasonAdmin)
admin.site.register(Episode, EpisodeAdmin)
admin.site.register(MovieInteraction)
admin.site.register(MovieInteractionState)
