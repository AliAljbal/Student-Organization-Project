from datetime import time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from class_sessions.models import Session
from courses.models import Course
from rooms.models import Room


class Command(BaseCommand):
    help = 'Create fictional accounts and a sample session for screenshots and demos.'

    def handle(self, *args, **options):
        User = get_user_model()
        password = 'Demo@12345'
        demo_users = [
            {
                'username': 'demo.student',
                'email': 'demo.student@example.com',
                'user_type': 'student',
                'academic_year': 'First Year',
                'specialization': 'None',
                'student_id': 'DEMO-1001',
            },
            {
                'username': 'demo.teacher',
                'email': 'demo.teacher@example.com',
                'user_type': 'teacher',
                'academic_year': None,
                'specialization': None,
                'student_id': None,
            },
            {
                'username': 'demo.admin',
                'email': 'demo.admin@example.com',
                'user_type': 'student',
                'academic_year': None,
                'specialization': None,
                'student_id': None,
                'is_staff': True,
                'is_superuser': True,
            },
        ]

        for account in demo_users:
            user, _ = User.objects.update_or_create(
                username=account['username'], defaults=account
            )
            user.set_password(password)
            user.save(update_fields=['password'])

        demo_courses = [
            ('Introduction to Computing', 'First Year', 'None'),
            ('Programming Fundamentals', 'Second Year', 'None'),
            ('Database Systems', 'Third Year', 'None'),
        ]
        demo_courses.extend(
            (f'{specialization} Studies', year, specialization)
            for year in ('Fourth Year', 'Fifth Year')
            for specialization in ('IT', 'CESE', 'ICTE')
        )
        for name, year, specialization in demo_courses:
            Course.objects.update_or_create(
                name=name,
                academic_year=year,
                specialization=specialization,
                semester='First Semester',
            )

        course = Course.objects.get(
            name='Introduction to Computing',
            academic_year='First Year',
            specialization='None',
            semester='First Semester',
        )
        room, _ = Room.objects.update_or_create(
            name='Demo Room 101',
            defaults={'seats': 30, 'room_type': 'theory', 'is_reserved': True},
        )

        Session.objects.update_or_create(
            room=room,
            date=timezone.localdate(),
            start_time=time(23, 59),
            defaults={
                'teacher': User.objects.get(username='demo.teacher'),
                'course': course,
                'academic_year': 'First Year',
                'specialization': 'None',
            },
        )

        self.stdout.write(self.style.SUCCESS(
            'Demo data is ready. Accounts: demo.student, demo.teacher, demo.admin. '
            'Password: Demo@12345'
        ))