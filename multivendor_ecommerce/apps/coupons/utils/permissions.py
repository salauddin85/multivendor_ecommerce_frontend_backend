

from apps.authorization.utils.custom_permission import HasCustomPermission

class CouponManagementPermission(HasCustomPermission):
    required_permission = "coupon_management"
