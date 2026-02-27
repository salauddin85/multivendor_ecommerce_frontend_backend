from . import models
from rest_framework import serializers


class ContactSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=100, required=True)
    email = serializers.EmailField(required=True)
    subject = serializers.CharField(max_length=200, required=False)
    message = serializers.CharField(required=True)
    phone_number = serializers.CharField(max_length=20)

    def create(self, validated_data):
        contact = models.Contact.objects.create(**validated_data)
        return contact


class ContactSerializerForView(serializers.ModelSerializer):
    class Meta:
        model = models.Contact
        fields = ['id', 'email', 'subject','message', 'phone_number', 'status', 'created_at']


class ContactDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Contact
        fields = '__all__'


class ContactUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Contact
        fields = ['status']
