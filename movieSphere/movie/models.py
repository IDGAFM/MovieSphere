from datetime import date
from decimal import Decimal

from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.db.models import Avg
from django.urls import reverse


class Category(models.Model):
    """Категории"""
    name = models.CharField("Категория", max_length=150)
    descriptions = models.TextField("Описание")
    url = models.SlugField(max_length=160, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"


class Actor(models.Model):
    """Актеры и режиссеры"""
    name = models.CharField("Имя", max_length=100)
    age = models.PositiveSmallIntegerField("Возраст", default=0,  null=True, blank=True)
    image = models.ImageField("Изображение", upload_to="actors/",  blank=True)
    career = models.CharField("Career", max_length=255, blank=True, null=True)
    height = models.FloatField("Height", blank=True, null=True)
    birth_date = models.DateField("Birth Date", blank=True, null=True, default=date.today)
    descriptions = models.TextField("Описание", blank=True, null=True)
    birth_place = models.CharField("Birth Place", max_length=255, blank=True, null=True)
    genres = models.ManyToManyField('Genre', verbose_name="Genres", related_name="actors")
    movies_count = models.PositiveIntegerField("Movies Count", default=0)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("actor_detail", kwargs={"pk": self.pk})

    def get_popular_movies(self):
        return self.film_actor.annotate(average_rating_value=Avg('rating__star__value')).order_by(
            '-average_rating_value')[:3]

    class Meta:
        verbose_name = "Актеры и режиссеры"
        verbose_name_plural = "Актеры и режиссеры"


class Genre(models.Model):
    """Жанры"""
    name = models.CharField("Имя", max_length=100)
    image = models.ImageField("Фото", upload_to='moviesGenre')
    descriptions = models.TextField("Описание")
    url = models.SlugField(max_length=160, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Жанр"
        verbose_name_plural = "Жанры"


class Movie(models.Model):
    """Фильм или сериал"""
    title = models.CharField("Название", max_length=100)
    tagline = models.CharField("Слоган", max_length=100, default='')
    preview_poster = models.ImageField("Постер на карте", upload_to="media/moviesP/")
    description = models.TextField("Описание")
    poster = models.ImageField("Постер", upload_to="media/moviesp/")
    year = models.PositiveSmallIntegerField("Дата выхода", default=2019)
    country = models.CharField("Страна", max_length=30)
    directors = models.ManyToManyField('Actor', verbose_name="Режиссеры", related_name="film_director")
    actors = models.ManyToManyField('Actor', verbose_name="Актеры", related_name="film_actor")
    genre = models.ManyToManyField('Genre', verbose_name="Жанры")
    world_premiere = models.DateField("Премьера в мире", default=date.today)
    duration_hours = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField("Средний рейтинг", max_digits=4, decimal_places=2, default=0.00)
    budget = models.PositiveIntegerField("Бюджет", default=0, help_text="указывать сумму в долларах")
    box_office_usa = models.PositiveIntegerField("Сборы в США", default=0, help_text="указывать сумму в долларах")
    box_office_world = models.PositiveIntegerField("Сборы в мире", default=0, help_text="указывать сумму в долларах")
    category = models.ForeignKey('Category', verbose_name="Категория", on_delete=models.SET_NULL, null=True)
    url = models.SlugField(max_length=130, unique=True)
    draft = models.BooleanField("Черновик", default=False)
    trailer = models.FileField("Трейлер", upload_to="media/trailers/", null=True, blank=True)
    movie_file = models.FileField("Фильм", upload_to="media/movies/", null=True, blank=True)
    external_link = models.URLField("Ссылка на внешний источник", blank=True, null=True)
    is_series = models.BooleanField("Сериал", default=False)
    is_editors_choice = models.BooleanField("Выбор редакции", default=False)  # Новое поле

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("movie_detail", kwargs={"slug": self.url})

    def calculate_average_rating(self):
        avg_rating = self.rating_set.aggregate(Avg('star__value'))['star__value__avg']
        if avg_rating is not None:
            self.average_rating = round(avg_rating, 2)
        else:
            self.average_rating = Decimal('0.00')
        self.save(update_fields=['average_rating'])
        return self.average_rating

    @classmethod
    def get_popular_movies(cls, limit=None):
        query = cls.objects.annotate(average_rating_value=Avg('rating__star__value')).filter(
            average_rating_value__isnull=False).order_by('-average_rating_value')
        if limit:
            query = query[:limit]
        return query

    @classmethod
    def get_editors_choice(cls):
        return cls.objects.filter(is_editors_choice=True)

    def get_reviews(self):
        return self.reviews_set.filter(parent__isnull=True)

    def get_total_episodes(self):
        return Episode.objects.filter(season__movie=self).count()

    def get_episode_duration(self):
        first_episode = Episode.objects.filter(season__movie=self).first()
        return first_episode.duration_minutes if first_episode else 0

    def get_series_info(self):
        return {
            'seasons_count': self.seasons.count(),
            'total_episodes': self.get_total_episodes(),
            'episode_duration': self.get_episode_duration()
        }

    class Meta:
        verbose_name = "Фильм"
        verbose_name_plural = "Фильмы"


class Season(models.Model):
    """Сезон сериала, мультфильма или аниме"""
    movie = models.ForeignKey(Movie, verbose_name="Сериал, мультфильм или аниме", on_delete=models.CASCADE,
                              related_name="seasons")
    season_number = models.PositiveIntegerField("Номер сезона")
    title = models.CharField("Название сезона", max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.movie.title} - Сезон {self.season_number}"

    class Meta:
        verbose_name = "Сезон"
        verbose_name_plural = "Сезоны"
        unique_together = ('movie', 'season_number')


class Episode(models.Model):
    """Эпизод сезона сериала, мультфильма или аниме"""
    season = models.ForeignKey(Season, verbose_name="Сезон", on_delete=models.CASCADE, related_name="episodes")
    episode_number = models.PositiveIntegerField("Номер эпизода")
    title = models.CharField("Название эпизода", max_length=100)
    description = models.TextField("Описание", blank=True, null=True)
    duration_minutes = models.PositiveIntegerField("Длительность (минуты)", default=0)
    video = models.FileField("Видео", upload_to="media/episodes/")
    external_link = models.URLField("Ссылка на внешний источник", blank=True, null=True)

    def __str__(self):
        return f"{self.season.movie.title} - Сезон {self.season.season_number}, Эпизод {self.episode_number}"

    class Meta:
        verbose_name = "Эпизод"
        verbose_name_plural = "Эпизоды"
        unique_together = ('season', 'episode_number')


class MovieInteraction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    is_favorite = models.BooleanField("избранное", default=False)
    is_watched = models.BooleanField("просмотренное", default=False)
    is_planned = models.BooleanField("планы", default=False)

    def __str__(self):
        return f"{self.user.username} - {self.movie.title}"

    class Meta:
        verbose_name = "Действия"
        verbose_name_plural = "Действия"
        unique_together = ('user', 'movie')


class MovieInteractionState(models.Model):
    STATE_CHOICES = (
        ('favorite', 'Избранное'),
        ('watched', 'Просмотрено'),
        ('planned', 'В планах'),
    )

    state = models.CharField(max_length=10, choices=STATE_CHOICES, unique=True)
    icon = models.ImageField(upload_to='icons/')

    def __str__(self):
        return self.get_state_display()

    class Meta:
        verbose_name = "Состояние взаимодействия"
        verbose_name_plural = "Состояния взаимодействий"


class MovieShots(models.Model):
    """Кадры из фильма"""
    title = models.CharField("Заголовок", max_length=100)
    descriptions = models.TextField("Описание")
    image = models.ImageField("Изображение", upload_to="movie_shots/")
    movie = models.ForeignKey(Movie, verbose_name="Фильм", on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Кадр из фильма"
        verbose_name_plural = "Кадры из фильма"


class RatingStar(models.Model):
    """Звезда рейтинга"""
    value = models.SmallIntegerField("Значение", default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])

    def __str__(self):
        return f'{self.value}'

    class Meta:
        verbose_name = "Звезда рейтинга"
        verbose_name_plural = "Звезды рейтинга"
        ordering = ["-value"]


class Rating(models.Model):
    """Рейтинг"""
    ip = models.CharField("IP адрес", max_length=15)
    star = models.ForeignKey(RatingStar, on_delete=models.CASCADE, verbose_name="звезда")
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, verbose_name="фильм")

    def __str__(self):
        return f"{self.star} - {self.movie}"

    class Meta:
        verbose_name = "Рейтинг"
        verbose_name_plural = "Рейтинги"


class Reviews(models.Model):
    """Отзывы"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField()
    text = models.TextField("Сообщение", max_length=5000)
    parent = models.ForeignKey(
        'self', verbose_name="Родитель", on_delete=models.SET_NULL, blank=True, null=True, related_name='replies'
    )
    movie = models.ForeignKey(Movie, verbose_name="фильм", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.email} - {self.movie}"

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(max_length=255, blank=True)
    username = models.CharField(max_length=150, blank=True)
    photo = models.ImageField(upload_to='media/profile_photos/', blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.user:
            self.email = self.user.email
            self.username = self.user.username
        super(Profile, self).save(*args, **kwargs)

    def __str__(self):
        return self.user.username
