import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';

export const KEY = 'DOCUMENTS';
export const KEY_CAMELIZED = _.camelCase(KEY);

export const actionTypes = {
  OPEN_PREVIEW: `${KEY}_OPEN_PREVIEW`,
  CLOSE_PREVIEW: `${KEY}_CLOSE_PREVIEW`,
  UPDATE_DOC_DATA: `${KEY}_UPDATE_DOC_DATA`,
  UPDATE_ASSIGN_DATA: `${KEY}_UPDATE_ASSIGN_DATA`,
  UPDATE_REVIEW_DOC_DATA: `${KEY}_UPDATE_REVIEW_DOC_DATA`,
  DELETE_DOC: `${KEY}_DELETE_DOC`,
  DELETE_DOC_TYPE: `${KEY}_DELETE_DOC_TYPE`,
  DELETE_DOC_AFTER_CONFIRMATION: `${KEY}_DELETE_DOC_AFTER_CONFIRMATION`,
  DELETE_DOC_HIDE_CONFIRMATION: `${KEY}_DELETE_DOC_HIDE_CONFIRMATION`,
  DELETE_DOC_FULFILLED: `${KEY}_DELETE_DOC_FULFILLED`,
  DELETE_SPREADSHEET_DOC_FULFILLED: `${KEY}_DELETE_SPREADSHEET_DOC_FULFILLED`,
  DOCUMENT_FETCHING_STATUS: `${KEY}_DOCUMENT_FETCHING_STATUS`,
  SET_ALL_SELECTION_TYPE_WISE: `${KEY}_SET_ALL_SELECTION_TYPE_WISE`,
  SET_CHECK_SELECTION_TYPE_WISE: `${KEY}_SET_CHECK_SELECTION_TYPE_WISE`,
  STORE_CLICKED_FOLDER_INFO: `${KEY}_STORE_CLICKED_FOLDER_INFO`,
  STORE_CLICKED_FOLDER_INFO_FULLFIED: `${KEY}_STORE_CLICKED_FOLDER_INFO_FULLFIED`,
  SET_FOLDERID: `${KEY}_SET_FOLDERID`,
  STORE_CLICKED_FOLDER_ID: `${KEY}_STORE_CLICKED_FOLDER_ID`,
  STORE_SPLIT_DOCUMENT_ID: `${KEY}_STORE_SPLIT_DOCUMENT_ID`,
  STORE_ROOT_SPLIT_DOCUMENT_ID: `${KEY}_STORE_ROOT_SPLIT_DOCUMENT_ID`,
  HANDLE_SPREADSHEET_VIEW: `${KEY}_HANDLE_SPREADSHEET_VIEW`,
  UPDATE_REVIEW_DOCUMENT_ID: `${KEY}_UPDATE_REVIEW_DOCUMENT_ID`,
  UPDATE_EXCEL_REVIEW_DOCUMENT_ID: `${KEY}_UPDATE_EXCEL_REVIEW_DOCUMENT_ID`,
  SHOW_ANALYTICS: `${KEY}_SHOW_ANALYTICS`,
  HIDE_ANALYTICS: `${KEY}_HIDE_ANALYTICS`,
  SET_ANALYTICS: `${KEY}_SET_ANALYTICS`,
  REJECT_ANALYTICS: `${KEY}_REJECT_ANALYTICS`,
  CHANGE_ANALYTICS: `${KEY}_CHANGE_ANALYTICS`,

  // Global document count
  DOCUMENT_COUNTS_FETCH: `${KEY}_DOCUMENT_COUNTS_FETCH`,
  DOCUMENT_COUNTS_FETCH_FULFILLED: `${KEY}_DOCUMENT_COUNTS_FETCH_FULFILLED`,
  DOCUMENT_COUNTS_FETCH_REJECTED: `${KEY}_DOCUMENT_COUNTS_FETCH_REJECTED`,
  SET_DOCUMENT_COUNTS: `${KEY}_SET_DOCUMENT_COUNTS`,

  // All documents page
  ALL_DOCUMENTS_FETCH: `${KEY}_ALL_DOCUMENTS_FETCH`,
  ALL_DOCUMENTS_FETCH_CANCEL: `${KEY}_ALL_DOCUMENTS_FETCH_CANCEL`,
  ALL_DOCUMENTS_FETCH_FULFILLED: `${KEY}_ALL_DOCUMENTS_FETCH_FULFILLED`,
  DOCTYPE_DOCUMENTS_FULFILLED: `${KEY}_DOCTYPE_DOCUMENTS_FULFILLED`,
  ALL_DOCUMENTS_FETCH_REJECTED: `${KEY}_ALL_DOCUMENTS_FETCH_REJECTED`,
  ALL_DOCUMENTS_RESET: `${KEY}_ALL_DOCUMENTS_RESET`,

  // Document type page
  ALL_DOCUMENTS_TYPE_FETCH: `${KEY}_ALL_DOCUMENTS_TYPE_FETCH`,
  NEW_DOCUMENTS_TYPE: `${KEY}_NEW_DOCUMENTS_TYPE`,
  ALL_DOCUMENTS_TYPE_FETCH_FULFILLED: `${KEY}_ALL_DOCUMENTS_TYPE_FETCH_FULFILLED`,
  ALL_DOCUMENTS_TYPE_FETCH_REJECTED: `${KEY}_ALL_DOCUMENTS_TYPE_FETCH_REJECTED`,
  ALL_DOCUMENTS_TYPE_FETCH_CANCEL: `${KEY}_ALL_DOCUMENTS_TYPE_FETCH_CANCEL`,
  DUPLICATE_DOCUMENT_TYPE_FETCH: `${KEY}_DUPLICATE_DOCUMENT_TYPE_FETCH`,
  UPDATE_DOCUMENT_TYPE: `${KEY}_UPDATE_DOCUMENT_TYPE`,
  UPLOAD_DOCUMENT_TYPE_CONFIRMATION: `${KEY}_UPLOAD_DOCUMENT_TYPE_CONFIRMATION`,
  UPLOAD_DOCUMENT_TYPE_HIDE_CONFIRMATION: `${KEY}_UPLOAD_DOCUMENT_TYPE_HIDE_CONFIRMATION`,
  SETTING_DOCUMENT_TYPE_CONFIRMATION: `${KEY}_SETTING_DOCUMENT_TYPE_CONFIRMATION`,
  SETTING_DOCUMENT_TYPE_CONFIRMATION_FULFILLED: `${KEY}_SETTING_DOCUMENT_TYPE_CONFIRMATION_FULFILLED`,
  SETTING_DOCUMENT_TYPE_CONFIRMATION_CANCEL: `${KEY}_SETTING_DOCUMENT_TYPE_CONFIRMATION_CANCEL`,
  DOWNLOAD_DOCUMENT_CONFIRMATION: `${KEY}DOWNLOAD_DOCUMENT_CONFIRMATION`,
  DOWNLOAD_DOCUMENT_TYPE_HIDE_CONFIRMATION: `${KEY}_DOWNLOAD_DOCUMENT_TYPE_HIDE_CONFIRMATION`,
  SHOW_ALERT_MODAL: `${KEY}_SHOW_ALERT_MODAL`,
  HIDE_ALERT_MODAL: `${KEY}_HIDE_ALERT_MODAL`,
  ALL_DOCUMENTS_TYPE_RESET: `${KEY}_ALL_DOCUMENTS_TYPE_RESET`,
  DOCUMENTS_TYPES_DYNAMIC_FETCH: `${KEY}_TYPES_DYNAMIC_FETCH`,
  DOCUMENTS_TYPES_DYNAMIC_FULFILLED: `${KEY}_TYPES_DYNAMIC_FULFILLED`,
  DOCUMENTS_TYPES_DYNAMIC_ERROR: `${KEY}_TYPES_DYNAMIC_ERROR`,

  // Document type modal
  DISPLAY_SELECT_DOCUMENT_TYPE_MODAL: `${KEY}_DISPLAY_SELECT_DOCUMENT_TYPE_MODAL`,
  DISPLAY_CREATE_DOCUMENT_TYPE_MODAL: `${KEY}_DISPLAY_CREATE_DOCUMENT_TYPE_MODAL`,
  SELECT_DOCUMENT_TYPE: `${KEY}_SELECT_DOCUMENT_TYPE`,
  SELECTED_MODEL_HUB: `${KEY}_SELECTED_MODEL_HUB`,

  // auto classify
  DISPLAY_AUTO_CLASSIFY_MODAL: `${KEY}_DISPLAY_AUTO_CLASSIFY_MODAL`,
  REVIEW_DOCUMENTS_FETCH: `${KEY}_REVIEW_DOCUMENTS_FETCH`,
  REVIEW_DOCUMENTS_FETCH_CANCEL: `${KEY}_REVIEW_DOCUMENTS_FETCH_CANCEL`,
  REVIEW_DOCUMENTS_FETCH_FULFILLED: `${KEY}_REVIEW_DOCUMENTS_FETCH_FULFILLED`,
  REVIEW_DOCUMENTS_FETCH_REJECTED: `${KEY}_REVIEW_DOCUMENTS_FETCH_REJECTED`,
  REVIEW_DOCUMENTS_RESET: `${KEY}_REVIEW_DOCUMENTS_RESET`,
  SKIPPED_DOCUMENTS_FETCH: `${KEY}_SKIPPED_DOCUMENTS_FETCH`,
  SKIPPED_DOCUMENTS_FETCH_CANCEL: `${KEY}_SKIPPED_DOCUMENTS_FETCH_CANCEL`,
  SKIPPED_DOCUMENTS_FETCH_FULFILLED: `${KEY}_SKIPPED_DOCUMENTS_FETCH_FULFILLED`,
  SKIPPED_DOCUMENTS_FETCH_REJECTED: `${KEY}_SKIPPED_DOCUMENTS_FETCH_REJECTED`,
  SKIPPED_DOCUMENTS_RESET: `${KEY}_SKIPPED_DOCUMENTS_RESET`,
  PROCESSED_DOCUMENTS_FETCH: `${KEY}_PROCESSED_DOCUMENTS_FETCH`,
  PROCESSED_DOCUMENTS_FETCH_CANCEL: `${KEY}_PROCESSED_DOCUMENTS_FETCH_CANCEL`,
  PROCESSED_DOCUMENTS_FETCH_FULFILLED: `${KEY}_PROCESSED_DOCUMENTS_FETCH_FULFILLED`,
  PROCESSED_DOCUMENTS_FETCH_REJECTED: `${KEY}_PROCESSED_DOCUMENTS_FETCH_REJECTED`,
  PROCESSED_DOCUMENTS_RESET: `${KEY}_PROCESSED_DOCUMENTS_RESET`,

  //Excel View Tool
  RT_START_EXCEL_VIEW: `${KEY}_RT_START_EXCEL_VIEW`,
  RT_START_EXCEL_VIEW_FULFILLED: `${KEY}_RT_START_EXCEL_VIEW_FULFILLED`,
  RT_START_EXCEL_VIEW_REJECTED: `${KEY}_RT_START_EXCEL_VIEW_REJECTED`,
  RT_START_SINGLE_EXCEL_VIEW: `${KEY}_RT_START_SINGLE_EXCEL_VIEW`,
  RT_EXCEL_DOCUMENT_DATA_FETCH: `${KEY}_RT_EXCEL_DOCUMENT_DATA_FETCH`,
  RT_EXCEL_DOCUMENT_DATA_FETCH_FULFILLED: `${KEY}_RT_EXCEL_DOCUMENT_DATA_FETCH_FULFILLED`,
  RT_EXCEL_DOCUMENT_DATA_FETCH_REJECTED: `${KEY}_RT_EXCEL_DOCUMENT_DATA_FETCH_REJECTED`,
  RT_START_DOCUMENT_EXCEL_VIEW: `${KEY}_RT_START_DOCUMENT_EXCEL_VIEW`,
  RT_START_DOCUMENT_EXCEL_VIEW_FULFILLED: `${KEY}_RT_START_DOCUMENT_EXCEL_VIEW_FULFILLED`,
  RT_START_DOCUMENT_EXCEL_VIEW_REJECTED: `${KEY}_RT_START_DOCUMENT_EXCEL_VIEW_REJECTED`,
  RT_SAVE_SPREADSHEET_FULFILLED: `${KEY}_RT_SAVE_SPREADSHEET_FULFILLED`,
  RT_SAVE_SPREADSHEET_REJECTED: `${KEY}_RT_SAVE_SPREADSHEET_REJECTED`,
  RT_FINISH_DOCUMENT_EXCEL_VIEW: `${KEY}_RT_FINISH_DOCUMENT_EXCEL_VIEW`,
  RT_FINISH_DOCUMENT_EXCEL_VIEW_FULFILLED: `${KEY}_RT_FINISH_DOCUMENT_EXCEL_VIEW_FULFILLED`,
  RT_FINISH_DOCUMENT_EXCEL_VIEW_REJECTED: `${KEY}_RT_FINISH_DOCUMENT_EXCEL_VIEW_REJECTED`,
  RT_FORCE_FINISH_DOCUMENT_EXCEL_VIEW: `${KEY}_RT_FORCE_FINISH_DOCUMENT_EXCEL_VIEW`,
  RT_FORCE_FINISH_DOCUMENT_EXCEL_VIEW_FULFILLED: `${KEY}_RT_FORCE_FINISH_DOCUMENT_EXCEL_VIEW_FULFILLED`,
  RT_FORCE_FINISH_DOCUMENT_EXCEL_VIEW_REJECTED: `${KEY}_RT_FORCE_FINISH_DOCUMENT_EXCEL_VIEW_REJECTED`,
  RT_SKIP_DOCUMENT_EXCEL_VIEW: `${KEY}_RT_SKIP_DOCUMENT_EXCEL_VIEW`,
  RT_SKIP_DOCUMENT_EXCEL_VIEW_FULFILLED: `${KEY}_RT_SKIP_DOCUMENT_EXCEL_VIEW_FULFILLED`,
  RT_SKIP_DOCUMENT_EXCEL_VIEW_REJECTED: `${KEY}_RT_SKIP_DOCUMENT_EXCEL_VIEW_REJECTED`,

  //Updated Summary
  GET_UPDATED_SUMMARY: `${KEY}_GET_UPDATED_SUMMARY`,
  GET_UPDATED_SUMMARY_FULFILLED: `${KEY}_GET_UPDATED_SUMMARY_FULFILLED`,
  GET_UPDATED_SUMMARY_REJECTED: `${KEY}_GET_UPDATED_SUMMARY_REJECTED`,

  //reset review tool
  RT_RESET_REVIEW_TOOL: `${KEY}_RT_RESET_REVIEW_TOOL`,
  RESET_EDIT_DOC_ID: `${KEY}_RESET_EDIT_DOC_DOC`,

  // Review Tool
  RT_START_REVIEW: `${KEY}_RT_START_REVIEW`,
  RT_UPDATE_REVIEW: `${KEY}_RT_UPDATE_REVIEW`,
  RT_DOCUMENT_SET_SEARCH_BBOX: `${KEY}_RT_DOCUMENT_SET_SEARCH_BBOX`,
  RT_DOCUMENT_SEARCH_DATA_FETCH: `${KEY}_RT_DOCUMENT_SEARCH_DATA_FETCH`,
  RT_START_SINGLE_REVIEW: `${KEY}_RT_START_SINGLE_REVIEW`,
  RT_START_EDITFIELD: `${KEY}_RT_START_EDITFIELD`,
  UPDATE_DOC_ID: `${KEY}_UPDATE_DOC_ID`,
  UPDATE_DOC_ID_FULFILLED: `${KEY}_UPDATE_DOC_ID_FULFILLED`,
  RT_START_REVIEW_FULFILLED: `${KEY}_RT_START_REVIEW_FULFILLED`,
  RT_UPDATE_REVIEW_FULFILLED: `${KEY}_RT_UPDATE_REVIEW_FULFILLED`,
  RT_START_EDITFIELD_FULFILLED: `${KEY}_RT_START_EDITFIELD_FULFILLED`,
  RT_FETCH_FILTER_FULFILLED: `${KEY}_RT_FETCH_FILTER_FULFILLED`,
  RT_START_EDITFIELD_REJECTED: `${KEY}_RT_START_EDITFIELD_REJECTED`,
  RT_START_REVIEW_REJECTED: `${KEY}_RT_START_REVIEW_REJECTED`,
  RT_HANDLE_GRID_DRAG: `${KEY}_RT_HANDLE_GRID_DRAG`,
  RT_DATA_FETCH_ERROR: `${KEY}_RT_DATA_FETCH_ERROR`,
  HANDLE_GRID_DRAG: `${KEY}_HANDLE_GRID_DRAG`,
  RT_DOCUMENT_DATA_FETCH: `${KEY}_RT_DOCUMENT_DATA_FETCH`,
  RT_DOCUMENT_DATA_LOAD_FETCH: `${KEY}_RT_DOCUMENT_DATA_LOAD_FETCH`,
  RT_DOCUMENT_DATA_LOAD_FETCH_FULFILLED: `${KEY}_RT_DOCUMENT_DATA_LOAD_FETCH_FULFILLED`,
  RT_DOCUMENT_DATA_FETCH_FULFILLED: `${KEY}_RT_DOCUMENT_DATA_FETCH_FULFILLED`,
  RT_DOCUMENT_DATA_FETCH_REJECTED: `${KEY}_RT_DOCUMENT_DATA_FETCH_REJECTED`,
  RT_START_DOCUMENT_REVIEW: `${KEY}_RT_START_DOCUMENT_REVIEW`,
  RT_START_DOCUMENT_REVIEW_FULFILLED: `${KEY}_RT_START_DOCUMENT_REVIEW_FULFILLED`,
  RT_START_DOCUMENT_REVIEW_REJECTED: `${KEY}_RT_START_DOCUMENT_REVIEW_REJECTED`,
  RT_FINISH_DOCUMENT_REVIEW: `${KEY}_RT_FINISH_DOCUMENT_REVIEW`,
  RT_FINISH_DOCUMENT_REVIEW_FULFILLED: `${KEY}_RT_FINISH_DOCUMENT_REVIEW_FULFILLED`,
  RT_FINISH_DOCUMENT_REVIEW_REJECTED: `${KEY}_RT_FINISH_DOCUMENT_REVIEW_REJECTED`,
  RT_FORCE_FINISH_DOCUMENT_REVIEW: `${KEY}_RT_FORCE_FINISH_DOCUMENT_REVIEW`,
  RT_FORCE_FINISH_DOCUMENT_REVIEW_FULFILLED: `${KEY}_RT_FORCE_FINISH_DOCUMENT_REVIEW_FULFILLED`,
  RT_FORCE_FINISH_DOCUMENT_REVIEW_REJECTED: `${KEY}_RT_FORCE_FINISH_DOCUMENT_REVIEW_REJECTED`,
  RT_SKIP_DOCUMENT_REVIEW: `${KEY}_RT_SKIP_DOCUMENT_REVIEW`,
  RT_SKIP_DOCUMENT_REVIEW_FULFILLED: `${KEY}_RT_SKIP_DOCUMENT_REVIEW_FULFILLED`,
  RT_SKIP_DOCUMENT_REVIEW_REJECTED: `${KEY}_RT_SKIP_DOCUMENT_REVIEW_REJECTED`,
  RT_REMOVE_DOCUMENT_FROM_STACK: `${KEY}_RT_REMOVE_DOCUMENT_FROM_STACK`,
  RT_REMOVE_SPREADSHEET_FROM_STACK: `${KEY}_RT_REMOVE_SPREADSHEET_FROM_STACK`,
  RT_GO_TO_DOCUMENT: `${KEY}_RT_GO_TO_DOCUMENT`,
  RT_GO_TO_EXCEL_DOCUMENT: `${KEY}_RT_GO_TO_EXCEL_DOCUMENT`,
  RT_SET_SELECTED_FIELD_ID: `${KEY}_RT_SET_SELECTED_FIELD_ID`,
  RT_UPDATE_FIELD_DATA: `${KEY}_RT_UPDATE_FIELD_DATA`,
  RT_UPDATE_FIELD_VALUE: `${KEY}_RT_UPDATE_FIELD_VALUE`,
  RT_FIELD_DATA_PERSISTANCE_START: `${KEY}_RT_FIELD_DATA_PERSISTANCE_START`,
  RT_FIELD_DATA_PERSISTANCE_FULFILLED: `${KEY}_RT_FIELD_DATA_PERSISTANCE_FULFILLED`,
  RT_REAL_TIME_UPDATE: `${KEY}_RT_REAL_TIME_UPDATE`,
  RT_REAL_TIME_UPDATE_FULFILLED: `${KEY}_RT_REAL_TIME_UPDATE_FULFILLED`,
  RT_FIELD_DATA_PERSISTANCE_REJECTED: `${KEY}_RT_FIELD_DATA_PERSISTANCE_REJECTED`,
  RT_LINE_ITEMS_ADD_LINE: `${KEY}_RT_LINE_ITEMS_ADD_LINE`,
  RT_LINE_ITEMS_ADD_LINE_FULFILLED: `${KEY}_RT_LINE_ITEMS_ADD_LINE_FULFILLED`,
  RT_LINE_ITEMS_ADD_LINE_REJECTED: `${KEY}_RT_LINE_ITEMS_ADD_LINE_REJECTED`,
  RT_LINE_ITEMS_MANAGE_GRID: `${KEY}_RT_LINE_ITEMS_MANAGE_GRID`,
  RT_LINE_ITEMS_MANAGE_GRID_FULFILLED: `${KEY}_RT_LINE_ITEMS_MANAGE_GRID_FULFILLED`,
  RT_LINE_ITEMS_MANAGE_GRID_REJECTED: `${KEY}_RT_LINE_ITEMS_MANAGE_GRID_REJECTED`,
  RT_LINE_ITEMS_EXTRACT_GRID_DATA: `${KEY}_RT_LINE_ITEMS_EXTRACT_GRID_DATA`,
  RT_LINE_ITEMS_EXTRACT_GRID_DATA_FULFILLED: `${KEY}_RT_LINE_ITEMS_EXTRACT_GRID_DATA_FULFILLED`,
  RT_LINE_ITEMS_EXTRACT_GRID_DATA_REJECTED: `${KEY}_RT_LINE_ITEMS_EXTRACT_GRID_DATA_REJECTED`,
  RT_LINE_ITEMS_ADD_SIMILAR_LINES: `${KEY}_RT_LINE_ITEMS_ADD_SIMILAR_LINES`,
  RT_LINE_ITEMS_ADD_SIMILAR_LINES_START: `${KEY}_RT_LINE_ITEMS_ADD_SIMILAR_LINES_START`,
  RT_LINE_ITEMS_ADD_SIMILAR_LINES_FULFILLED: `${KEY}_RT_LINE_ITEMS_ADD_SIMILAR_LINES_FULFILLED`,
  RT_LINE_ITEMS_ADD_SIMILAR_LINES_REJECTED: `${KEY}_RT_LINE_ITEMS_ADD_SIMILAR_LINES_REJECTED`,
  RT_LINE_ITEMS_DELETE_ROW: `${KEY}_RT_LINE_ITEMS_DELETE_ROW`,
  RT_LINE_ITEMS_DELETE_ALL_ROWS: `${KEY}_RT_LINE_ITEMS_DELETE_ALL_ROWS`,
  RT_LINE_ITEMS_DELETE_ALL_ROWS_FULFILLED: `${KEY}_RT_LINE_ITEMS_DELETE_ALL_ROWS_FULFILLED`,
  RT_LINE_ITEMS_DELETE_ALL_ROWS_REJECTED: `${KEY}_RT_LINE_ITEMS_DELETE_ALL_ROWS_REJECTED`,
  ADD_SEARCH_QUERY: `${KEY}_ADD_SEARCH_QUERY`,
  RT_LINE_ITEMS_DELETE_FIELDS: `${KEY}_RT_LINE_ITEMS_DELETE_FIELDS`,
  RT_LINE_ITEMS_DELETE_FIELDS_FULFILLED: `${KEY}_RT_LINE_ITEMS_DELETE_FIELDS_FULFILLED`,
  RT_LINE_ITEMS_DELETE_FIELDS_REJECTED: `${KEY}_RT_LINE_ITEMS_DELETE_FIELDS_REJECTED`,
  RT_LINE_ITEMS_UPDATE_CHILDREN: `${KEY}_RT_LINE_ITEMS_UPDATE_CHILDREN`,

  //Edit Fields
  RT_SECTIONS_ADD_SECTION: `${KEY}_RT_SECTIONS_ADD_SECTION`,
  RT_SECTIONS_ADD_FIELD: `${KEY}_RT_SECTIONS_ADD_FIELD`,
  RT_SECTIONS_UPDATE_DATA: `${KEY}_RT_SECTIONS_UPDATE_DATA`,
  RT_SECTIONS_DELETE: `${KEY}_RT_SECTIONS_DELETE`,
  RT_SECTIONS_DELETE_FIELD: `${KEY}_RT_SECTIONS_DELETE_FIELD`,
  RT_SECTIONS_UPDATE_SECTION: `${KEY}_RT_SECTIONS_UPDATE_SECTION`,
  RT_SECTIONS_UPDATE_FIELDS_BY_ID: `${KEY}_RT_SECTIONS_UPDATE_FIELDS_BY_ID`,
  RT_FOOTER_ADD_COLUMNS: `${KEY}_RT_FOOTER_ADD_COLUMNS`,
  RT_SHOW_FILTER_MODAL: `${KEY}_RT_SHOW_FILTER_MODAL`,
  RT_FETCH_EDITFIELD_FILTER_LOADING: `${KEY}_RT_FETCH_EDITFIELD_FILTER_LOADING`,
  RT_FETCH_EDITFIELD_FILTER_FULFILLED: `${KEY}_RT_FETCH_EDITFIELD_FILTER_FULFILLED`,
  RT_HIDE_FILTER_MODAL: `${KEY}_RT_HIDE_FILTER_MODAL`,
  RT_ADDITIONAL_FILTER: `${KEY}_RT_ADDITIONAL_FILTER`,
  RT_SET_FIELD_FILTER: `${KEY}_RT_SET_FIELD_FILTER`,
  RT_SET_EDIT_FILTER: `${KEY}_RT_SET_EDIT_FILTER`,
  RT_DROP_DOWN_FETCH: `${KEY}_RT_DROP_DOWN_FETCH`,
  RT_DROP_DOWN_FETCH_FULLFILLED: `${KEY}_RT_DROP_DOWN_FETCH_FULLFILLED`,
  RT_DROP_DOWN_MAP_FETCH: `${KEY}_RT_DROP_DOWN_MAP_FETCH`,
  RT_DROP_DOWN_MAP_FETCH_FULLFILLED: `${KEY}_RT_DROP_DOWN_MAP_FETCH_FULLFILLED`,
  RT_DROP_DOWN_SORT_WITH_GRID_HEADER: `${KEY}_RT_DROP_DOWN_SORT_WITH_GRID_HEADER`,
  RT_UPDATE_GRID_DATA: `${KEY}_RT_UPDATE_GRID_DATA`,
  RT_EXTRACT_SIMILAR_TABLES: `${KEY}_RT_EXTRACT_SIMILAR_TABLES`,
  RT_EXTRACT_SIMILAR_TABLES_FULFILLED: `${KEY}_RT_EXTRACT_SIMILAR_TABLES_FULFILLED`,
  RT_EXTRACT_SIMILAR_TABLES_REJECTED: `${KEY}_RT_EXTRACT_SIMILAR_TABLES_REJECTED`,
  RT_LINE_ITEM_DROP_DOWN_FETCH: `${KEY}_RT_LINE_ITEM_DROP_DOWN_FETCH`,
  RT_LINE_ITEM_DROP_DOWN_FETCH_FULLFILLED: `${KEY}_RT_LINE_ITEM_DROP_DOWN_FETCH_FULLFILLED`,
  RT_CHANGE_SETTING: `${KEY}_RT_CHANGE_SETTING`,
  RT_SET_SETTING_DATA: `${KEY}_RT_SET_SETTING_DATA`,
  RT_RETRY_VALIDATION: `${KEY}_RT_RETRY_VALIDATION`,
  CHANGE_AUTO_CLASSIFY_STATUS: `${KEY}_CHANGE_AUTO_CLASSIFY_STATUS`,
  RT_STANDARD_FILTER: `${KEY}_RT_STANDARD_FILTER`,
  RT_SET_STANDARD_FILTER: `${KEY}_RT_SET_STANDARD_FILTER`,
  SET_EDIT_DOC_ID: `${KEY}_SET_EDIT_DOC_ID`,
  UPDATE_DOC_NAME: `${KEY}_UPDATE_DOC_NAME`,
  RT_SET_COPIED_PAGE: `${KEY}_RT_SET_COPIED_PAGE`,
  UPDATE_DOCUMENT_TYPE_STATUS: `${KEY}_UPDATE_DOCUMENT_TYPE_STATUS`,
  RT_SHOW_FIRST_REVIEW_COMPLETE_MODAL: `${KEY}_RT_SHOW_FIRST_REVIEW_COMPLETE_MODAL`,
  UPLOAD_SAMPLE_DOC_TYPE: `${KEY}_UPLOAD_SAMPLE_DOC_TYPE`,
  SET_HIGHLIGHTED_DOCUMENT_TYPE: `${KEY}_SET_HIGHLIGHTED_DOCUMENT_TYPE`,
  UPDATE_REVIEW_DOCUMENTS_CHATAI_BBOXES: `${KEY}_UPDATE_REVIEW_DOCUMENTS_CHATAI_BBOXES`,
  SET_ACTIVE_SIDEBAR_TAB: `${KEY}_SET_ACTIVE_SIDEBAR_TAB`,

  CHANGE_FIELD_ORDER: `${KEY}_CHANGE_FIELD_ORDER`,
  CHANGE_FIELD_ORDER_FULFILLED: `${KEY}_CHANGE_FIELD_ORDER_FULFILLED`,
  CHANGE_FIELD_ORDER_REJECTED: `${KEY}_CHANGE_FIELD_ORDER_REJECTED`,

  CHANGE_FIELD_VISIBILITY: `${KEY}_CHANGE_FIELD_VISIBILITY`,
  CHANGE_FIELD_VISIBILITY_FULFILLED: `${KEY}_CHANGE_FIELD_VISIBILITY_FULFILLED`,
  CHANGE_FIELD_VISIBILITY_REJECTED: `${KEY}_CHANGE_FIELD_VISIBILITY_REJECTED`,

  CHANGE_FIELD_TYPE: `${KEY}_CHANGE_FIELD_TYPE`,
  CHANGE_FIELD_TYPE_FULFILLED: `${KEY}_CHANGE_FIELD_TYPE_FULFILLED`,
  CHANGE_FIELD_TYPE_REJECTED: `${KEY}_CHANGE_FIELD_TYPE_REJECTED`,

  SET_LOADING_FIELD_ID: `${KEY}_SET_LOADING_FIELD_ID`,
  RESET_LOADING_FIELD_ID: `${KEY}_RESET_LOADING_FIELD_ID`,

  SET_EDIT_FIELD_CHANGES: `${KEY}_SET_EDIT_FIELD_CHANGES`,

  CHANGE_DATA_TYPE_FROM_SETTINGS_POPUP: `${KEY}_CHANGE_DATA_TYPE_FROM_SETTINGS_POPUP`,

  UPDATE_COLLAPSED_SECTION_IDS: `${KEY}_UPDATE_COLLAPSED_SECTION_IDS`,
  UPDATE_DISPLAY_LABEL: `${KEY}_UPDATE_DISPLAY_LABEL`,
  RT_SET_CURRENT_GRID_ID: `${KEY}_RT_SET_CURRENT_GRID_ID`,
  CUSTOM_DOCTYPE_EDITFIELD_FLOW: `${KEY}_CUSTOM_DOCTYPE_EDITFIELD_FLOW`,

  TOGGLE_FOOTER_EMPTY_COLUMN_VISIBILITY: `${KEY}_TOGGLE_FOOTER_EMPTY_COLUMN_VISIBILITY`,
};

