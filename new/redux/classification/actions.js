import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';

export const KEY = 'CLASSIFY';
export const KEY_CAMELIZED = _.camelCase(KEY);

// Classification page
const START_CLASSIFY = `${KEY}_START_CLASSIFY`;
const START_CLASSIFY_FULFILLED = `${KEY}_START_CLASSIFY_FULFILLED`;
const START_CLASSIFY_REJECTED = `${KEY}_START_CLASSIFY_REJECTED`;
const UPDATE_CLASSIFY_DATA = `${KEY}_UPDATE_CLASSIFY_DATA`;
const START_SINGLE_CLASSIFY = `${KEY}_START_SINGLE_CLASSIFY`;

export const actionTypes = {
  START_CLASSIFY,
  START_SINGLE_CLASSIFY,
  START_CLASSIFY_FULFILLED,
  START_CLASSIFY_REJECTED,
  UPDATE_CLASSIFY_DATA,
};

export const actions = {
  startClassify: createAction(START_CLASSIFY, payloadPassthrough),
  updateClassifyData: createAction(UPDATE_CLASSIFY_DATA, payloadPassthrough),
  startSingleClassify: createAction(START_SINGLE_CLASSIFY, payloadPassthrough),
};
