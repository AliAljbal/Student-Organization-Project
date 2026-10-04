from django.urls import path
from .views import CourseListCreateAPIView, CourseRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('', CourseListCreateAPIView.as_view(), name='course-list-create'),
    path('<int:pk>/', CourseRetrieveUpdateDestroyAPIView.as_view(), name='course-detail'),
]
