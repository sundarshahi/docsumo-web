import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';

export const KEY = 'UPLOADCSV';
export const KEY_CAMELIZED = _.camelCase(KEY);

const TOGGLE_OVERLAY_COLLAPSE = `${KEY}_TOGGLE_OVERLAY_COLLAPSE`;
const ADD_NEW_FILE = `${KEY}_ADD_NEW_FILE`;
const UPDATE_FILE_DATA = `${KEY}_UPDATE_FILE_DATA`;
const CANCEL_FILE_UPLOAD = `${KEY}_CANCEL_FILE_UPLOAD`;
const CANCEL_ALL_UPLOADS = `${KEY}_CANCEL_ALL_UPLOADS`;
const RETRY_FILE_UPLOAD = `${KEY}_RETRY_FILE_UPLOAD`;
const CLEAR_UPLOADS = `${KEY}_CLEAR_UPLOADS`;
const SHOW_CANCEL_CONFIRMATION_MODAL = `${KEY}_SHOW_CANCEL_CONFIRMATION_MODAL`;
const HIDE_CANCEL_CONFIRMATION_MODAL = `${KEY}_HIDE_CANCEL_CONFIRMATION_MODAL`;

export const actionTypes = {
  TOGGLE_OVERLAY_COLLAPSE,
  ADD_NEW_FILE,
  UPDATE_FILE_DATA,
  CANCEL_FILE_UPLOAD,
  CANCEL_ALL_UPLOADS,
  RETRY_FILE_UPLOAD,
  CLEAR_UPLOADS,
  SHOW_CANCEL_CONFIRMATION_MODAL,
  HIDE_CANCEL_CONFIRMATION_MODAL,
};

export const toggleOverlayCollapse = createAction(
  TOGGLE_OVERLAY_COLLAPSE,
  payloadPassthrough,
  payloadPassthrough
);
export const addNewFile = createAction(
  ADD_NEW_FILE,
  payloadPassthrough,
  payloadPassthrough
);
export const updateFileData = createAction(
  UPDATE_FILE_DATA,
  payloadPassthrough,
  payloadPassthrough
);
export const cancelFileUpload = createAction(
  CANCEL_FILE_UPLOAD,
  payloadPassthrough,
  payloadPassthrough
);
export const cancelAllUploads = createAction(
  CANCEL_ALL_UPLOADS,
  payloadPassthrough,
  payloadPassthrough
);
export const retryFileUpload = createAction(
  RETRY_FILE_UPLOAD,
  payloadPassthrough,
  payloadPassthrough
);
export const clearUploads = createAction(
  CLEAR_UPLOADS,
  payloadPassthrough,
  payloadPassthrough
);
export const showCancelConfirmationModal = createAction(
  SHOW_CANCEL_CONFIRMATION_MODAL,
  payloadPassthrough,
  payloadPassthrough
);
export const hideCancelConfirmationModal = createAction(
  HIDE_CANCEL_CONFIRMATION_MODAL,
  payloadPassthrough,
  payloadPassthrough
);

export const actions = {
  toggleOverlayCollapse,
  addNewFile,
  updateFileData,
  cancelFileUpload,
  cancelAllUploads,
  retryFileUpload,
  clearUploads,
  showCancelConfirmationModal,
  hideCancelConfirmationModal,
};
