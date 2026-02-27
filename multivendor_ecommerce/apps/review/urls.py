# apps/reviews/urls.py
from django.urls import path
from .views import ReviewView, ReviewApproveView, AllReviewsListView

urlpatterns = [
    path("v1/reviews/", ReviewView.as_view(),name="review_view"),
    path("v1/reviews/list/", AllReviewsListView.as_view(),name="review_list"),
    path("v1/reviews/<int:review_id>/approve/", ReviewApproveView.as_view(), name="review_approve"),  

]
