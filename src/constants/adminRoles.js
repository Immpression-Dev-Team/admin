// Mirrors Backend/constants/adminRoles.js — keep in sync manually, since the
// admin frontend and Backend are separate projects with no shared package.
export const ADMIN_ROLES = Object.freeze({
  SUPER_ADMIN: "super-admin",
  MODERATOR: "moderator",
  CONTENT_EDITOR: "content-editor",
});

export const CONTENT_EDITOR_DEFAULT_PATH = "/analytics";
