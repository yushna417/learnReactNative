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
from api.auth.views import (
    RegisterUserView,
    LoginView,
    VerifyOTPView,
    LogoutView,
    GetCurrentUserView,
)
from api.business.views import (
    CreateBusinessListingView,
    GetBusinessListingDetailView,
    GetAllListingsView,
    UpdateBusinessListingView,
    DeleteBusinessListingView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterUserView.as_view(), name="register"),
    path("api/auth/verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),
    path("api/auth/me/", GetCurrentUserView.as_view(), name="own-details"),
    path(
        "api/business/create/", CreateBusinessListingView.as_view(), name="create-listing"
    ),
    path("api/business/listings/", GetAllListingsView.as_view(), name="get-listing"),
    path(
        "api/business/<int:id>/",
        GetBusinessListingDetailView.as_view(),
        name="listing-detail",
    ),
    path(
        "api/business/<int:id>/update/",
        UpdateBusinessListingView.as_view(),
        name="update-listing",
    ),
    path(
        "api/business/<int:id>/delete/",
        DeleteBusinessListingView.as_view(),
        name="delete-listing",
    ),
]
