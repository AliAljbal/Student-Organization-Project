from django.urls import path
from .views import (
    RoomListCreateView,
    RoomDetailView,
    AvailableRoomsView,
    ReservedRoomsView,
    reserve_room,              # دالة حجز القاعة
    cancel_reservation         # دالة إلغاء الحجز
)

urlpatterns = [
    path('', RoomListCreateView.as_view(), name='room_list_create'),          # GET + POST
    path('<int:pk>/', RoomDetailView.as_view(), name='room_detail'),          # GET + PUT + DELETE
    path('available/', AvailableRoomsView.as_view(), name='available_rooms'), # القاعات المتاحة
    path('reserved/', ReservedRoomsView.as_view(), name='reserved_rooms'),    # القاعات المحجوزة

    # المسارات الخاصة بالحجز وإلغاء الحجز
    path('<int:pk>/reserve/', reserve_room, name='room_reserve'),             # POST: حجز قاعة
    path('<int:pk>/cancel_reservation/', cancel_reservation, name='room_cancel'),  # POST: إلغاء الحجز
]
