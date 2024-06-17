from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User

from .models import Reviews, Rating, RatingStar, Profile, MovieInteraction
from django.core.validators import validate_email
from django.core.exceptions import ValidationError


class ReviewForm(forms.ModelForm):
    """Форма отзывов"""

    class Meta:
        model = Reviews
        fields = ("email", "text", "parent")

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super(ReviewForm, self).__init__(*args, **kwargs)
        if user:
            self.fields['email'].initial = user.email

    def clean_email(self):
        email = self.cleaned_data["email"]
        try:
            validate_email(email)
        except ValidationError:
            raise forms.ValidationError("Некорректный адрес электронной почты")
        return email


class RatingForm(forms.ModelForm):
    """Форма добавления рейтинга"""
    star = forms.ModelChoiceField(
        queryset=RatingStar.objects.all(), widget=forms.RadioSelect(), empty_label=None
    )

    class Meta:
        model = Rating
        fields = ("star",)


class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(required=True,
                             widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}))
    password1 = forms.CharField(label="Пароль",
                                widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Пароль'}))
    password2 = forms.CharField(label="Повторите пароль", widget=forms.PasswordInput(
        attrs={'class': 'form-control', 'placeholder': 'Повторите пароль'}))
    username = forms.CharField(required=True, widget=forms.TextInput(
        attrs={'class': 'form-control', 'placeholder': 'Имя пользователя'}))
    phone = forms.CharField(required=True,
                            widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Номер телефона'}))

    class Meta:
        model = User
        fields = ['email', 'password1', 'password2', 'username', 'phone']

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password1')
        username = cleaned_data.get('username')

        if email and password and email.split('@')[0] in password:
            self.add_error('password1', 'Your password is too similar to your email address.')

        if username and password and username in password:
            self.add_error('password1', 'Your password is too similar to your username.')

        return cleaned_data


class UserProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['username', 'email', 'phone', 'photo']

    username = forms.CharField(required=True, widget=forms.TextInput(
        attrs={'class': 'form-control', 'placeholder': 'Имя пользователя'}))
    email = forms.EmailField(required=True,
                             widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}))
    phone = forms.CharField(required=True, widget=forms.TextInput(
        attrs={'class': 'form-control', 'placeholder': 'Номер телефона'}))
    photo = forms.ImageField(required=False)

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.username = self.cleaned_data['username']
        if commit:
            user.save()

            # Create or update profile
            profile, created = Profile.objects.get_or_create(user=user)
            profile.phone = self.cleaned_data['phone']
            profile.save()

        return user


class UserLoginForm(AuthenticationForm):
    username = forms.EmailField(label="Email", required=True,
                                widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}))
    password = forms.CharField(label="Пароль",
                               widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Пароль'}))
    remember_me = forms.BooleanField(label="Запомнить меня", required=False)

    def clean_remember_me(self):
        remember_me = self.cleaned_data.get('remember_me')
        if remember_me is None:
            return False
        return remember_me


class InteractionForm(forms.ModelForm):
    class Meta:
        model = MovieInteraction
        fields = ['is_favorite', 'is_watched', 'is_planned']