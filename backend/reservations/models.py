from django.db import models
from django.conf import settings
from rooms.models import Room
from class_sessions.models import Session  

class Reservation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_reservations'
    )
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.room.name if self.room else 'No room'} reserved by {self.user.username if self.user else 'Unknown'} on {self.date}"
