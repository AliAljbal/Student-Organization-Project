from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer,
    TeacherCreateSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
)

User = get_user_model()

# ------------------- Auth ------------------- #

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs[self.username_field]
        if not User.objects.filter(username=username).exists():
            email_matches = list(
                User.objects.filter(email__iexact=username)
                .values_list(self.username_field, flat=True)[:2]
            )
            if len(email_matches) == 1:
                attrs[self.username_field] = email_matches[0]

        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'user_type': self.user.user_type
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_account(request):
    user = request.user
    username = user.username
    user.delete()
    return Response({"message": f"User {username} deleted successfully."}, status=status.HTTP_200_OK)

# ------------------- Teacher Endpoints ------------------- #

# List all teachers
class TeacherListAPIView(generics.ListAPIView):
    queryset = User.objects.filter(user_type='teacher')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]

# Create new teacher
class TeacherCreateView(generics.CreateAPIView):
    serializer_class = TeacherCreateSerializer
    permission_classes = [IsAdminUser]

# Update teacher
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_teacher(request, pk):
    try:
        teacher = User.objects.get(id=pk, user_type='teacher')
    except User.DoesNotExist:
        return Response({"error": "Teacher not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserUpdateSerializer(teacher, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete teacher
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_teacher(request, pk):
    try:
        teacher = User.objects.get(id=pk, user_type='teacher')
    except User.DoesNotExist:
        return Response({"error": "Teacher not found."}, status=status.HTTP_404_NOT_FOUND)

    teacher.delete()
    return Response({"message": "Teacher deleted successfully."}, status=status.HTTP_200_OK)

# ------------------- Student Endpoints (unchanged) ------------------- #

class StudentListAPIView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.filter(user_type='student')
        year = self.request.query_params.get('year')
        specialization = self.request.query_params.get('specialization')

        if year:
            queryset = queryset.filter(academic_year=year)

        if specialization:
            if specialization == 'None':
                queryset = queryset.filter(specialization__in=[None, '', 'None'])
            else:
                queryset = queryset.filter(specialization=specialization)

        return queryset


class StudentCreateView(generics.CreateAPIView):
    queryset = User.objects.filter(user_type='student')
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_student(request, pk):
    try:
        student = User.objects.get(id=pk, user_type='student')
    except User.DoesNotExist:
        return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserUpdateSerializer(student, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_student(request, pk):
    try:
        student = User.objects.get(id=pk, user_type='student')
    except User.DoesNotExist:
        return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

    student.delete()
    return Response({"message": "Student deleted successfully."}, status=status.HTTP_200_OK)
