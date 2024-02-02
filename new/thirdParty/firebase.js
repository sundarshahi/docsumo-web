import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  SAMLAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

const SOCIAL_PROVIDERS = {
  google: new GoogleAuthProvider(),
  microsoft: new OAuthProvider('microsoft.com'),
};

const getEnvVariables = () => {
  let envKeys = {};
  let env = '';
  const { hostname = '' } = global.window.location;
  switch (hostname) {
    case 'app.docsumo.com':
      env = 'PRODUCTION';
      break;
    case 'appstaging.docsumo.com':
      env = 'STAGING';
      break;
    default:
      env = 'TESTING';
      break;
  }
  envKeys['apiKey'] = process.env[`REACT_APP_FIREBASE_API_KEY_${env}`];
  envKeys['authDomain'] = process.env[`REACT_APP_FIREBASE_DOMAIN_KEY_${env}`];
  return envKeys;
};

const firebaseInit = () => {
  const { apiKey = '', authDomain = '' } = getEnvVariables();
  const firebaseConfig = {
    apiKey,
    authDomain,
  };
  initializeApp(firebaseConfig);
};

const setAuthProviderConfig = (auth, provider) => {
  // add scope to get user name and email address
  provider.addScope('email');
  // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  auth.languageCode = 'it';
};

const signInAuthProvider = ({ providerId = '', type = '' }) => {
  const auth = getAuth();
  let provider;

  switch (type) {
    case 'SSO':
      provider = new SAMLAuthProvider(providerId);
      break;
    default:
      provider = SOCIAL_PROVIDERS[providerId];
      setAuthProviderConfig(auth, provider);
      break;
  }

  if (!provider) {
    return { error: { message: 'Invalid domain' } };
  }

  return signInWithPopup(auth, provider)
    .then((result) => {
      return {
        tokenResponse: result._tokenResponse,
      };
    })
    .catch((e = {}) => {
      let error = { ...e };
      if (e.message.indexOf('Cloud Function') !== -1) {
        error = {
          status_code: 'INVALID_COMPANY_EMAIL',
          message: 'Invalid email. Please sign up with company email address.',
        };
      }
      if (error.code === 'auth/popup-closed-by-user') {
        error = {};
      }
      return { error: { ...error, providerId: provider.providerId } };
    });
};

const signOutAuthProvider = () => {
  const auth = getAuth();
  return auth
    .signOut()
    .then(() => {
      return true;
    })
    .catch((error) => {
      return error.code;
    });
};

export { firebaseInit, signInAuthProvider, signOutAuthProvider };
