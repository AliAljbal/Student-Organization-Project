from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework.test import APITestCase

from class_sessions.models import Session
from courses.models import Course
from rooms.models import Room

User = get_user_model()


class AccountAndWritePermissionTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student', password='ValidPass@12345', user_type='student'
        )
        self.admin = User.objects.create_superuser(
            username='admin', password='ValidPass@12345', email='admin@example.com',
            user_type='student'
        )
        self.room = Room.objects.create(name='Room 1', seats=20)
        self.course = Course.objects.create(
            name='Math', academic_year='First Year', specialization='None', semester='1'
        )

    def test_public_registration_always_creates_a_student(self):
        response = self.client.post('/api/users/register/', {
            'username': 'new-teacher',
            'email': 'new-teacher@example.com',
            'password': 'ValidPass@12345',
            'password2': 'ValidPass@12345',
            'user_type': 'teacher',
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.get(username='new-teacher').user_type, 'student')

    def test_admin_can_create_a_teacher(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post('/api/users/teachers/create/', {
            'username': 'managed.teacher',
            'email': 'managed.teacher@example.com',
            'password': 'ValidPass@12345',
            'password2': 'ValidPass@12345',
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.get(username='managed.teacher').user_type, 'teacher')

    def test_non_admin_cannot_write_users_rooms_or_courses(self):
        self.client.force_authenticate(self.student)

        self.assertEqual(self.client.delete('/api/users/delete-account/').status_code, 403)
        self.assertTrue(User.objects.filter(pk=self.student.pk).exists())
        self.assertEqual(self.client.post('/api/users/teachers/create/', {}).status_code, 403)
        self.assertEqual(
            self.client.delete(f'/api/users/students/{self.student.pk}/delete/').status_code,
            403,
        )
        self.assertEqual(self.client.patch(f'/api/rooms/{self.room.pk}/', {'seats': 1}).status_code, 403)
        self.assertEqual(
            self.client.patch(f'/api/courses/{self.course.pk}/', {'name': 'Changed'}).status_code,
            403,
        )

    def test_courses_require_authentication_and_admin_writes(self):
        self.assertEqual(self.client.get('/api/courses/').status_code, 401)

        self.client.force_authenticate(self.admin)
        self.assertEqual(
            self.client.post('/api/courses/', {
                'name': 'Science',
                'academic_year': 'First Year',
                'specialization': 'None',
                'semester': '1',
            }).status_code,
            201,
        )

    def test_seed_demo_is_repeatable(self):
        call_command('seed_demo', verbosity=0)
        call_command('seed_demo', verbosity=0)

        demo_student = User.objects.get(username='demo.student')
        demo_admin = User.objects.get(username='demo.admin')
        self.assertTrue(demo_student.check_password('Demo@12345'))
        self.assertTrue(demo_admin.is_staff)
        self.assertTrue(demo_admin.is_superuser)
        self.assertEqual(User.objects.filter(username__startswith='demo.').count(), 3)
        self.assertEqual(
            set(Course.objects.values_list('academic_year', flat=True).distinct()),
            {'First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Fifth Year'},
        )
        self.assertTrue(Course.objects.filter(specialization='ICTE').exists())
        self.assertEqual(Session.objects.filter(teacher__username='demo.teacher').count(), 1)

    def test_demo_admin_can_log_in_with_email(self):
        call_command('seed_demo', verbosity=0)
        response = self.client.post('/api/users/login/', {
            'username': 'demo.admin@example.com',
            'password': 'Demo@12345',
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)