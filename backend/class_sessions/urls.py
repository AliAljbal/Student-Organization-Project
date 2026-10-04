# class_sessions/urls.py
from django.urls import path
from .views import (
    TeacherSessionView, end_session, StudentSessionListView,
    AcademicYearList, SpecializationList, RoomNameList,
    CourseListByYearSpec, reserve_seat, reserved_students,
    unreserve_student
)

urlpatterns = [
    path('teacher/', TeacherSessionView.as_view(), name='teacher-sessions'),
    path('teacher/end/<int:pk>/', end_session, name='end-session'),
    path('teacher/unreserve/<int:session_id>/<str:username>/', unreserve_student, name='unreserve-student'),
    path('student/', StudentSessionListView.as_view(), name='student-sessions'),
    path('academic-years/', AcademicYearList.as_view(), name='academic-years'),
    path('specializations/', SpecializationList.as_view(), name='specializations'),
    path('room-names/', RoomNameList.as_view(), name='room-names'),
    path('courses/', CourseListByYearSpec.as_view(), name='courses'),
    path('reserve-seat/', reserve_seat, name='reserve-seat'),
    path('reserved-students/', reserved_students, name='reserved-students'),
]
