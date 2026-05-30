"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from api.auth.views import RegisterUserView, LoginView, VerifyOTPView, LogoutView, GetCurrentUserView
from api.business.views import (
    CreateBusinessListingView,
    GetBusinessListingDetailView,
    GetAllListingsView,
    UpdateBusinessListingView,
    DeleteBusinessListingView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/register/", RegisterUserView.as_view(), name="register"),
    path("auth/verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", GetCurrentUserView.as_view(), name="own-details"),
    path(
        "business/create/", CreateBusinessListingView.as_view(), name="create-listing"
    ),
    path(
        "business/listings/", GetAllListingsView.as_view(), name="get-listing"
    ),
    path(
        "business/<int:id>/",
        GetBusinessListingDetailView.as_view(),
        name="listing-detail",
    ),
    path(
        "business/<int:id>/update/",
        UpdateBusinessListingView.as_view(),
        name="update-listing",
    ),
    path(
        "business/<int:id>/delete/",
        DeleteBusinessListingView.as_view(),
        name="delete-listing",
    ),
]
