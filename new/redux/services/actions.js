import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';

export const KEY = 'SERVICES';
export const KEY_CAMELIZED = _.camelCase(KEY);

// Review documents page
const SERVICE_FETCH = `${KEY}_SERVICE_FETCH`;
const SERVICE_STATUS_UPDATE = `${KEY}_SERVICE_STATUS_UPDATE`;
const SERVICE_FETCH_CANCEL = `${KEY}_SERVICE_FETCH_CANCEL`;
const SERVICE_FETCH_FULFILLED = `${KEY}_SERVICE_FETCH_FULFILLED`;
const SERVICE_FETCH_REJECTED = `${KEY}_SERVICE_FETCH_REJECTED`;
const SERVICE_RESET = `${KEY}_SERVICE_RESET`;
const SERVICE_UPLOAD_DUMMY_DOC = `${KEY}_SERVICE_UPLOAD_DUMMY_DOC`;
const SERVICE_IS_UPDATING = `${KEY}_SERVICE_IS_UPDATING`;

export const actionTypes = {
  SERVICE_FETCH,
  SERVICE_FETCH_CANCEL,
  SERVICE_FETCH_FULFILLED,
  SERVICE_FETCH_REJECTED,
  SERVICE_RESET,
  SERVICE_STATUS_UPDATE,
  SERVICE_UPLOAD_DUMMY_DOC,
  SERVICE_IS_UPDATING,
};

export const actions = {
  servicesFetch: createAction(SERVICE_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  servicesReset: createAction(SERVICE_RESET, payloadPassthrough),

  statusUpdate: createAction(SERVICE_STATUS_UPDATE, payloadPassthrough),

  uploadDummyDoc: createAction(SERVICE_UPLOAD_DUMMY_DOC, payloadPassthrough),

  updateService: createAction(SERVICE_IS_UPDATING, payloadPassthrough),
};
