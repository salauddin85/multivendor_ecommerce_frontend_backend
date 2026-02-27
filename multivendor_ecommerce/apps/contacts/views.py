
import logging
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from . import serializers
from . import models

from apps.activity_log.utils.functions import log_request
from .tasks import send_contact_confirmation_email
from config.utils.pagination import CustomPageNumberPagination
from .filters import ContactFilter
from .utils.permissions import ContactManagementPermission


logger = logging.getLogger("myapp")


class ContactView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated(), ContactManagementPermission()]
        return []

    def post(self, request):
        try:
            data = request.data
            serializer = serializers.ContactSerializer(data=data)

            if serializer.is_valid():
                contact = serializer.save()
                email = serializer.validated_data["email"]
                full_name = serializer.validated_data["full_name"]

                # log the request
                log_request(request, "Contact created", "info",
                            f"Contact '{email}' created successfully", response_status_code=status.HTTP_201_CREATED)
                # send confirmation email asynchronously
                send_contact_confirmation_email.delay_on_commit(
                    email, full_name)
                return Response({
                    "code": status.HTTP_201_CREATED,
                    "message": "Contact created successfully",
                    "status": "success",
                    "data": {
                        "id": contact.id,
                        "contact_email": email
                    }
                }, status=status.HTTP_201_CREATED)
            # log the request
            log_request(request, "Contact creation failed", "error",
                        "Contact creation failed due to invalid data", response_status_code=status.HTTP_400_BAD_REQUEST)
            return Response(
                {
                    "code": status.HTTP_400_BAD_REQUEST,
                    "message": "Invalid request",
                    "status": "failed",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(str(e))
            # log the request
            log_request(request, "Contact creation failed", "error", "Contact creation failed due to server error",
                        response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "Error occurred",
                "status": "failed",
                "errors": {
                    'server_error': [str(e)]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        try:
            # user filtering
            all_contacts = models.Contact.objects.all().order_by('-created_at')
            paginator = CustomPageNumberPagination()
            contact_filter = ContactFilter(request.GET, queryset=all_contacts)
            all_contacts = contact_filter.qs
            paginated_contacts = paginator.paginate_queryset(
                all_contacts, request)
            serializer = serializers.ContactSerializerForView(
                paginated_contacts, many=True)

            # log the request
            log_request(request, "All contacts fetched", "info",
                        "All contacts fetched successfully", response_status_code=status.HTTP_200_OK)
            return paginator.get_paginated_response({
                "code": status.HTTP_200_OK,
                "message": "All contacts fetched successfully",
                "status": "success",
                "data": serializer.data
            })

        except Exception as e:
            logger.exception(str(e))
            # log the request
            log_request(request, "All contacts fetch failed", "error", "All contacts fetch failed due to server error",
                        response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "Error occurred",
                "status": "failed",
                "errors": {
                    'server_error': [str(e)]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContactDetailView(APIView):
    permission_classes = [IsAuthenticated, ContactManagementPermission]

    def get(self, request, pk):
        try:
            contact = models.Contact.objects.get(pk=pk)
            serializer = serializers.ContactDetailSerializer(contact)

            # log the request
            log_request(request, "Contact detail fetched", "info",
                        f"Contact detail for id {pk} fetched successfully", response_status_code=status.HTTP_200_OK)
            return Response(
                {
                    "code": status.HTTP_200_OK,
                    "message": "Contact detail fetched successfully",
                    "status": "success",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
        except models.Contact.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "message": "Contact not found",
                "status": "failed",
                "errors": {
                    'not_found': [f"Contact with id {pk} does not exist."]
                }
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(str(e))
            # log the request
            log_request(request, "Contact detail fetch failed", "error",
                        f"Contact detail fetch for id {pk} failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "Error occurred",
                "status": "failed",
                "errors": {
                    'server_error': [str(e)]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            contact = models.Contact.objects.get(pk=pk)
            contact.delete()
            # log the request
            log_request(request, "Contact deleted", "info",
                        f"Contact with id {pk} deleted successfully", response_status_code=status.HTTP_204_NO_CONTENT)
            return Response({
                "code": status.HTTP_204_NO_CONTENT,
                "message": "Contact deleted successfully",
                "status": "success",

            }, status=status.HTTP_204_NO_CONTENT)
        except models.Contact.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "message": "Contact not found",
                "status": "failed",
                "errors": {
                    'not_found': [f"Contact with id {pk} does not exist."]
                }
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(str(e))
            # log the request
            log_request(request, "Contact deletion failed", "error",
                        f"Contact deletion for id {pk} failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "Error occurred",
                "status": "failed",
                "errors": {
                    'server_error': [str(e)]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        try:
            contact = models.Contact.objects.get(pk=pk)
            serializer = serializers.ContactUpdateSerializer(
                contact, data=request.data, partial=True)

            if serializer.is_valid():
                updated_contact = serializer.save()

                # log the request
                log_request(request, "Contact updated", "info",
                            f"Contact with id {pk} updated successfully", response_status_code=status.HTTP_200_OK)
                return Response({
                    "code": status.HTTP_200_OK,
                    "message": "Contact updated successfully",
                    "status": "success",
                    "data": serializers.ContactDetailSerializer(updated_contact).data
                }, status=status.HTTP_200_OK)
            # log the request
            log_request(request, "Contact update failed", "error",
                        f"Contact update for id {pk} failed due to invalid data", response_status_code=status.HTTP_400_BAD_REQUEST)
            return Response({
                "code": status.HTTP_400_BAD_REQUEST,
                "message": "Invalid request",
                "status": "failed",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except models.Contact.DoesNotExist:
            return Response({
                "code": status.HTTP_404_NOT_FOUND,
                "message": "Contact not found",
                "status": "failed",
                "errors": {
                    'not_found': [f"Contact with id {pk} does not exist."]
                }
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(str(e))
            # log the request
            log_request(request, "Contact update failed", "error",
                        f"Contact update for id {pk} failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "Error occurred",
                "status": "failed",
                "errors": {
                    'server_error': [str(e)]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
