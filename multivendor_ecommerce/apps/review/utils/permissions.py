

from apps.authorization.utils.custom_permission import HasCustomPermission

class ReviewManagementPermission(HasCustomPermission):
    required_permission = "review_management"
