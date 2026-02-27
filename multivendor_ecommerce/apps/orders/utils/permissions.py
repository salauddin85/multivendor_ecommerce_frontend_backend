

from apps.authorization.utils.custom_permission import HasCustomPermission

class OrderManagementPermission(HasCustomPermission):
    required_permission = "order_management"
