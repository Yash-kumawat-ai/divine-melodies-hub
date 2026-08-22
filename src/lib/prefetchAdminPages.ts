/** Prefetch admin route chunks so Moderation opens without a blank wait. */
export function prefetchAdminModeration() {
  void import("@/pages/AdminModeration");
}

export function prefetchAdminPages() {
  prefetchAdminModeration();
  void import("@/pages/AdminAccounts");
  void import("@/pages/AdminAuditLog");
}
