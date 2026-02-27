

from apps.authorization.utils.custom_permission import HasCustomPermission

class WishlistManagementPermission(HasCustomPermission):
    required_permission = "wishlist_management"
