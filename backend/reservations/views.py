from rest_framework import generics, permissions
from .models import Reservation
from .serializers import ReservationSerializer

class ReservedRoomsListView(generics.ListAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)
