from django.db import models

# Create your models here.


class ContactBaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class Contact(ContactBaseModel):
    STATUS_CHOICES = [
        ('contacted', 'Contacted'),
        ('rejected', 'Rejected'),
        ('pending', 'Pending'),
    ]
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, default="")
    message = models.TextField()
    phone_number = models.CharField(max_length=20, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    def __str__(self):
        return f"{self.full_name} - {self.email}"
