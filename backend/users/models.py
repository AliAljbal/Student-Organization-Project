from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

ACADEMIC_YEARS = [
    ("First Year", "First Year"),
    ("Second Year", "Second Year"),
    ("Third Year", "Third Year"),
    ("Fourth Year", "Fourth Year"),
    ("Fifth Year", "Fifth Year"),
]

SPECIALIZATIONS = [
    ("None", "None"),
    ("IT", "IT"),
    ("CESE", "CESE"),
    ("ICTE", "ICTE"),
]

USER_TYPE_CHOICES = [
    ("student", "Student"),
    ("teacher", "Teacher"),
]

class CustomUser(AbstractUser):
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[\w\s.@+-]+$',
                message="Username can only contain letters, numbers, spaces and @/./+/-/_ characters.",
            )
        ],
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    academic_year = models.CharField(max_length=20, choices=ACADEMIC_YEARS, blank=True, null=True)
    specialization = models.CharField(max_length=20, choices=SPECIALIZATIONS, blank=True, null=True)
    student_id = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.user_type}"
