from datetime import time

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from courses.models import Course
from reservations.models import Reservation
from rooms.models import Room
from .models import Session

User = get_user_model()


class SeatReservationPermissionTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='teacher', password='ValidPass@12345', user_type='teacher'
        )
        self.student = User.objects.create_user(
            username='student', password='ValidPass@12345', user_type='student',
            academic_year='First Year', specialization='None'
        )
        self.other_student = User.objects.create_user(
            username='other', password='ValidPass@12345', user_type='student',
            academic_year='Second Year', specialization='IT'
        )
        self.room = Room.objects.create(name='Room 1', seats=20)
        self.course = Course.objects.create(
            name='Math', academic_year='First Year', specialization='None', semester='1'
        )
        self.session = Session.objects.create(
            teacher=self.teacher,
            course=self.course,
            room=self.room,
            academic_year='First Year',
            specialization='None',
            date=timezone.localdate(),
            start_time=time(23, 59),
        )

    def test_student_can_only_reserve_a_matching_program_session(self):
        self.client.force_authenticate(self.other_student)
        rejected = self.client.post('/api/sessions/reserve-seat/', {'room_name': self.room.name})
        self.assertEqual(rejected.status_code, 404)
        self.assertFalse(Reservation.objects.filter(session=self.session).exists())

        self.client.force_authenticate(self.student)
        accepted = self.client.post('/api/sessions/reserve-seat/', {'room_name': self.room.name})
        self.assertEqual(accepted.status_code, 200)
        self.assertTrue(Reservation.objects.filter(user=self.student, session=self.session).exists())

    def test_attendance_endpoint_is_limited_to_the_session_teacher(self):
        Reservation.objects.create(user=self.student, room=self.room, session=self.session)

        self.client.force_authenticate(self.other_student)
        self.assertEqual(self.client.get('/api/sessions/reserved-students/').status_code, 403)

        self.client.force_authenticate(self.teacher)
        response = self.client.get('/api/sessions/reserved-students/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[self.session.pk], ['student'])