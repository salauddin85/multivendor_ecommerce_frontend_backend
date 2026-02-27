# contacts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('v1/contacts/', views.ContactView.as_view(), name='contacts_list'),
    path('v1/contacts/<int:pk>/', views.ContactDetailView.as_view(), name='contacts_detail'),
]