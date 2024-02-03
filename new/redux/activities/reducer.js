import { handleActions } from 'redux-actions';

import _ from 'lodash';
import * as apiConstants from 'new/constants/api';

import { actionTypes } from './actions';

export const ALL_ACTIVITY = 'allActivity';
export const DOCUMENT_ACTIVITY = 'documentActivity';
export const USER_ACTIVITY = 'userActivity';
export const CREDIT_ACTIVITY = 'creditActivity';
export const WEBHOOK_ACTIVITY = 'webhookActivity';

export const MODE_ACTIVITY = 'modeActivity';

function getInitialState() {
  return {
    // documentsById: MOCK_documentsById,
    globalActivityCounts: {},

    [ALL_ACTIVITY]: {
      documentIds: [],
      meta: {},
      fetchState: null,
    },
    [DOCUMENT_ACTIVITY]: {
      documentIds: [],
      fetchState: null,
    },
    [USER_ACTIVITY]: {
      documentIds: [],
      meta: {},
      fetchState: null,
    },

    [CREDIT_ACTIVITY]: {
      documentIds: [],
      meta: {},
      fetchState: null,
    },

    [WEBHOOK_ACTIVITY]: {
      documentIds: [],
      meta: {},
      fetchState: null,
    },

    [MODE_ACTIVITY]: {
      documentIds: [],
      meta: {},
      fetchState: null,
    },
  };
}

export default handleActions(
  {
    [actionTypes.ACTIVITY_FETCH](state) {
      return {
        ...state,
        [ALL_ACTIVITY]: {
          ...state[ALL_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.ACTIVITY_FETCH_FULFILLED](state, { payload }) {
      const activityData = _.get(payload.responsePayload, 'data', {});
      const { data, ...meta } = activityData;

      return {
        ...state,
        [ALL_ACTIVITY]: {
          ...state[ALL_ACTIVITY],
          allActivity: data,
          meta: {
            ...state[ALL_ACTIVITY].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.ACTIVITY_FETCH_REJECTED](state) {
      return {
        ...state,
        [ALL_ACTIVITY]: {
          ...state[ALL_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.ACTIVITY_RESET](state) {
      return {
        ...state,
        [ALL_ACTIVITY]: {
          services: [],
          meta: {},
        },
      };
    },

    [actionTypes.DOCUMENT_ACTIVITY_FETCH](state) {
      return {
        ...state,
        [DOCUMENT_ACTIVITY]: {
          ...state[DOCUMENT_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.DOCUMENT_ACTIVITY_FETCH_FULFILLED](state, { payload }) {
      const activityData = _.get(payload.responsePayload, 'data', {});
      const { data, ...meta } = activityData;

      return {
        ...state,
        [DOCUMENT_ACTIVITY]: {
          ...state[DOCUMENT_ACTIVITY],
          documentActivity: data,
          meta: {
            ...state[DOCUMENT_ACTIVITY].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.DOCUMENT_ACTIVITY_FETCH_REJECTED](state) {
      return {
        ...state,
        [DOCUMENT_ACTIVITY]: {
          ...state[DOCUMENT_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.DOCUMENT_ACTIVITY_RESET](state) {
      return {
        ...state,
        [DOCUMENT_ACTIVITY]: {
          documentActivity: [],
          meta: {},
        },
      };
    },

    [actionTypes.USER_ACTIVITY_FETCH](state) {
      return {
        ...state,
        [USER_ACTIVITY]: {
          ...state[USER_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.USER_ACTIVITY_FETCH_FULFILLED](state, { payload }) {
      const activityData = _.get(payload.responsePayload, 'data', {});
      const { data, ...meta } = activityData;

      return {
        ...state,
        [USER_ACTIVITY]: {
          ...state[USER_ACTIVITY],
          userActivity: data,
          meta: {
            ...state[USER_ACTIVITY].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.USER_ACTIVITY_FETCH_REJECTED](state) {
      return {
        ...state,
        [USER_ACTIVITY]: {
          ...state[USER_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.USER_ACTIVITY_RESET](state) {
      return {
        ...state,
        [USER_ACTIVITY]: {
          userActivity: [],
          meta: {},
        },
      };
    },

    [actionTypes.CREDIT_ACTIVITY_FETCH](state) {
      return {
        ...state,
        [CREDIT_ACTIVITY]: {
          ...state[CREDIT_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.CREDIT_ACTIVITY_FETCH_FULFILLED](state, { payload }) {
      const activityData = _.get(payload.responsePayload, 'data', {});
      const { data, ...meta } = activityData;

      return {
        ...state,
        [CREDIT_ACTIVITY]: {
          ...state[CREDIT_ACTIVITY],
          creditActivity: data,
          meta: {
            ...state[CREDIT_ACTIVITY].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.CREDIT_ACTIVITY_FETCH_REJECTED](state) {
      return {
        ...state,
        [CREDIT_ACTIVITY]: {
          ...state[CREDIT_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.CREDIT_ACTIVITY_RESET](state) {
      return {
        ...state,
        [CREDIT_ACTIVITY]: {
          creditActivity: [],
          meta: {},
        },
      };
    },

    [actionTypes.WEBHOOK_ACTIVITY_FETCH](state) {
      return {
        ...state,
        [WEBHOOK_ACTIVITY]: {
          ...state[WEBHOOK_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.WEBHOOK_ACTIVITY_FETCH_FULFILLED](state, { payload }) {
      const activityData = _.get(payload.responsePayload, 'data', {});
      const { data, ...meta } = activityData;

      return {
        ...state,
        [WEBHOOK_ACTIVITY]: {
          ...state[WEBHOOK_ACTIVITY],
          webhookActivity: data,
          meta: {
            ...state[WEBHOOK_ACTIVITY].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.WEBHOOK_ACTIVITY_FETCH_REJECTED](state) {
      return {
        ...state,
        [WEBHOOK_ACTIVITY]: {
          ...state[WEBHOOK_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.WEBHOOK_ACTIVITY_RESET](state) {
      return {
        ...state,
        [WEBHOOK_ACTIVITY]: {
          webhookActivity: [],
          meta: {},
        },
      };
    },

    [actionTypes.MODE_ACTIVITY_FETCH](state) {
      return {
        ...state,
        [MODE_ACTIVITY]: {
          ...state[MODE_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.MODE_ACTIVITY_FETCH_FULFILLED](state, { payload }) {
      const activityData = _.get(payload.responsePayload, 'data', {});
      const { data, ...meta } = activityData;

      return {
        ...state,
        [MODE_ACTIVITY]: {
          ...state[MODE_ACTIVITY],
          modeActivity: data,
          meta: {
            ...state[MODE_ACTIVITY].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.MODE_ACTIVITY_FETCH_REJECTED](state) {
      return {
        ...state,
        [MODE_ACTIVITY]: {
          ...state[MODE_ACTIVITY],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.MODE_ACTIVITY_RESET](state) {
      return {
        ...state,
        [MODE_ACTIVITY]: {
          modeActivity: [],
          meta: {},
        },
      };
    },

    [actionTypes.ACTIVITY_FETCH_STATUS](state, { payload }) {
      const { status } = payload;
      return {
        ...state,
        activityFetchingStatus: status,
      };
    },
    [actionTypes.ACTIVITY_COUNTS_FETCH_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});
      const { counts } = data;
      return {
        ...state,
        globalActivityCounts: counts || {},
      };
    },
  },
  getInitialState()
);
