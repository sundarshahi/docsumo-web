import { USER_TYPES } from 'new/constants';

export const USER_TYPES_LIST = [
  {
    value: USER_TYPES.owner,
    description:
      'Has full access to all the resources including the right to transfer ownership to other member.',
  },
  {
    value: USER_TYPES.admin,
    description:
      'Admin can select the API and change document type and can also review and approve the document.',
  },
  {
    value: USER_TYPES.member,
    description: 'Member can only review and approve the document.',
  },
  {
    value: USER_TYPES.moderator,
    description: 'Moderator can review, approve and assign documents.',
  },
];
