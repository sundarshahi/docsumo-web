import { USER_ROLES } from 'client/constants/userRoles';

const commonRestrictedRoutes = [
  /\/settings\/users(|\/)$/,
  /\/services(|\/)$/,
  /\/model.*$/,
];

export const restrictedRoutesRegex = {
  [USER_ROLES.MEMBER]: commonRestrictedRoutes,
  [USER_ROLES.MODERATOR]: commonRestrictedRoutes,
  [USER_ROLES.ADMIN]: [],
  [USER_ROLES.OWNER]: [],
};
