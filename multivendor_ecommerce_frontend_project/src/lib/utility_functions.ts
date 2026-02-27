function format_date(data: string) {
  const readableDate = new Date(data).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return readableDate;
}



export { format_date };

export const navigationPermissions: any = {
  Home: null,
  "Roles Management": "group_permission_management",
  Onboarding: "employee_management",
  "Activity Management": "activity_log_management",
  "Sales Management": "order_management",
  "Catalog Management": "catalog_management",
  "Products Management": "product_management",
  "Customer Management": "customer_management",
  "Blog Management": "blog_management",
  "Shipping Management": "order_management",
  "Coupons Management": "coupon_management",
  "Users Management": "view_all_users",
  "Subscribers Management": "subscription_management",
  "Contact Management": "contact_management",
};

export const filterNavigationByPermissions = (navArray: any, userPermissions: any) => {
  return navArray.filter((item: any) => {
    const requiredPermission = navigationPermissions[item.label];
    const hasPermissionForItem =
      requiredPermission === null ||
      userPermissions.includes(requiredPermission);

    if (item.children && item.children.length > 0) {
      const filteredSubItems = filterNavigationByPermissions(
        item.children,
        userPermissions,
      );
      if (hasPermissionForItem || filteredSubItems.length > 0) {
        return { ...item, children: filteredSubItems };
      }
      return false;
    }
    return hasPermissionForItem;
  });
};
