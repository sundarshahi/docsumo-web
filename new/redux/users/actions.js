import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';

export const KEY = 'USERS';
export const KEY_CAMELIZED = _.camelCase(KEY);

// Review documents page
const USERS_FETCH = `${KEY}_USERS_FETCH`;
const USERS_STATUS_UPDATE = `${KEY}_USERS_STATUS_UPDATE`;
const USERS_FETCH_CANCEL = `${KEY}_USERS_FETCH_CANCEL`;
const USERS_FETCH_FULFILLED = `${KEY}_USERS_FETCH_FULFILLED`;
const USERS_FETCH_REJECTED = `${KEY}_USERS_FETCH_REJECTED`;
const USERS_RESET = `${KEY}_USERS_RESET`;
const USERS_DELETE = `${KEY}_USERS_DELETE`;
const CURRENT_USER = `${KEY}_CURRENT_USER`;

export const actionTypes = {
  USERS_FETCH,
  USERS_FETCH_CANCEL,
  USERS_RESET,
  USERS_FETCH_FULFILLED,
  USERS_FETCH_REJECTED,
  USERS_STATUS_UPDATE,
  USERS_DELETE,
  CURRENT_USER,
};

export const actions = {
  usersFetch: createAction(USERS_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  usersReset: createAction(USERS_RESET, payloadPassthrough),

  userDelete: createAction(USERS_DELETE, payloadPassthrough),
  setCurrentUser: createAction(CURRENT_USER, payloadPassthrough),
};
