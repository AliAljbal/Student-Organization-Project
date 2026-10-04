from django.urls import path
from .views import ReservedRoomsListView

urlpatterns = [
    path('reserved/', ReservedRoomsListView.as_view(), name='reserved-rooms'),
]
