

from apps.authorization.utils.custom_permission import HasCustomPermission

class CatalogManagementPermission(HasCustomPermission):
    required_permission = "catalog_management"
