# apps/reviews/views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewCreateSerializer, ReviewListSerializer

logger = logging.getLogger("myapp")
from config.utils.pagination import CustomPageNumberPagination
from apps.activity_log.utils.functions import log_request
from apps.products.tasks import delete_products_list_cache
from .utils.permissions import ReviewManagementPermission

# User creates a review & list own reviews
class ReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = ReviewCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                review = serializer.save()
                log_request(request, "Review submitted", "info", "Review submitted successfully", response_status_code=status.HTTP_201_CREATED)
                delete_products_list_cache()
                return Response({
                    "code": 201,
                    "status": "success",
                    "message": "Review submitted",
                    "data": {"id": review.id}
                }, status=201)
            return Response({
                "code": 400,
                "status": "failed",
                "message": "Validation error",
                "errors": serializer.errors
            }, status=400)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Review submission failed", "error", "Server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({"code": 500, "status": "failed", "errors": {"server": [str(e)]}}, status=500)

    def get(self, request):
        try:
            reviews = Review.objects.select_related('user', 'product', 'variant','vendor','store_owner','order').filter(user=request.user)
            serializer = ReviewListSerializer(reviews, many=True)
            log_request(request, "Your reviews fetched", "info", "Your reviews fetched successfully", response_status_code=status.HTTP_200_OK)
            return Response({
                "code": 200,
                "status": "success",
                "message": "Your reviews",
                "data": serializer.data
            })
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Your reviews fetch failed", "error", "Server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({
                "code": 500, 
                "status": "failed",
                "message":"server error" ,
                "errors": {"server": [str(e)]}
                }, status=500)


# Admin or Vendor approves/rejects review
class ReviewApproveView(APIView):
    permission_classes = [IsAuthenticated,ReviewManagementPermission] 

    def patch(self, request, review_id):
       
        try:
            review = Review.objects.get(id=review_id)
            status_choice = request.data.get('status')
            if status_choice not in ['approved', 'rejected']:
                return Response({"code": 400, "status": "failed", "message": "Invalid status"}, status=400)
            review.status = status_choice
            review.save()
            log_request(request, f"Review {status_choice}", "info", f"Review {status_choice} successfully", response_status_code=status.HTTP_200_OK)
            return Response({
                "code": 200,
                "status": "success",
                "message": f"Review {status_choice}",
                "data": {"id": review.id}
            
            })
        
        except Review.DoesNotExist:
            return Response({
                "code": 404, 
                "status": "failed", 
                "message": "Review not found",
                "data": {"review_id": "Review not found for this id"}
                
                }, status=404)
        
        except Exception as e:
            logger.exception(str(e))
            log_request(request, f"Review {status_choice} failed", "error", "Server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({
                "code": 500, 
                "message": "Server error",
                "status": "failed",
                "errors": {"server": [str(e)]}
            }, status=500)


class AllReviewsListView(APIView):
    permission_classes = [IsAuthenticated,ReviewManagementPermission]

    def get(self, request):
        try:
            reviews = Review.objects.select_related('user', 'product', 'variant','vendor','store_owner','order').all()
            serializer = ReviewListSerializer(reviews, many=True)
            pagination_obj = CustomPageNumberPagination()
            paginated_reviews = pagination_obj.paginate_queryset(reviews, request)
            log_request(request, "All reviews fetched", "info", "All reviews fetched successfully", response_status_code=status.HTTP_200_OK)
            return pagination_obj.get_paginated_response({
                "code": 200,
                "status": "success",
                "message": "All reviews",
                "data": serializer.data
            })
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "All reviews fetch failed", "error", "Server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({
                "code": 500, 
                "status": "failed",
                "message":"server error" ,
                "errors": {"server": [str(e)]}
                }, status=500)