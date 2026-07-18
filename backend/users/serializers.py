from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='username', read_only=True)
    # صلاحية الأدمن للواجهة الأمامية — تُشتق من is_staff أو is_staff_member
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'first_name', 'last_name',
                 'phone', 'address', 'governorate', 'is_customer', 'is_staff_member',
                 'is_admin', 'date_joined']
        read_only_fields = ['id', 'date_joined']

    def get_is_admin(self, obj):
        return bool(getattr(obj, 'is_staff', False) or getattr(obj, 'is_staff_member', False) or getattr(obj, 'is_superuser', False))


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    name = serializers.CharField(source='username')
    governorate = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['phone', 'password', 'password_confirm', 'address', 'name', 'governorate']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("كلمتا المرور غير متطابقتين")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')

        # Keep governorate as a separate field
        # No need to combine it with address anymore

        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        phone = attrs.get('phone')
        password = attrs.get('password')

        if phone and password:
            user = authenticate(username=phone, password=password)

            if not user:
                raise serializers.ValidationError('بيانات الدخول غير صحيحة')

            if not user.is_active:
                raise serializers.ValidationError('حساب المستخدم غير نشط')

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('رقم الهاتف وكلمة المرور مطلوبان')
