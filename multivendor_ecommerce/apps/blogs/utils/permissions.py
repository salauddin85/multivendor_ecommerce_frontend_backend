

from apps.authorization.utils.custom_permission import HasCustomPermission

class BlogManagementPermission(HasCustomPermission):
    required_permission = "blog_management"