export const actions = {
  openPreview: createAction(actionTypes.OPEN_PREVIEW, payloadPassthrough),

  closePreview: createAction(actionTypes.CLOSE_PREVIEW, payloadPassthrough),

  updateDocData: createAction(
    actionTypes.UPDATE_DOC_DATA,
    payloadPassthrough,
    payloadPassthrough
  ),
  updateAssignData: createAction(
    actionTypes.UPDATE_ASSIGN_DATA,
    payloadPassthrough
  ),

  updateReviewDocData: createAction(
    actionTypes.UPDATE_REVIEW_DOC_DATA,
    payloadPassthrough,
    payloadPassthrough
  ),

  deleteDoc: createAction(actionTypes.DELETE_DOC, payloadPassthrough),

  deleteDocAfterConfirmation: createAction(
    actionTypes.DELETE_DOC_AFTER_CONFIRMATION,
    payloadPassthrough
  ),

  deleteDocHideConfirmation: createAction(
    actionTypes.DELETE_DOC_HIDE_CONFIRMATION,
    payloadPassthrough
  ),

  deleteDocFulfilled: createAction(
    actionTypes.DELETE_DOC_FULFILLED,
    payloadPassthrough
  ),
  deleteSpreadsheetFulfilled: createAction(
    actionTypes.DELETE_SPREADSHEET_DOC_FULFILLED,
    payloadPassthrough
  ),

  fetchDocumentCounts: createAction(
    actionTypes.DOCUMENT_COUNTS_FETCH,
    payloadPassthrough
  ),

  displaySelectDocumentTypeModal: createAction(
    actionTypes.DISPLAY_SELECT_DOCUMENT_TYPE_MODAL,
    payloadPassthrough
  ),
  selectedService: createAction(
    actionTypes.SELECTED_MODEL_HUB,
    payloadPassthrough
  ),

  displayAutoClassifyModal: createAction(
    actionTypes.DISPLAY_AUTO_CLASSIFY_MODAL,
    payloadPassthrough
  ),

  displayCreateDocumentTypeModal: createAction(
    actionTypes.DISPLAY_CREATE_DOCUMENT_TYPE_MODAL,
    payloadPassthrough
  ),

  selectDocumentType: createAction(
    actionTypes.SELECT_DOCUMENT_TYPE,
    payloadPassthrough
  ),

  updateSummary: createAction(
    actionTypes.GET_UPDATED_SUMMARY,
    payloadPassthrough
  ),

  setDocumentCounts: createAction(
    actionTypes.SET_DOCUMENT_COUNTS,
    payloadPassthrough
  ),

  allDocumentsFetch: createAction(
    actionTypes.ALL_DOCUMENTS_FETCH,
    (payload) => {
      if (!_.has(payload, 'showLoader')) {
        payload.showLoader = true;
      }
      return new Promise((resolve) => resolve(payload));
    }
  ),

  allDocumentsReset: createAction(
    actionTypes.ALL_DOCUMENTS_RESET,
    payloadPassthrough
  ),
  createDocTypeData: createAction(
    actionTypes.NEW_DOCUMENTS_TYPE,
    payloadPassthrough
  ),
  allDocumentsTypeFetch: createAction(
    actionTypes.ALL_DOCUMENTS_TYPE_FETCH,
    (payload) => {
      if (payload && !_.has(payload, 'showLoader')) {
        payload.showLoader = true;
      }
      return new Promise((resolve) => resolve(payload));
    }
  ),

  allDocumentsTypeFetchFullfilled: createAction(
    actionTypes.ALL_DOCUMENTS_TYPE_FETCH_FULFILLED,
    payloadPassthrough
  ),

  fetchDynamicDocumentTypes: createAction(
    actionTypes.DOCUMENTS_TYPES_DYNAMIC_FETCH,
    payloadPassthrough
  ),
  duplicateDocumentType: createAction(
    actionTypes.DUPLICATE_DOCUMENT_TYPE_FETCH,
    payloadPassthrough
  ),
  updateDocumentType: createAction(
    actionTypes.UPDATE_DOCUMENT_TYPE,
    payloadPassthrough
  ),
  uploadDocumentTypeConfirmation: createAction(
    actionTypes.UPLOAD_DOCUMENT_TYPE_CONFIRMATION,
    payloadPassthrough
  ),
  uploadDocTypeHideConfirmation: createAction(
    actionTypes.UPLOAD_DOCUMENT_TYPE_HIDE_CONFIRMATION,
    payloadPassthrough
  ),
  settingDocTypeConfirmation: createAction(
    actionTypes.SETTING_DOCUMENT_TYPE_CONFIRMATION,
    payloadPassthrough
  ),
  downloadDocConfirmation: createAction(
    actionTypes.DOWNLOAD_DOCUMENT_CONFIRMATION,
    payloadPassthrough
  ),
  downloadDocTypeHideConfirmation: createAction(
    actionTypes.DOWNLOAD_DOCUMENT_TYPE_HIDE_CONFIRMATION,
    payloadPassthrough
  ),
  showAlertModal: createAction(
    actionTypes.SHOW_ALERT_MODAL,
    payloadPassthrough
  ),
  docHideAlertModal: createAction(
    actionTypes.HIDE_ALERT_MODAL,
    payloadPassthrough
  ),
  allDocumentsTypeReset: createAction(
    actionTypes.ALL_DOCUMENTS_TYPE_RESET,
    payloadPassthrough
  ),

  searchDocumentBbox: createAction(
    actionTypes.RT_DOCUMENT_SEARCH_DATA_FETCH,
    payloadPassthrough
  ),

  searchDocumentBboxEmpty: createAction(
    actionTypes.RT_DOCUMENT_SET_SEARCH_BBOX,
    payloadPassthrough
  ),

  reviewDocumentsFetch: createAction(
    actionTypes.REVIEW_DOCUMENTS_FETCH,
    (payload) => {
      if (!_.has(payload, 'showLoader')) {
        payload.showLoader = true;
      }
      return new Promise((resolve) => resolve(payload));
    }
  ),

  reviewDocumentsReset: createAction(
    actionTypes.REVIEW_DOCUMENTS_RESET,
    payloadPassthrough
  ),

  skippedDocumentsFetch: createAction(
    actionTypes.SKIPPED_DOCUMENTS_FETCH,
    (payload) => {
      if (!_.has(payload, 'showLoader')) {
        payload.showLoader = true;
      }
      return new Promise((resolve) => resolve(payload));
    }
  ),

  skippedDocumentsReset: createAction(
    actionTypes.SKIPPED_DOCUMENTS_RESET,
    payloadPassthrough
  ),

  processedDocumentsFetch: createAction(
    actionTypes.PROCESSED_DOCUMENTS_FETCH,
    (payload) => {
      if (!_.has(payload, 'showLoader')) {
        payload.showLoader = true;
      }
      return new Promise((resolve) => resolve(payload));
    }
  ),

  processedDocumentsReset: createAction(
    actionTypes.PROCESSED_DOCUMENTS_RESET,
    payloadPassthrough
  ),

  rtStartReview: createAction(actionTypes.RT_START_REVIEW, payloadPassthrough),

  updateReview: createAction(actionTypes.RT_UPDATE_REVIEW, payloadPassthrough),

  rtStartExcelView: createAction(
    actionTypes.RT_START_EXCEL_VIEW,
    payloadPassthrough
  ),

  rtStartSignleReview: createAction(
    actionTypes.RT_START_SINGLE_REVIEW,
    payloadPassthrough
  ),

  rtStartSingleExcelview: createAction(
    actionTypes.RT_START_SINGLE_EXCEL_VIEW,
    payloadPassthrough
  ),

  rtGoToDocument: createAction(
    actionTypes.RT_GO_TO_DOCUMENT,
    payloadPassthrough
  ),
  rtGoToExcelDocument: createAction(
    actionTypes.RT_GO_TO_EXCEL_DOCUMENT,
    payloadPassthrough
  ),

  rtRemoveDocumentFromStack: createAction(
    actionTypes.RT_REMOVE_DOCUMENT_FROM_STACK,
    payloadPassthrough
  ),
  rtRemoveSpreadsheetFromStack: createAction(
    actionTypes.RT_REMOVE_SPREADSHEET_FROM_STACK,
    payloadPassthrough
  ),

  rtGetDocumentData: createAction(
    actionTypes.RT_DOCUMENT_DATA_FETCH,
    payloadPassthrough
  ),

  rtGetLoadDocumentData: createAction(
    actionTypes.RT_DOCUMENT_DATA_LOAD_FETCH,
    payloadPassthrough
  ),

  rtGetExcelDocumentData: createAction(
    actionTypes.RT_EXCEL_DOCUMENT_DATA_FETCH,
    payloadPassthrough
  ),

  rtStartDocumentReview: createAction(
    actionTypes.RT_START_DOCUMENT_REVIEW,
    payloadPassthrough
  ),

  rtFinishDocumentReview: createAction(
    actionTypes.RT_FINISH_DOCUMENT_REVIEW,
    payloadPassthrough
  ),

  rtFinishDocumentReviewFulfilled: createAction(
    actionTypes.RT_FINISH_DOCUMENT_REVIEW_FULFILLED,
    payloadPassthrough
  ),

  rtFinishSpreadsheetReviewFulfilled: createAction(
    actionTypes.RT_FINISH_DOCUMENT_EXCEL_VIEW_FULFILLED,
    payloadPassthrough
  ),
  rtstartSpreadsheetReviewFulfilled: createAction(
    actionTypes.RT_START_DOCUMENT_EXCEL_VIEW_FULFILLED,
    payloadPassthrough
  ),
  rtSaveSpreadsheetFulfilled: createAction(
    actionTypes.RT_SAVE_SPREADSHEET_FULFILLED,
    payloadPassthrough
  ),
  rtSaveSpreadsheetRejected: createAction(
    actionTypes.RT_SAVE_SPREADSHEET_REJECTED,
    payloadPassthrough
  ),
  rtFinishDocumentReviewRejected: createAction(
    actionTypes.RT_FINISH_DOCUMENT_REVIEW_REJECTED,
    payloadPassthrough
  ),
  rtForceFinishDocumentReview: createAction(
    actionTypes.RT_FORCE_FINISH_DOCUMENT_REVIEW,
    payloadPassthrough
  ),

  rtForceFinishDocumentReviewFulfilled: createAction(
    actionTypes.RT_FORCE_FINISH_DOCUMENT_REVIEW_FULFILLED,
    payloadPassthrough
  ),

  rtForceFinishDocumentReviewRejected: createAction(
    actionTypes.RT_FORCE_FINISH_DOCUMENT_REVIEW_REJECTED,
    payloadPassthrough
  ),

  rtSkipDocumentReview: createAction(
    actionTypes.RT_SKIP_DOCUMENT_REVIEW,
    payloadPassthrough
  ),

  rtSkipDocumentReviewFulfilled: createAction(
    actionTypes.RT_SKIP_DOCUMENT_REVIEW_FULFILLED,
    payloadPassthrough
  ),

  rtSkipDocumentReviewRejected: createAction(
    actionTypes.RT_SKIP_DOCUMENT_REVIEW_REJECTED,
    payloadPassthrough
  ),

  rtSetSelectedFieldId: createAction(
    actionTypes.RT_SET_SELECTED_FIELD_ID,
    payloadPassthrough
  ),

  rtUpdateFieldData: createAction(
    actionTypes.RT_UPDATE_FIELD_DATA,
    payloadPassthrough
  ),

  rtUpdateFieldValue: createAction(
    actionTypes.RT_UPDATE_FIELD_VALUE,
    payloadPassthrough
  ),
  rtStartEditField: createAction(
    actionTypes.RT_START_EDITFIELD,
    payloadPassthrough
  ),
  updateDocId: createAction(actionTypes.UPDATE_DOC_ID, payloadPassthrough),

  rtAddSection: createAction(
    actionTypes.RT_SECTIONS_ADD_SECTION,
    payloadPassthrough
  ),
  rtAddFieldInSection: createAction(
    actionTypes.RT_SECTIONS_ADD_FIELD,
    payloadPassthrough
  ),
  rtDeleteFieldInSection: createAction(
    actionTypes.RT_SECTIONS_DELETE_FIELD,
    payloadPassthrough
  ),
  rtUpdateSectionData: createAction(
    actionTypes.RT_SECTIONS_UPDATE_SECTION,
    payloadPassthrough
  ),
  rtUpdateFieldsByIdData: createAction(
    actionTypes.RT_SECTIONS_UPDATE_FIELDS_BY_ID,
    payloadPassthrough
  ),
  rtShowFiterInField: createAction(
    actionTypes.RT_SHOW_FILTER_MODAL,
    payloadPassthrough
  ),
  rtUpdateStandardFilter: createAction(
    actionTypes.RT_STANDARD_FILTER,
    payloadPassthrough
  ),
  rtHideFilterInField: createAction(
    actionTypes.RT_HIDE_FILTER_MODAL,
    payloadPassthrough
  ),
  rtAdditionalFilter: createAction(
    actionTypes.RT_ADDITIONAL_FILTER,
    payloadPassthrough
  ),
  rtSetSelectedFieldFilter: createAction(
    actionTypes.RT_SET_FIELD_FILTER,
    payloadPassthrough
  ),
  rtSetEditFilter: createAction(
    actionTypes.RT_SET_EDIT_FILTER,
    payloadPassthrough
  ),
  updateSectionTitle: createAction(
    actionTypes.RT_SECTIONS_UPDATE_DATA,
    payloadPassthrough
  ),
  editFieldDeleteSection: createAction(
    actionTypes.RT_SECTIONS_DELETE,
    payloadPassthrough
  ),
  addFooterColumn: createAction(
    actionTypes.RT_FOOTER_ADD_COLUMNS,
    payloadPassthrough
  ),

  // rtPersistFieldData: createAction(actionTypes.
  //     RT_PERSIST_FIELD_DATA,
  //     payloadPassthrough
  // ),

  rtFieldDataPersistanceStart: createAction(
    actionTypes.RT_FIELD_DATA_PERSISTANCE_START,
    payloadPassthrough
  ),

  rtFieldDataPersistanceFulfilled: createAction(
    actionTypes.RT_FIELD_DATA_PERSISTANCE_FULFILLED,
    payloadPassthrough
  ),

  rtRealTimeUpdate: createAction(
    actionTypes.RT_REAL_TIME_UPDATE,
    payloadPassthrough
  ),

  rtFieldDataPersistanceRejected: createAction(
    actionTypes.RT_FIELD_DATA_PERSISTANCE_REJECTED,
    payloadPassthrough
  ),

  rtManageGridData: createAction(
    actionTypes.RT_LINE_ITEMS_MANAGE_GRID,
    payloadPassthrough
  ),

  rtExtractGridData: createAction(
    actionTypes.RT_LINE_ITEMS_EXTRACT_GRID_DATA,
    payloadPassthrough
  ),

  rtAddLine: createAction(
    actionTypes.RT_LINE_ITEMS_ADD_LINE,
    payloadPassthrough
  ),

  rtAddSimilarLinesStart: createAction(
    actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES_START,
    payloadPassthrough
  ),

  rtAddSimilarLines: createAction(
    actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES,
    payloadPassthrough
  ),

  rtAddSimilarLinesReject: createAction(
    actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES_REJECTED,
    payloadPassthrough
  ),

  rtDeleteRow: createAction(
    actionTypes.RT_LINE_ITEMS_DELETE_ROW,
    payloadPassthrough
  ),

  rtDeleteAllRows: createAction(
    actionTypes.RT_LINE_ITEMS_DELETE_ALL_ROWS,
    payloadPassthrough
  ),

  searchQuery: createAction(actionTypes.ADD_SEARCH_QUERY, payloadPassthrough),
  setTypWiseSelectionALL: createAction(
    actionTypes.SET_ALL_SELECTION_TYPE_WISE,
    payloadPassthrough
  ),
  setTypeWiseSelections: createAction(
    actionTypes.SET_CHECK_SELECTION_TYPE_WISE,
    payloadPassthrough
  ),
  storeClickedFolderInfo: createAction(
    actionTypes.STORE_CLICKED_FOLDER_INFO,
    payloadPassthrough
  ),
  createNewFolderId: createAction(actionTypes.SET_FOLDERID, payloadPassthrough),
  storeClickedFolderId: createAction(
    actionTypes.STORE_CLICKED_FOLDER_ID,
    payloadPassthrough
  ),
  storeSplitDocumentId: createAction(
    actionTypes.STORE_SPLIT_DOCUMENT_ID,
    payloadPassthrough
  ),
  storeRootSplitDocumentId: createAction(
    actionTypes.STORE_ROOT_SPLIT_DOCUMENT_ID,
    payloadPassthrough
  ),
  handleSpreadsheetView: createAction(
    actionTypes.HANDLE_SPREADSHEET_VIEW,
    payloadPassthrough
  ),
  updateReviewDocIds: createAction(
    actionTypes.UPDATE_REVIEW_DOCUMENT_ID,
    payloadPassthrough
  ),
  updateExcelReviewDocIds: createAction(
    actionTypes.UPDATE_EXCEL_REVIEW_DOCUMENT_ID,
    payloadPassthrough
  ),
  showAnalytics: createAction(actionTypes.SHOW_ANALYTICS, payloadPassthrough),
  hideAnalytics: createAction(actionTypes.HIDE_ANALYTICS, payloadPassthrough),
  newAnalytics: createAction(actionTypes.CHANGE_ANALYTICS, payloadPassthrough),
  updateSettingData: createAction(
    actionTypes.RT_CHANGE_SETTING,
    payloadPassthrough
  ),
  rtRetryValidation: createAction(
    actionTypes.RT_RETRY_VALIDATION,
    payloadPassthrough
  ),
  fetchDropdown: createAction(
    actionTypes.RT_LINE_ITEM_DROP_DOWN_FETCH,
    payloadPassthrough
  ),
  changeAutoClassifyStatus: createAction(
    actionTypes.CHANGE_AUTO_CLASSIFY_STATUS,
    payloadPassthrough
  ),
  resetReviewTool: createAction(
    actionTypes.RT_RESET_REVIEW_TOOL,
    payloadPassthrough
  ),
  setEditDocId: createAction(actionTypes.SET_EDIT_DOC_ID, payloadPassthrough),
  updateDocName: createAction(actionTypes.UPDATE_DOC_NAME, payloadPassthrough),
  resetDocId: createAction(actionTypes.RESET_EDIT_DOC_ID, payloadPassthrough),

  setCopiedPage: createAction(
    actionTypes.RT_SET_COPIED_PAGE,
    payloadPassthrough
  ),
  rtHandleGridDrag: createAction(
    actionTypes.RT_HANDLE_GRID_DRAG,
    payloadPassthrough
  ),

  updateDocumentTypeStatus: createAction(
    actionTypes.UPDATE_DOCUMENT_TYPE_STATUS,
    payloadPassthrough
  ),

  rtShowFirstReviewCompleteModal: createAction(
    actionTypes.RT_SHOW_FIRST_REVIEW_COMPLETE_MODAL,
    payloadPassthrough
  ),

  setUploadSampleDocType: createAction(
    actionTypes.UPLOAD_SAMPLE_DOC_TYPE,
    payloadPassthrough
  ),
  setHighlightedDocumentType: createAction(
    actionTypes.SET_HIGHLIGHTED_DOCUMENT_TYPE,
    payloadPassthrough
  ),

  updateChatAIBboxes: createAction(
    actionTypes.UPDATE_REVIEW_DOCUMENTS_CHATAI_BBOXES,
    payloadPassthrough
  ),
  setActiveSidebarTab: createAction(
    actionTypes.SET_ACTIVE_SIDEBAR_TAB,
    payloadPassthrough
  ),
  changeFieldVisiblity: createAction(
    actionTypes.CHANGE_FIELD_VISIBILITY,
    payloadPassthrough
  ),

  rtSetSelectedSectionFieldId: createAction(payloadPassthrough),

  changeFieldType: createAction(
    actionTypes.CHANGE_FIELD_TYPE,
    payloadPassthrough
  ),

  changeFieldOrder: createAction(
    actionTypes.CHANGE_FIELD_ORDER,
    payloadPassthrough
  ),

  setLoadingFieldId: createAction(
    actionTypes.SET_LOADING_FIELD_ID,
    payloadPassthrough
  ),

  resetLoadingFieldId: createAction(
    actionTypes.RESET_LOADING_FIELD_ID,
    payloadPassthrough
  ),

  setEditFieldChanges: createAction(
    actionTypes.SET_EDIT_FIELD_CHANGES,
    payloadPassthrough
  ),

  changeDataTypeFromSettinsPopup: createAction(
    actionTypes.CHANGE_DATA_TYPE_FROM_SETTINGS_POPUP,
    payloadPassthrough
  ),

  updateCollapsedSectionIds: createAction(
    actionTypes.UPDATE_COLLAPSED_SECTION_IDS,
    payloadPassthrough
  ),
  updateDisplayLabelFilter: createAction(
    actionTypes.UPDATE_DISPLAY_LABEL,
    payloadPassthrough
  ),
  customDocTypeEditFieldFlow: createAction(
    actionTypes.CUSTOM_DOCTYPE_EDITFIELD_FLOW,
    payloadPassthrough
  ),
  dropdownMapFetch: createAction(
    actionTypes.RT_DROP_DOWN_MAP_FETCH,
    payloadPassthrough
  ),
  rtSetCurrentGridId: createAction(actionTypes.RT_SET_CURRENT_GRID_ID),
  rtDropdownSortWithGridHeader: createAction(
    actionTypes.RT_DROP_DOWN_SORT_WITH_GRID_HEADER,
    payloadPassthrough
  ),

  rtUpdateGridData: createAction(
    actionTypes.RT_UPDATE_GRID_DATA,
    payloadPassthrough
  ),

  rtExtractSimilarTables: createAction(
    actionTypes.RT_EXTRACT_SIMILAR_TABLES,
    payloadPassthrough
  ),

  toggleFooterEmptyColumnVisibility: createAction(
    actionTypes.TOGGLE_FOOTER_EMPTY_COLUMN_VISIBILITY,
    payloadPassthrough
  ),
};
