# class_sessions/serializers.py
from rest_framework import serializers
from .models import Session
from courses.models import Course
from rooms.models import Room

class SessionSerializer(serializers.ModelSerializer):
    course = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Course.objects.all()
    )
    room = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Room.objects.all()
    )
    notification = serializers.SerializerMethodField()
    available_seats = serializers.SerializerMethodField()
    reserved_seats = serializers.SerializerMethodField()
    reserved_students = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id',
            'teacher',
            'course',
            'room',
            'academic_year',
            'specialization',
            'date',
            'start_time',
            'notification',
            'available_seats',
            'reserved_seats',
            'reserved_students',
        ]
        read_only_fields = ['teacher']

    def get_notification(self, obj):
        return (
            f"📢 Students of {obj.academic_year} - Specialization {obj.specialization}, "
            f"please go to room {obj.room.name} at {obj.start_time.strftime('%H:%M')}."
        )

    def get_available_seats(self, obj):
        total = obj.room.seats
        reserved = obj.reservations.count()
        return total - reserved

    def get_reserved_seats(self, obj):
        return obj.reservations.count()

    def get_reserved_students(self, obj):
        request = self.context.get('request')
        if request is None or request.user != obj.teacher:
            return []
        return [
              {
                "name": r.user.get_username(),  
                "student_id": r.user.student_id  
               }
               for r in obj.reservations.all()
    ]

