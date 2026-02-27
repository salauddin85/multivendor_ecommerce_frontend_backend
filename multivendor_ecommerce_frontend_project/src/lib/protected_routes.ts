import { permission } from "process";

export const protected_routes = [
  { path: "dashboard", permission_name: null },
  { path: "products", permission_name: "product_management" },
  { path: "activity", permission_name: "activity_log_management" },
  { path: "blogs", permission_name: "blog_management" },
  { path: "coupons", permission_name: "coupon_management" },
  { path: "sales", permission_name: "order_management" },
  { path: "shipping", permission_name: "shipping_management" },
  { path:  "subscribers", permission_name: "subscription_management" },
  { path: "roles", permission_name: "group_permission_management" },
  { path: "customers",permission_name: "view_all_users" },
  { path: "registration", permission_name: "employee_management" },
  { path: "contacts", permission_name: "contact_management" },


];
