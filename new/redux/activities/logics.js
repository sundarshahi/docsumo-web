import { createLogic } from 'redux-logic';

import _ from 'lodash';
import * as api from 'new/api';

import { actionTypes } from './actions';

const allActivityFetchLogic = createLogic({
  type: actionTypes.ACTIVITY_FETCH,
  cancelType: actionTypes.ACTIVITY_FETCH_CANCEL,

  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.ACTIVITY_FETCH_STATUS,
        payload: {
          status: 'allActivityFetch',
        },
      });
      const response = await api.getAllActivity({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.ACTIVITY_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.ACTIVITY_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});
const creditActivityFetchLogic = createLogic({
  type: actionTypes.CREDIT_ACTIVITY_FETCH,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.ACTIVITY_FETCH_STATUS,
        payload: {
          status: 'creditActivityFetch',
        },
      });
      const response = await api.getCreditActivity({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.CREDIT_ACTIVITY_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.CREDIT_ACTIVITY_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});
const webhookActivityFetchLogic = createLogic({
  type: actionTypes.WEBHOOK_ACTIVITY_FETCH,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.ACTIVITY_FETCH_STATUS,
        payload: {
          status: 'webhookActivityFetch',
        },
      });
      const response = await api.getWebhookActivity({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.WEBHOOK_ACTIVITY_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.WEBHOOK_ACTIVITY_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});
const documentActivityFetchLogic = createLogic({
  type: actionTypes.DOCUMENT_ACTIVITY_FETCH,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.ACTIVITY_FETCH_STATUS,
        payload: {
          status: 'documentActivityFetch',
        },
      });
      const response = await api.getDocumentActivity({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.DOCUMENT_ACTIVITY_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.DOCUMENT_ACTIVITY_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});
const userActivityFetchLogic = createLogic({
  type: actionTypes.USER_ACTIVITY_FETCH,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.ACTIVITY_FETCH_STATUS,
        payload: {
          status: 'userActivityFetch',
        },
      });
      const response = await api.getUserActivity({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.USER_ACTIVITY_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.USER_ACTIVITY_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

const modeActivityFetchLogic = createLogic({
  type: actionTypes.MODE_ACTIVITY_FETCH,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.ACTIVITY_FETCH_STATUS,
        payload: {
          status: 'modeActivityFetch',
        },
      });
      const response = await api.getModeActivity({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.MODE_ACTIVITY_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.MODE_ACTIVITY_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

const activityCountsFetchLogic = createLogic({
  type: actionTypes.ACTIVITY_COUNTS_FETCH,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: actionTypes.ACTIVITY_COUNTS_FETCH_FULFILLED,
    failType: actionTypes.ACTIVITY_COUNTS_FETCH_REJECTED,
  },

  process({ action }) {
    return api.getActivityCounts({
      queryParams: _.get(action, 'payload.queryParams'),
    });
  },
});

export default [
  allActivityFetchLogic,
  documentActivityFetchLogic,
  userActivityFetchLogic,
  creditActivityFetchLogic,
  activityCountsFetchLogic,
  webhookActivityFetchLogic,
  modeActivityFetchLogic,
];
