from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Room
from .serializers import RoomSerializer

# ✅ عرض إنشاء وعرض جميع القاعات
class RoomListCreateView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    def get_permissions(self):
        permission = IsAuthenticated if self.request.method in SAFE_METHODS else IsAdminUser
        return [permission()]

# ✅ عرض تفاصيل القاعة (تعديل - حذف - عرض)
class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    def get_permissions(self):
        permission = IsAuthenticated if self.request.method in SAFE_METHODS else IsAdminUser
        return [permission()]

# ✅ عرض القاعات المتاحة فقط
class AvailableRoomsView(generics.ListAPIView):
    queryset = Room.objects.filter(is_reserved=False)
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

# ✅ عرض القاعات المحجوزة فقط
class ReservedRoomsView(generics.ListAPIView):
    queryset = Room.objects.filter(is_reserved=True)
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

# ✅ دالة حجز القاعة
@api_view(['POST'])
@permission_classes([IsAdminUser])
def reserve_room(request, pk):
    try:
        room = Room.objects.get(pk=pk)
        if room.is_reserved:
            return Response({'error': 'This room is already reserved.'}, status=status.HTTP_400_BAD_REQUEST)

        room.is_reserved = True
        room.save()
        return Response({'message': 'Room reserved successfully.'}, status=status.HTTP_200_OK)

    except Room.DoesNotExist:
        return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

# ✅ دالة إلغاء حجز القاعة
@api_view(['POST'])
@permission_classes([IsAdminUser])
def cancel_reservation(request, pk):
    try:
        room = Room.objects.get(pk=pk)
        if not room.is_reserved:
            return Response({'error': 'This room is not reserved.'}, status=status.HTTP_400_BAD_REQUEST)

        room.is_reserved = False
        room.save()
        return Response({'message': 'Reservation canceled successfully.'}, status=status.HTTP_200_OK)

    except Room.DoesNotExist:
        return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
