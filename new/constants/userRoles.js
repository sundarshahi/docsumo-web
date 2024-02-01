/**
 * @property {string} MEMBER - can review and approve the document.
 * @property {string} MODERATOR- MEMBER access + can assign the document.
 * @property {string} ADMIN- MODERATOR access + can select the API and change document Type.
 * @property {string} OWNER - ADMIN access + control other users
 */
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  MODERATOR: 'moderator',
};
