from django.db import models

class Course(models.Model):
    name = models.CharField(max_length=255)
    academic_year = models.CharField(max_length=50, null=True, blank=True)
    specialization = models.CharField(max_length=50, null=True, blank=True)
    semester = models.CharField(max_length=50)

    class Meta:
        unique_together = ('name', 'academic_year', 'specialization', 'semester')

    def __str__(self):
        return f"{self.name} ({self.academic_year}, {self.specialization}, {self.semester})"
