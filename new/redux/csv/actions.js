import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';

export const KEY = 'CSV';
export const KEY_CAMELIZED = _.camelCase(KEY);

// Database table page
const CSV_FETCH = `${KEY}_CSV_FETCH`;
const CSV_STATUS_UPDATE = `${KEY}_CSV_STATUS_UPDATE`;
const CSV_FETCH_CANCEL = `${KEY}_CSV_FETCH_CANCEL`;
const CSV_FETCH_FULFILLED = `${KEY}_CSV_FETCH_FULFILLED`;
const CSV_FETCH_REJECTED = `${KEY}_CSV_FETCH_REJECTED`;
const CSV_RESET = `${KEY}_CSV_RESET`;
const CSV_DELETE = `${KEY}_CSV_DELETE`;
const CURRENT_CSV = `${KEY}_CURRENT_CSV`;
const SET_CHECKBOX_SELECTION_ALL = `${KEY}_SET_CHECKBOX_SELECTION_ALL`;
const SET_CHECKBOX_SELECTION_INDIVIDUAL = `${KEY}_SET_CHECKBOX_SELECTION_INDIVIDUAL`;
const SET_TABLE_CHECKBOX_SELECTION_ALL = `${KEY}_SET_TABLE_CHECKBOX_SELECTION_ALL`;
const SET_TABLE_CHECKBOX_SELECTION_INDIVIDUAL = `${KEY}_SET_TABLE_CHECKBOX_SELECTION_INDIVIDUAL`;
const SHOW_UPLOAD_CSV_MODAL = `${KEY}_SHOW_UPLOAD_CSV_MODAL`;
const HIDE_UPLOAD_CSV_MODAL = `${KEY}_HIDE_UPLOAD_CSV_MODAL`;
const STORE_CSV_DOCUMENT_ID = `${KEY}_STORE_CSV_DOCUMENT_ID`;
const OPEN_TABLE_VIEW = `${KEY}_OPEN_TABLE_VIEW`;
const OPEN_TABLE_VIEW_FULFILLED = `${KEY}_OPEN_TABLE_VIEW_FULFILLED`;
const OPEN_TABLE_VIEW_REJECTED = `${KEY}_OPEN_TABLE_VIEW_REJECTED`;
const GET_UPDATED_TABLE_VIEW = `${KEY}_GET_UPDATED_TABLE_VIEW`;
const SET_DELETE_CSV_ROW = `${KEY}_SET_DELETE_CSV_ROW`;
const SET_FIELD_FOCUS = `${KEY}_SET_FIELD_FOCUS`;

export const actionTypes = {
  CSV_FETCH,
  CSV_FETCH_CANCEL,
  CSV_RESET,
  CSV_FETCH_FULFILLED,
  CSV_FETCH_REJECTED,
  CSV_STATUS_UPDATE,
  CSV_DELETE,
  CURRENT_CSV,
  SET_CHECKBOX_SELECTION_ALL,
  SET_CHECKBOX_SELECTION_INDIVIDUAL,
  SHOW_UPLOAD_CSV_MODAL,
  HIDE_UPLOAD_CSV_MODAL,
  STORE_CSV_DOCUMENT_ID,
  OPEN_TABLE_VIEW,
  OPEN_TABLE_VIEW_FULFILLED,
  OPEN_TABLE_VIEW_REJECTED,
  SET_TABLE_CHECKBOX_SELECTION_ALL,
  SET_TABLE_CHECKBOX_SELECTION_INDIVIDUAL,
  GET_UPDATED_TABLE_VIEW,
  SET_DELETE_CSV_ROW,
  SET_FIELD_FOCUS,
};

export const actions = {
  csvFetch: createAction(CSV_FETCH, (payload) => {
    if (!_.has(payload, 'showLoader')) {
      payload.showLoader = true;
    }
    return new Promise((resolve) => resolve(payload));
  }),

  csvDelete: createAction(CSV_DELETE, payloadPassthrough),
  setCurrentCSV: createAction(CURRENT_CSV, payloadPassthrough),
  setCheckBoxSelectionAll: createAction(
    SET_CHECKBOX_SELECTION_ALL,
    payloadPassthrough
  ),
  setCheckBoxSelectionIndividual: createAction(
    SET_CHECKBOX_SELECTION_INDIVIDUAL,
    payloadPassthrough
  ),
  setTableCheckBoxSelectionAll: createAction(
    SET_TABLE_CHECKBOX_SELECTION_ALL,
    payloadPassthrough
  ),
  setTableCheckBoxSelectionIndividual: createAction(
    SET_TABLE_CHECKBOX_SELECTION_INDIVIDUAL,
    payloadPassthrough
  ),
  showUploadCsvModal: createAction(SHOW_UPLOAD_CSV_MODAL, payloadPassthrough),
  hideUploadCsvModal: createAction(HIDE_UPLOAD_CSV_MODAL, payloadPassthrough),

  storeCSVDocumentId: createAction(STORE_CSV_DOCUMENT_ID, payloadPassthrough),
  openTableView: createAction(OPEN_TABLE_VIEW, payloadPassthrough),
  getUpdatedTableView: createAction(GET_UPDATED_TABLE_VIEW, payloadPassthrough),
  setDeleteCsvRow: createAction(SET_DELETE_CSV_ROW, payloadPassthrough),
  fieldFocus: createAction(SET_FIELD_FOCUS, payloadPassthrough),
};
