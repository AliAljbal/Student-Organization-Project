from django.db import models

class Room(models.Model):
    name = models.CharField(max_length=100, unique=True)
    seats = models.PositiveIntegerField()
    is_reserved = models.BooleanField(default=False)
    room_type = models.CharField(max_length=50, default='theory')


    def __str__(self):
        return self.name
