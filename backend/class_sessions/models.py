# class_sessions/models.py
from django.db import models
from django.conf import settings
from courses.models import Course
from rooms.models import Room

class Session(models.Model):
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    academic_year = models.CharField(max_length=100, null=True, blank=True)
    specialization = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()

    def __str__(self):
        return f"{self.course.name} by {self.teacher.username} in {self.room.name}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['room', 'date', 'start_time'],
                name='unique_room_reservation'
            )
        ]
