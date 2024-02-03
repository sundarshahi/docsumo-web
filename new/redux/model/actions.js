import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';

export const KEY = 'MODEL';
export const KEY_CAMELIZED = _.camelCase(KEY);

// Database table page
const MODEL_FETCH = `${KEY}_MODEL_FETCH`;
const MODEL_FETCH_CANCEL = `${KEY}_MODEL_FETCH_CANCEL`;
const MODEL_FETCH_FULFILLED = `${KEY}_MODEL_FETCH_FULFILLED`;
const MODEL_FETCH_REJECTED = `${KEY}_MODEL_FETCH_REJECTED`;
const MODEL_DELETE = `${KEY}_MODEL_DELETE`;
const CURRENT_MODEL = `${KEY}_CURRENT_MODEL`;
const SET_CHECKBOX_SELECTION_ALL = `${KEY}_SET_CHECKBOX_SELECTION_ALL`;
const SET_CHECKBOX_SELECTION_INDIVIDUAL = `${KEY}_SET_CHECKBOX_SELECTION_INDIVIDUAL`;
const SHOW_TRAIN_MODEL_MODAL = `${KEY}_SHOW_TRAIN_MODEL_MODAL`;
const HIDE_TRAIN_MODEL_MODAL = `${KEY}_HIDE_TRAIN_MODEL_MODAL`;
const OPEN_SINGLE_VIEW = `${KEY}_OPEN_SINGLE_VIEW`;
const OPEN_SINGLE_VIEW_FULFILLED = `${KEY}_OPEN_SINGLE_VIEW_FULFILLED`;
const OPEN_SINGLE_VIEW_REJECTED = `${KEY}_OPEN_SINGLE_VIEW_REJECTED`;
const OPEN_COMPARISION_VIEW_FULFILLED = `${KEY}_OPEN_COMPARISION_VIEW_FULFILLED`;
const OPEN_COMPARISION_VIEW_REJECTED = `${KEY}_OPEN_COMPARISION_VIEW_REJECTED`;
const RENAME_MODEL = `${KEY}_RENAME_MODEL`;

export const actionTypes = {
  MODEL_FETCH,
  MODEL_FETCH_CANCEL,
  MODEL_FETCH_FULFILLED,
  MODEL_FETCH_REJECTED,
  MODEL_DELETE,
  CURRENT_MODEL,
  SET_CHECKBOX_SELECTION_ALL,
  SET_CHECKBOX_SELECTION_INDIVIDUAL,
  SHOW_TRAIN_MODEL_MODAL,
  HIDE_TRAIN_MODEL_MODAL,
  OPEN_SINGLE_VIEW,
  OPEN_SINGLE_VIEW_FULFILLED,
  OPEN_SINGLE_VIEW_REJECTED,
  OPEN_COMPARISION_VIEW_FULFILLED,
  OPEN_COMPARISION_VIEW_REJECTED,
  RENAME_MODEL,
};

export const actions = {
  modelFetch: createAction(MODEL_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  modelDelete: createAction(MODEL_DELETE, payloadPassthrough),
  setCurrentMODEL: createAction(CURRENT_MODEL, payloadPassthrough),
  setCheckBoxSelectionAll: createAction(
    SET_CHECKBOX_SELECTION_ALL,
    payloadPassthrough
  ),
  setCheckBoxSelectionIndividual: createAction(
    SET_CHECKBOX_SELECTION_INDIVIDUAL,
    payloadPassthrough
  ),
  showTrainModelModal: createAction(SHOW_TRAIN_MODEL_MODAL, payloadPassthrough),
  hideTrainModelModal: createAction(HIDE_TRAIN_MODEL_MODAL, payloadPassthrough),
  openSingleView: createAction(OPEN_SINGLE_VIEW, payloadPassthrough),
  openComparisionViewFulfilled: createAction(
    OPEN_COMPARISION_VIEW_FULFILLED,
    payloadPassthrough
  ),
  openComparisionViewRejected: createAction(
    OPEN_COMPARISION_VIEW_REJECTED,
    payloadPassthrough
  ),
  renameModel: createAction(RENAME_MODEL, payloadPassthrough),
};
