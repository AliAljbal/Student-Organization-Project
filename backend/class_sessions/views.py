# class_sessions/views.py
from rest_framework import generics, permissions, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction

from .models import Session
from .serializers import SessionSerializer
from courses.models import Course
from rooms.models import Room
from reservations.models import Reservation
from users.permissions import IsStudent, IsTeacher

User = get_user_model()

# 1. Teachers can view and create sessions
class TeacherSessionView(generics.ListCreateAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Session.objects.filter(teacher=self.request.user)

    def perform_create(self, serializer):
        data = serializer.validated_data
        room = data['room']
        date = data['date']
        start = data['start_time']

        # Check if the room is already reserved at the same time
        if Session.objects.filter(room=room, date=date, start_time=start).exists():
            raise serializers.ValidationError("⚠️ This room is already reserved at this time.")

        room.is_reserved = True
        room.save()

        session = serializer.save(teacher=self.request.user)

        notification = (
            f"📢 Students of {session.academic_year} - Specialization {session.specialization}, "
            f"please go to room {room.name} at {start.strftime('%H:%M')}."
        )
        print(notification)

        # Simulate sending notifications to students
        students = User.objects.filter(
            academic_year=session.academic_year,
            specialization=session.specialization
        )
        for student in students:
            print(f"🔔 Notification for {student.username}: {notification}")

# 2. End session and release the room
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_session(request, pk):
    try:
        session = Session.objects.get(pk=pk, teacher=request.user)
        room = session.room
        session.delete()
        room.is_reserved = False
        room.save()
        return Response({'message': '✅ Session ended and room released.'}, status=status.HTTP_200_OK)
    except Session.DoesNotExist:
        return Response({'error': '❌ Session not found.'}, status=status.HTTP_404_NOT_FOUND)

# 3. Students can view sessions relevant to them
class StudentSessionListView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        user = self.request.user
        today = timezone.localdate()
        now = timezone.localtime().time()

        return Session.objects.filter(
            academic_year=user.academic_year,
            specialization=user.specialization,
            date=today,
            start_time__gte=now,
            teacher__isnull=False
        ).order_by('start_time')

# 4. Get all available academic years
class AcademicYearList(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        years = Course.objects.values_list('academic_year', flat=True).distinct()
        return Response(sorted(years))

# 5. Get all available specializations
class SpecializationList(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        specs = Course.objects.values_list('specialization', flat=True).distinct()
        return Response(sorted(filter(None, specs)))

# 6. Get all room names
class RoomNameList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        names = Room.objects.values_list('name', flat=True).distinct()
        return Response(sorted(names))

# 7. Get course names by academic year and specialization
class CourseListByYearSpec(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = request.query_params.get('year')
        spec = request.query_params.get('specialization')

        if not year:
            return Response({'error': 'Academic year is required'}, status=status.HTTP_400_BAD_REQUEST)

        courses = Course.objects.filter(academic_year=year)
        if spec:
            courses = courses.filter(specialization=spec)

        names = courses.values_list('name', flat=True).distinct()
        return Response(sorted(names))

# 8. Reserve a seat in a session
@api_view(['POST'])
@permission_classes([IsStudent])
def reserve_seat(request):
    room_name = request.data.get('room_name')
    user = request.user

    if not room_name:
        return Response({'error': '❌ Room name is required'}, status=400)

    try:
        with transaction.atomic():
            session = Session.objects.select_for_update().select_related('room').get(
                room__name=room_name,
                date=timezone.localdate(),
                academic_year=user.academic_year,
                specialization=user.specialization,
            )
            room = session.room
            reserved_count = Reservation.objects.filter(session=session).count()

            if reserved_count >= room.seats:
                return Response({'error': '❌ Room is full'}, status=400)

            if Reservation.objects.filter(user=user, session=session).exists():
                return Response({'error': '❌ You have already reserved a seat'}, status=400)

            Reservation.objects.create(
                user=user,
                room=room,
                date=session.date,
                start_time=session.start_time,
                session=session
            )
        return Response({'message': '✅ Seat reserved successfully'}, status=200)
    except Session.DoesNotExist:
        return Response({'error': '❌ Session not found for your academic year and specialization'}, status=404)

# 9. View all reserved students for each session
@api_view(['GET'])
@permission_classes([IsTeacher])
def reserved_students(request):
    sessions = Session.objects.filter(teacher=request.user)
    data = {}

    for session in sessions:
        reservations = Reservation.objects.filter(session=session)
        students = [res.user.username for res in reservations]
        data[session.id] = students

    return Response(data)

# 10. Teacher cancels a student's reservation using username
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unreserve_student(request, session_id, username):
    try:
        session = Session.objects.get(id=session_id, teacher=request.user)
    except Session.DoesNotExist:
        return Response({'error': '❌ Session not found or access denied.'}, status=404)

    try:
        student = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': '❌ Student not found.'}, status=404)

    reservation = Reservation.objects.filter(user=student, session=session).first()
    if not reservation:
        return Response({'error': '❌ This student has no reservation in this session.'}, status=400)

    reservation.delete()
    return Response({'message': f'✅ Reservation for student {student.username} has been canceled.'}, status=200)
