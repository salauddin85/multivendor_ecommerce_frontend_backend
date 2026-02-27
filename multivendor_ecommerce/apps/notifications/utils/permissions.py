

from apps.authorization.utils.custom_permission import HasCustomPermission

class SubscriptionManagementPermission(HasCustomPermission):
    required_permission = "subscription_management"
