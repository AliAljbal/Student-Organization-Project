from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
import re

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    account_user_type = 'student'
    password2 = serializers.CharField(write_only=True)
    username = serializers.CharField(max_length=150)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'user_type', 'academic_year', 'specialization',
            'student_id'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'user_type': {'read_only': True},
        }

    def validate_username(self, value):
        if not re.match(r'^[\w\s.@+-]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, spaces and @/./+/-/_"
            )
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        validated_data.pop('user_type', None)
        user = User(**validated_data, user_type=self.account_user_type)
        user.set_password(password)
        user.save()
        return user


class TeacherCreateSerializer(RegisterSerializer):
    account_user_type = 'teacher'


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'academic_year', 'specialization', 'student_id']
        read_only_fields = ['user_type']

    def validate_username(self, value):
        if not re.match(r'^[\w\s.@+-]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, spaces and @/./+/-/_"
            )
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email',
            'user_type', 'academic_year', 'specialization', 'student_id'
        ]
