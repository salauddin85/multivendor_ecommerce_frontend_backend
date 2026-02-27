# use filtering by date range
from django_filters import rest_framework as filters
from . import models

class ContactFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name="created_at", lookup_expr='gte')
    end_date = filters.DateFilter(field_name="created_at", lookup_expr='lte')
    status = filters.CharFilter(field_name="status")


    class Meta:
        model = models.Contact
        fields = ['status', 'start_date', 'end_date']
