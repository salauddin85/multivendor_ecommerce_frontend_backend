

from apps.authorization.utils.custom_permission import HasCustomPermission

class PaymentManagementPermission(HasCustomPermission):
    required_permission = "payment_management"
