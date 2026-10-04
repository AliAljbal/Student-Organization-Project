from django.urls import path
from .views import (
    # Auth
    RegisterView,
    CustomTokenObtainPairView,
    ProfileView,
    delete_account,

    # Teachers
    TeacherListAPIView,
    TeacherCreateView,
    update_teacher,
    delete_teacher,

    # Students
    StudentListAPIView,
    StudentCreateView,
    update_student,
    delete_student,
)

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # ----------------- Auth ----------------- #
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('delete-account/', delete_account, name='delete-account'),

    # ----------------- Teachers ----------------- #
    path('teachers/', TeacherListAPIView.as_view(), name='teacher-list'),
    path('teachers/create/', TeacherCreateView.as_view(), name='create-teacher'),
    path('teachers/<int:pk>/update/', update_teacher, name='update-teacher'),
    path('teachers/<int:pk>/delete/', delete_teacher, name='delete-teacher'),

    # ----------------- Students ----------------- #
    path('students/', StudentListAPIView.as_view(), name='student-list'),
    path('students/create/', StudentCreateView.as_view(), name='create-student'),
    path('students/<int:pk>/update/', update_student, name='update-student'),
    path('students/<int:pk>/delete/', delete_student, name='delete-student'),
]
