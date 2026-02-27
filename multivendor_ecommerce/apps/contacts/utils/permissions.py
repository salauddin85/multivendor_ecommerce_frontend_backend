from apps.authorization.utils.custom_permission import HasCustomPermission


class ContactManagementPermission(HasCustomPermission):
    required_permission = "contact_management"
