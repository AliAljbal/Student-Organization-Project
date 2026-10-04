from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS
from .models import Course
from .serializers import CourseSerializer

# GET (list all courses), POST (create a new course)
class CourseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        permission = IsAuthenticated if self.request.method in SAFE_METHODS else IsAdminUser
        return [permission()]

# GET (single course), PUT/PATCH (update), DELETE (remove)
class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        permission = IsAuthenticated if self.request.method in SAFE_METHODS else IsAdminUser
        return [permission()]
