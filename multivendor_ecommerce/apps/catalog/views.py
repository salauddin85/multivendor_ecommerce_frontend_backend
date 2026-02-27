from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Category
from . import serializers
from apps.activity_log.utils.functions import log_request
from . import models
import logging
logger = logging.getLogger("myapp")
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from config.utils.pagination import CustomPageNumberPagination
from django.db.models import Q

from django.core.cache import cache
from django.utils.http import urlencode
from .tasks import delete_category_tree_cache



class CategoriesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
       try:
           data = request.data
           serializer = serializers.CategorySerializer(data=data)
           if serializer.is_valid():
               serializer.save()
               log_request(request, "Category created", "info", "Category created successfully", response_status_code=status.HTTP_201_CREATED)  
               delete_category_tree_cache()
               return Response({
                   "code": status.HTTP_201_CREATED,
                   "status": "success",
                   "message": "Category created successfully",
                   "data": serializer.data
               }, status=status.HTTP_201_CREATED)
           else:
               return Response({
                   "code": status.HTTP_400_BAD_REQUEST,
                   "status": "failed",
                   "message": "invalid request",
                   "errors": serializer.errors
               }, status=status.HTTP_400_BAD_REQUEST)
       except Exception as e:
           logger.exception(str(e))
           log_request(request, "Category creation failed", "error","Category creation failed due to server error",response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

           return Response({
               "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
               "status": "failed",
               "message": "internal server error",
               "errors": {"server_error": [str(e)]}
           }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def get(self, request):
        try:
            categories = Category.objects.all()
            paginator = CustomPageNumberPagination()
            categories = paginator.paginate_queryset(categories, request)
            serializer = serializers.CategorySerializerForView(categories, many=True)
            log_request(request, "All categories fetched", "info", "All categories fetched successfully", response_status_code=status.HTTP_200_OK)
            return paginator.get_paginated_response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message":"All category fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Category fetch failed", "error","Category fetch failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

class CategoryDetailView(APIView):
    def get(self, request, slug):
        
        try:
            category = Category.objects.get(slug=slug)
            serializer = serializers.CategorySerializer(category)
            log_request(request, "Category fetched", "info","Category fetched successfully", response_status_code=status.HTTP_200_OK)
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Category fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Category.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "status": "failed",
                "message": "Category not found",
                "errors": {"detail": "Category with this ID does not exist."}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Category fetch failed", "error","Category fetch failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, slug):
       
        try:
            category = Category.objects.get(slug=slug)
            serializer = serializers.CategorySerializer(category, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                delete_category_tree_cache()
                log_request(request, "Category updated", "info","Category updated successfully", response_status_code=status.HTTP_200_OK)
                return Response({
                    "code": status.HTTP_200_OK,
                    "status": "success",
                    "message": "Category updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    
                    "code": status.HTTP_400_BAD_REQUEST,
                    "status": "failed",
                    "message": "invalid request",
                    "errors": serializer.errors
                },status=status.HTTP_400_BAD_REQUEST)
        
        except Category.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "status": "failed",
                "message": "Category not found",
                "data": {"detail": "Category with this ID does not exist."}
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Category update failed", "error","Category update failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            })
    def delete(self, request, slug):
        try:
            category = Category.objects.get(slug=slug)
            category.delete()
            log_request(request, "Category deleted", "info","Category deleted successfully", response_status_code=status.HTTP_204_NO_CONTENT)
            delete_category_tree_cache()
            return Response({
                "code": status.HTTP_204_NO_CONTENT,
                "status": "success",
                "message": "Category deleted successfully"
                }, status=status.HTTP_204_NO_CONTENT)
        except Category.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "status": "failed",
                "message": "Category not found",
                "data": {
                    "detail": "Category with this ID does not exist."
                }
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Category deletion failed","error","Category deletion failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status" : "failed",
                "message" : "internal server error",
                "errors" : {"server_error" : [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
 
# class CategoryTreeView(APIView):
#     def get(self, request):
#         try:
#             top_level_categories = models.Category.objects.filter(
#                 parent__isnull=True,
#                 is_active=True
#             ).order_by('display_order')

#             product_available = request.query_params.get("product_available")

#             if product_available and product_available.lower() == "true":
#                 top_level_categories = top_level_categories.filter(
#                     Q(products__status='published') |  # direct product
#                     Q(children__products__status='published')  # child category product
#                 ).distinct()

#             pagination_data = CustomPageNumberPagination()
#             top_level_categories = pagination_data.paginate_queryset(
#                 top_level_categories, request
#             )

#             serializer = serializers.CategoryTreeViewSerializer(
#                 top_level_categories, many=True
#             )

#             return pagination_data.get_paginated_response({
#                 "code": status.HTTP_200_OK,
#                 "status": "success",
#                 "message": "Category tree fetched successfully",
#                 "data": serializer.data
#             })

#         except Exception as e:
#             return Response({
#                 "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 "status": "failed",
#                 "message": "internal server error",
#                 "errors": {"server_error": [str(e)]}
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      




# class CategoryTreeView(APIView):

#     def get(self, request):
#         try:
            
#             product_available = request.query_params.get("product_available")
#             if product_available and product_available.lower() == "true":
#                 cache_key = "category_tree_product_available"
#                 #  Return cached response if exists
#                 cached_response = cache.get(cache_key)
#                 if cached_response:
#                     return Response(cached_response, status=200)

#             # -----------------------------
#             # Query Logic
#             # -----------------------------
#             top_level_categories = models.Category.objects.filter(
#                 parent__isnull=True,
#                 is_active=True
#             ).order_by('display_order')


#             if product_available and product_available.lower() == "true":
#                 top_level_categories = top_level_categories.filter(
#                     Q(products__status='published') |
#                     Q(children__products__status='published')
#                 ).distinct()

#             pagination_data = CustomPageNumberPagination()
#             top_level_categories = pagination_data.paginate_queryset(
#                 top_level_categories, request
#             )

#             serializer = serializers.CategoryTreeViewSerializer(
#                 top_level_categories, many=True
#             )

#             final_response = pagination_data.get_paginated_response({
#                 "code": status.HTTP_200_OK,
#                 "status": "success",
#                 "message": "Category tree fetched successfully",
#                 "data": serializer.data
#             })

#             #  Store in cache for 3 minutes
#             if product_available and product_available.lower() == "true":
#                 cache.set(cache_key, final_response.data, 60 * 3)

#             return final_response

#         except Exception as e:
#             return Response({
#                 "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 "status": "failed",
#                 "message": "internal server error",
#                 "errors": {"server_error": [str(e)]}
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CategoryTreeView(APIView):

    def get(self, request):
        try:
            product_available_param = request.query_params.get("product_available", "").lower()
            product_available = product_available_param == "true"
            cache_key = "category_tree_product_available"

            # -----------------------------
            # Return cached response (if exists)
            # -----------------------------
            if product_available:
                cached_data = cache.get(cache_key)
                if cached_data:
                    return Response(cached_data, status=status.HTTP_200_OK)

            # -----------------------------
            # Base Query (Top Level Categories)
            # -----------------------------
            categories = models.Category.objects.filter(
                parent__isnull=True,
                is_active=True
            ).order_by("display_order")

            # -----------------------------
            # Filter categories having published products
            # -----------------------------
            if product_available:
                categories = categories.filter(
                    Q(products__status="published") |
                    Q(children__products__status="published")
                ).distinct()

            # -----------------------------
            # Pagination
            # -----------------------------
            paginator = CustomPageNumberPagination()
            paginated_categories = paginator.paginate_queryset(categories, request)

            serializer = serializers.CategoryTreeViewSerializer(
                paginated_categories, many=True
            )

            response_data = {
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Category tree fetched successfully",
                "data": serializer.data
            }

            final_response = paginator.get_paginated_response(response_data)

            # -----------------------------
            # Cache for 3 minutes
            # -----------------------------
            if product_available:
                cache.set(cache_key, final_response.data, 60 * 3)

            return final_response

        except Exception as e:
            return Response(
                {
                    "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "status": "failed",
                    "message": "Internal server error",
                    "errors": {"server_error": [str(e)]},
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BrandsView(APIView):
    
    def post(self, request):
        try:
            data = request.data
            serializer = serializers.BrandSerializer(data=data)
            if serializer.is_valid():
                
                serializer.save()
                name = serializer.validated_data['name']
                log_request(request, f"Brand  {name} created", "info", f"Brand {name}  created successfully", response_status_code=status.HTTP_201_CREATED)
                return Response({
                    "code": status.HTTP_201_CREATED,
                    "status": "success",
                    "message": "Brand created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "code": status.HTTP_400_BAD_REQUEST,
                    "status": "failed",
                    "message": "invalid request",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Brand creation failed", "error","Brand creation failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    def get(self, request):
        try:
            brands = models.Brand.objects.all().order_by('display_order')
            pagination = CustomPageNumberPagination()
            product_available = request.query_params.get('product_available')

            if product_available and product_available.lower() == "true":
                brands = brands.filter(
                    product__status='published'
                ).distinct()

            brands = pagination.paginate_queryset(brands, request)
            serializer = serializers.BrandSerializerForView(brands, many=True)

            return pagination.get_paginated_response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Brands fetched successfully",
                "data": serializer.data
            })

        except Exception as e:
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class BrandDetailView(APIView):
    def get(self, request, slug):
        try:
            brand = models.Brand.objects.get(slug=slug)
            serializer = serializers.BrandDetailSerializer(brand)
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Brand fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except models.Brand.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "status": "failed",
                "message": "Brand not found",
                "errors": {"detail": "Brand with this ID does not exist."}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Brand fetch failed", "error","Brand fetch failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request,slug):
        try:
            brand = models.Brand.objects.get(slug=slug)
            serializer = serializers.BrandSerializer(brand, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "code": status.HTTP_200_OK,
                    "status": "success",
                    "message": "Brand updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "code": status.HTTP_400_BAD_REQUEST,
                    "status": "failed",
                    "message": "invalid request",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except models.Brand.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "status": "failed",
                "message": "Brand not found",
                "errors": {"detail": "Brand with this ID does not exist."}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Brand update failed", "error","Brand update failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request,slug):
        try:
            brand = models.Brand.objects.get(slug=slug)
            brand.delete()
            return Response({
                "code": status.HTTP_204_NO_CONTENT,
                "status": "success",
                "message": "Brand deleted successfully"
            }, status=status.HTTP_204_NO_CONTENT)
        except models.Brand.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "status": "failed",
                "message": "Brand not found",
                "errors": {"detail": "Brand with this ID does not exist."}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Brand deletion failed", "error","Brand deletion failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            

class CategoryGridImageView(APIView):
    
    def post(self,request):
        try:
            data = request.data
            serializer = serializers.CategoryGridImageSerializer(data=data)
            if serializer.is_valid():
                obj = serializer.save()
                log_request(request, f"Category grid image  {obj.id} created", "info", f"Category grid image {obj.id}  created successfully", response_status_code=status.HTTP_201_CREATED)
                return Response({
                    "code": status.HTTP_201_CREATED,
                    "status": "success",
                    "message": "Category grid image created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "code": status.HTTP_400_BAD_REQUEST,
                    "status": "failed",
                    "message": "invalid request",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Category grid image creation failed", "error","Category grid image creation failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    def get(self, request):
        try:
            categories_grid_image = models.CategoryGridImage.objects.select_related('category').all().order_by("-display_order", "created_at")
            serializer = serializers.CategoryGridImageSerializerForView(categories_grid_image, many=True)
            log_request(request, "All category grid images fetched", "info", "All category grid images fetched successfully", response_status_code=status.HTTP_200_OK)
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Category fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Category grid image fetch failed", "error","Category grid image fetch failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
class CarouselImageView(APIView):
    
    def post(self,request):
        try:
            data = request.data
            serializer = serializers.CarouselImageSerializer(data=data)
            if serializer.is_valid():
                obj = serializer.save()
               
                log_request(request, f"Carousel image  {obj.id} created", "info", f"Carousel image {obj.id}  created successfully", response_status_code=status.HTTP_201_CREATED)
                return Response({
                    "code": status.HTTP_201_CREATED,
                    "status": "success",
                    "message": "Carousel image created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "code": status.HTTP_400_BAD_REQUEST,
                    "status": "failed",
                    "message": "invalid request",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Carousel image creation failed", "error","Carousel image creation failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    def get(self, request):
        try:
            carousel_image = models.CarouselImage.objects.select_related('category').all().order_by('-display_order', 'created_at')
            serializer = serializers.CarouselImageSerializerForView(carousel_image, many=True)
            log_request(request, "All carousel images fetched", "info", "All carousel images fetched successfully", response_status_code=status.HTTP_200_OK)
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Carousel fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Carousel image fetch failed", "error","Carousel image fetch failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
class CarouselImageDetailView(APIView):
    
    def delete(self, request, pk):
        try:
            carousel_image = models.CarouselImage.objects.get(pk=pk)
            carousel_image.delete()
            log_request(request, "Carousel image deleted", "info", "Carousel image deleted successfully", response_status_code=status.HTTP_200_OK)
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Carousel image deleted successfully",
            }, status=status.HTTP_200_OK)
        except models.CarouselImage.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "status": "failed",
                "message": "Carousel image not found",
                "errors": {"carousel_image_id": [f"Carousel image not found with id {pk}"]}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Carousel image deletion failed", "error","Carousel image deletion failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

class CategoryGridDetailView(APIView):
    
    def delete(self, request, pk):
        try:
            category_grid = models.CategoryGridImage.objects.get(pk=pk)
            category_grid.delete()
            log_request(request, "Category grid image deleted", "info", "Category grid image deleted successfully", response_status_code=status.HTTP_200_OK)
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Category grid image deleted successfully",
            }, status=status.HTTP_200_OK)
        except models.CategoryGridImage.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "status": "failed",
                "message": "Category grid image not found",
                "errors": {"category_grid_id": [f"Category grid image not found with id {pk}"]}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(str(e))
            log_request(request, "Category grid image deletion failed", "error","Category grid image deletion failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "failed",
                "message": "internal server error",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)