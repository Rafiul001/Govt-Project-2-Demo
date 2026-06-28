export const adminType = {
  SUPER_ADMIN: "SUPER_ADMIN",
  BRANCH_ADMIN: "BRANCH_ADMIN",
} as const;

export const adminTypes = Object.values(adminType);
export type TAdminTypes = (typeof adminTypes)[number];

export const sidebarPosition = {
  LEFT: "left",
  RIGHT: "right",
} as const;

export const sidebarPositions = Object.values(sidebarPosition);
export type TSidebarPositionTypes = (typeof sidebarPositions)[number];
