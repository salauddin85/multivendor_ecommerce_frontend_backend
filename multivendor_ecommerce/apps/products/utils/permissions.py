

from apps.authorization.utils.custom_permission import HasCustomPermission

class ProductManagementPermission(HasCustomPermission):
    required_permission = "product_management"
