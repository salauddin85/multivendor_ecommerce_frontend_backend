# apps/wishlist/views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.shortcuts import get_object_or_404
from config.utils.pagination import CustomPageNumberPagination


from .models import Wishlist, WishlistItem
from .serializers import (
    WishlistListSerializer,
    WishlistItemCreateSerializer,
    WishlistItemSerializer
)

logger = logging.getLogger("myapp")
from .utils.permissions import WishlistManagementPermission
from apps.activity_log.utils.functions import log_request



class WishlistView(APIView):
    permission_classes = [IsAuthenticated,WishlistManagementPermission]

    def get(self, request):
        try:
            wishlists = Wishlist.objects.select_related('user').prefetch_related('items').all()
            serializer = WishlistListSerializer(wishlists, many=True)
            pagination_obj = CustomPageNumberPagination()
            paginated_wishlists = pagination_obj.paginate_queryset(wishlists, request)
            log_request(request, "Wishlists fetched", "info", "Wishlists fetched successfully", response_status_code=status.HTTP_200_OK)
            return pagination_obj.get_paginated_response({
                "code": 200,
                "message": "Wishlists fetched successfully",
                "status": "success",
                "data": serializer.data
            }, status=200)

        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Wishlists fetch failed", "warning", "Wishlists not found", response_status_code=status.HTTP_404_NOT_FOUND)
            return Response({"code": 500, "status": "failed", "message": "Server error", "errors": {"server": [str(e)]}}, status=500)




class WishlistItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    # ---------------------------
    # Utility
    # ---------------------------
    def _get_default_wishlist(self, user):
        wishlist, _ = Wishlist.objects.get_or_create(
            user=user,
            is_default=True,
            defaults={"name": "My Wishlist"}
        )
        return wishlist

    # ---------------------------
    # POST → Add item
    # ---------------------------
    def post(self, request):
        try:
            wishlist = self._get_default_wishlist(request.user)

            serializer = WishlistItemCreateSerializer(
                data=request.data,
                context={"wishlist": wishlist}
            )

            if serializer.is_valid():
                item = serializer.save()
                log_request(request, "Item added to wishlist", "info", "Item added to wishlist successfully", response_status_code=status.HTTP_201_CREATED)
                return Response(
                    {
                        "code": status.HTTP_201_CREATED,
                        "status": "success",
                        "message": "Item added to wishlist",
                        "data": {
                            "id": item.id,
                            "product": item.product.id,
                            "variant": item.variant.id if item.variant else None,
                        },
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(
                    {
                        "code": status.HTTP_400_BAD_REQUEST,
                        "status": "failed",
                        "message": "Invalid data",
                        "errors": serializer.errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
        except Exception as e:
            logger.exception(e)
            log_request(request, "Item add to wishlist failed", "warning", "Item add to wishlist failed", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(
                {
                    "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "status": "failed",
                    "message": "Server error",
                    "errors": {"server": [str(e)]},
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get(self, request):
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            items = wishlist.items.select_related('product', 'variant').filter(wishlist=wishlist)
            serializer = WishlistItemSerializer(items, many=True)
            log_request(request, "Wishlist items fetched", "info", "Wishlist items fetched successfully", response_status_code=status.HTTP_200_OK)
            return Response({
                "code": 200,
                "message": "Wishlist items fetched",
                "status": "success",
                "data": serializer.data
            }, status=200)
        except Wishlist.DoesNotExist:
            return Response({"code": 404
                             ,"status": "failed",
                             "message": "Wish list item  not found"
                             ,"errors": {"wishlist": ["Wishlist not found "]}
                             }, status=404)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Wishlist items fetch failed", "warning", "Wishlist items not found", response_status_code=status.HTTP_404_NOT_FOUND)
            return Response({"code": 500, 
                             "message": "Server error",
                             "status": "failed",
                             "errors": {"server": [str(e)]},
                             
                             }, status=500)



class WishlistItemDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        try:
            item = WishlistItem.objects.get(wishlist__user=request.user, id=item_id)
            item.delete()
            log_request(request, f"Item {item_id} deleted from wishlist", "info", "Item deleted from wishlist", response_status_code=status.HTTP_204_NO_CONTENT)
            return Response({
                "code": 204,
                "message": "Item deleted from wishlist",
                "status": "success"
            }, status=204)
        except WishlistItem.DoesNotExist:
            return Response({"code": 404,
                             "status": "failed",
                             "message": "This item not found in wishlist",
                             "errors": {"wishlist": ["This item not found in wishlist"]}
                             }, status=404)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, f"Item {item_id} delete from wishlist failed", "warning", "Item delete from wishlist failed", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({"code": 500,
                             "status": "failed",
                             "message": "Server error",
                             "errors": {"server": [str(e)]}
                             }, status=500)

