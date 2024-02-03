import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';

export const KEY = 'ACTIVITIES';
export const KEY_CAMELIZED = _.camelCase(KEY);

// Review documents page
const ACTIVITY_FETCH = `${KEY}_ACTIVITY_FETCH`;
const ACTIVITY_FETCH_CANCEL = `${KEY}_ACTIVITY_FETCH_CANCEL`;
const ACTIVITY_FETCH_FULFILLED = `${KEY}_ACTIVITY_FETCH_FULFILLED`;
const ACTIVITY_FETCH_REJECTED = `${KEY}_ACTIVITY_FETCH_REJECTED`;
const ACTIVITY_RESET = `${KEY}_ACTIVITY_RESET`;

const DOCUMENT_ACTIVITY_FETCH = `${KEY}_DOCUMENT_ACTIVITY_FETCH`;
const DOCUMENT_ACTIVITY_FETCH_FULFILLED = `${KEY}_DOCUMENT_ACTIVITY_FETCH_FULFILLED`;
const DOCUMENT_ACTIVITY_FETCH_REJECTED = `${KEY}_DOCUMENT_ACTIVITY_FETCH_REJECTED`;
const DOCUMENT_ACTIVITY_RESET = `${KEY}_DOCUMENT_ACTIVITY_RESET`;

const USER_ACTIVITY_FETCH = `${KEY}_USER_ACTIVITY_FETCH`;
const USER_ACTIVITY_FETCH_FULFILLED = `${KEY}_USER_ACTIVITY_FETCH_FULFILLED`;
const USER_ACTIVITY_FETCH_REJECTED = `${KEY}_USER_ACTIVITY_FETCH_REJECTED`;
const USER_ACTIVITY_RESET = `${KEY}_USER_ACTIVITY_RESET`;

const CREDIT_ACTIVITY_FETCH = `${KEY}_CREDIT_ACTIVITY_FETCH`;
const CREDIT_ACTIVITY_FETCH_FULFILLED = `${KEY}_CREDIT_ACTIVITY_FETCH_FULFILLED`;
const CREDIT_ACTIVITY_FETCH_REJECTED = `${KEY}_CREDIT_ACTIVITY_FETCH_REJECTED`;
const CREDIT_ACTIVITY_RESET = `${KEY}_CREDIT_ACTIVITY_RESET`;

const WEBHOOK_ACTIVITY_FETCH = `${KEY}_WEBHOOK_ACTIVITY_FETCH`;
const WEBHOOK_ACTIVITY_FETCH_FULFILLED = `${KEY}_WEBHOOK_ACTIVITY_FETCH_FULFILLED`;
const WEBHOOK_ACTIVITY_FETCH_REJECTED = `${KEY}_WEBHOOK_ACTIVITY_FETCH_REJECTED`;
const WEBHOOK_ACTIVITY_RESET = `${KEY}_WEBHOOK_ACTIVITY_RESET`;

const MODE_ACTIVITY_FETCH = `${KEY}__MODE_ACTIVITY_FETCH`;
const MODE_ACTIVITY_FETCH_FULFILLED = `${KEY}_MODE_ACTIVITY_FETCH_FULFILLED`;
const MODE_ACTIVITY_FETCH_REJECTED = `${KEY}_MODE_ACTIVITY_FETCH_REJECTED`;
const MODE_ACTIVITY_RESET = `${KEY}_MODE_ACTIVITY_RESET`;

const ACTIVITY_COUNTS_FETCH = `${KEY}_ACTIVITY_COUNTS_FETCH`;
const ACTIVITY_COUNTS_FETCH_FULFILLED = `${KEY}_ACTIVITY_COUNTS_FETCH_FULFILLED`;
const ACTIVITY_COUNTS_FETCH_REJECTED = `${KEY}_ACTIVITY_COUNTS_FETCH_REJECTED`;

const ACTIVITY_FETCH_STATUS = `${KEY}_ACTIVITY_FETCH_STATUS`;

export const actionTypes = {
  ACTIVITY_FETCH,
  ACTIVITY_FETCH_CANCEL,
  ACTIVITY_FETCH_STATUS,
  ACTIVITY_FETCH_FULFILLED,
  ACTIVITY_FETCH_REJECTED,

  DOCUMENT_ACTIVITY_FETCH,
  DOCUMENT_ACTIVITY_FETCH_FULFILLED,
  DOCUMENT_ACTIVITY_FETCH_REJECTED,
  DOCUMENT_ACTIVITY_RESET,

  USER_ACTIVITY_FETCH,
  USER_ACTIVITY_FETCH_FULFILLED,
  USER_ACTIVITY_FETCH_REJECTED,
  USER_ACTIVITY_RESET,

  CREDIT_ACTIVITY_FETCH,
  CREDIT_ACTIVITY_FETCH_FULFILLED,
  CREDIT_ACTIVITY_FETCH_REJECTED,
  CREDIT_ACTIVITY_RESET,

  WEBHOOK_ACTIVITY_FETCH,
  WEBHOOK_ACTIVITY_FETCH_FULFILLED,
  WEBHOOK_ACTIVITY_FETCH_REJECTED,
  WEBHOOK_ACTIVITY_RESET,

  MODE_ACTIVITY_FETCH,
  MODE_ACTIVITY_FETCH_FULFILLED,
  MODE_ACTIVITY_FETCH_REJECTED,
  MODE_ACTIVITY_RESET,

  ACTIVITY_COUNTS_FETCH,
  ACTIVITY_COUNTS_FETCH_FULFILLED,
  ACTIVITY_COUNTS_FETCH_REJECTED,

  ACTIVITY_RESET,
};

export const actions = {
  allActivityFetch: createAction(ACTIVITY_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  activityReset: createAction(ACTIVITY_RESET, payloadPassthrough),

  documentActivityFetch: createAction(DOCUMENT_ACTIVITY_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  documentActivityReset: createAction(
    DOCUMENT_ACTIVITY_RESET,
    payloadPassthrough
  ),

  userActivityFetch: createAction(USER_ACTIVITY_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  userActivityReset: createAction(USER_ACTIVITY_RESET, payloadPassthrough),

  creditActivityFetch: createAction(CREDIT_ACTIVITY_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  creditActivityReset: createAction(ACTIVITY_RESET, payloadPassthrough),

  modeActivityFetch: createAction(MODE_ACTIVITY_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  modeActivityReset: createAction(MODE_ACTIVITY_RESET, payloadPassthrough),

  webhookActivityFetch: createAction(WEBHOOK_ACTIVITY_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  webhookActivityReset: createAction(ACTIVITY_RESET, payloadPassthrough),

  fetchActivityCounts: createAction(ACTIVITY_COUNTS_FETCH, payloadPassthrough),
};
