const PAGES = {
  ALL_DOCUMENTS: 'all-documents',
};

const ACCOUNT_TYPES = {
  FREE: 'Free Plan',
  PRO: 'Pro Plan',
};

const INVALID_EMAIL_DOMAINS = [
  'gmail',
  'yahoo',
  'hotmail',
  'aol',
  'msn',
  'wanadoo',
  'orange',
  'comcast',
  'live',
  'rediffmail',
  'free',
  'web',
  'yandex',
  'ymail',
  'libero',
  'outlook',
  'uol',
  'bol',
  'mail',
  'cox',
  'sbcglobal',
  'sfr',
  'verizon',
  'googlemail',
  'ig',
  'bigpond',
  'terra',
  'neuf',
  'alice',
  'rocketmail',
  'att',
  'laposte',
  'facebook',
  'bellsouth',
  'charter',
  'rambler',
  'tiscali',
  'shaw',
  'sky',
  'earthlink',
  'optonline',
  'freenet',
  't-online',
  'aliceadsl',
  'virgilio',
  'home',
  'qq',
  'telenet',
  'voila',
  'planet',
  'tin',
  'ntlworld',
  'arcor',
  'frontiernet',
  'hetnet',
  'zonnet',
  'club-internet',
  'juno',
  'optusnet',
  'blueyonder',
  'bluewin',
  'skynet',
  'sympatico',
  'windstream',
  'mac',
  'centurytel',
  'chello',
  'aim',
  'protonmail',
  'icloud',
  'yopmail',
  'example',
  'test',
  'hey',
];

const USER_TYPES = {
  owner: 'owner',
  member: 'member',
  admin: 'admin',
  moderator: 'moderator',
};

const CHECKBOX_STATES = {
  checked: 'checked',
  unchecked: 'unchecked',
  partialChecked: 'partial',
};

export const OLD = 'old';
export const NEW = 'new';

/**
 * @property {string} REQUEST_ACCESS - only member and moderator role can access this modal. chataiEnabled must be false and chataiRequestSent flag must be false for this modal to be visible.
 * @property {string} ACCESS_REQUESTED - only member and moderator role can access this modal. chatAiEnabled must be false and chataiRequestSent must be true for this modal to be visible
 * @property {string} WELCOME- Anyone can access this modal. chataiEnabled must be true and  chataiPopupSeen must be false for this modal to be visible.
 * @property {string} ACCEPT_REQUEST - Only admin and owner role can access this modal. chataiEnabled must be false  for this modal to be visible
 */
export const CHATAI_MODAL_TYPE = {
  REQUEST_ACCESS: 'request-access',
  ACCESS_REQUESTED: 'access-requested',
  WELCOME: 'welcome',
  ACCEPT_REQUEST: 'accept-request',
};

const ALLOWED_QUERY_PARAMS_LOCAL_STORAGE = ['redirectFromEmail'];

export {
  ACCOUNT_TYPES,
  ALLOWED_QUERY_PARAMS_LOCAL_STORAGE,
  CHECKBOX_STATES,
  INVALID_EMAIL_DOMAINS,
  PAGES,
  USER_TYPES,
};
