import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';

export const KEY = 'REQUESTS';
export const KEY_CAMELIZED = _.camelCase(KEY);

const ADD_REQUEST = `${KEY}_ADD_REQUEST`;
const UPDATE_REQUEST = `${KEY}_UPDATE_REQUEST`;
const REMOVE_REQUEST = `${KEY}_REMOVE_REQUEST`;

export const actionTypes = {
  ADD_REQUEST,
  UPDATE_REQUEST,
  REMOVE_REQUEST,
};

export const actions = {
  addRequest: createAction(ADD_REQUEST, payloadPassthrough),

  updateRequest: createAction(UPDATE_REQUEST, payloadPassthrough),

  removeRequest: createAction(REMOVE_REQUEST, payloadPassthrough),
};
