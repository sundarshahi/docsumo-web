import { handleActions } from 'redux-actions';

import _ from 'lodash';
const uuidv1 = require('uuid/v1');
import { mapArrToStateKeys } from 'new/redux/reducerHelpers';

import * as apiConstants from 'new/constants/api';

import { actionTypes } from './actions';
import {
  computeFieldPositions,
  findNonOverlappingGrids,
  getGridConfidenceValue,
  isGridOverlapped,
  sortGrids,
  transformColumnFieldsData,
  transformToReviewToolData,
} from './helpers';

export const ALL_DOCUMENTS_PAGE = 'allDocumentsPage';
export const ALL_DOCUMENTS_TYPE_PAGE = 'allDocumentsTypePage';
export const REVIEW_DOCUMENTS_PAGE = 'reviewDocumentsPage';
export const SKIPPED_DOCUMENTS_PAGE = 'skippedDocumentsPage';
export const PROCESSED_DOCUMENTS_PAGE = 'processedDocumentsPage';
export const EDIT_FIELDS = 'editFields';
export const REVIEW_TOOL = 'reviewTool';
export const EXCEL_TOOL = 'excelTool';
export const DYNAMIC_DOCUMENTS = 'dynamicDocuments';

export function getReviewToolDocInitialState() {
  return {
    suggestionBboxesByID: {},
    suggestionBboxesByPage: {},

    sectionIds: null,
    sectionsById: {},

    sectionFieldIds: [],
    fieldsById: {},

    collapsedSectionIds: [],

    lineItemRowsById: {},

    selectedSectionFieldId: null,
    selectedLineItemRowId: null,
    selectedFieldId: null,
    selectedLineItemFooterBtn: null,
    selectedSectionId: null,
    copiedPage: null,

    chatAIBboxes: [],
    sort_by: '',

    sortedColumnOptions: [],
    gridsByPage: {},
    hideFooterEmptyColumn: false,
  };
}
function getExcelViewToolInitialState() {
  return {
    originLocation: null,

    documentIds: [],
    documentsById: {},

    fetchingDataForDocId: null,
    fetchDataFailedForDocId: null,

    startingReviewForDocId: null,
    finishingReviewForDocId: null,
    skippingReviewForDocId: null,

    docId: null,
    grids: [],
    originalGrids: [],
    gridFetching: false,
  };
}
function getReviewToolInitialState() {
  return {
    originLocation: null,

    documentIds: [],
    documentsById: {},

    fetchingDataForDocId: null,
    fetchDataFailedForDocId: null,

    startingReviewForDocId: null,
    finishingReviewForDocId: null,
    skippingReviewForDocId: null,

    docId: null,
    originalGrids: [],
    grids: [],
    mainGridPosition: {},
    gridFetching: false,
    updatedRow: false,
    showFirstReviewCompleteModal: false,
    isGridEdited: false,
    ...getReviewToolDocInitialState(),
  };
}

function getInitialState() {
  return {
    globalDocumentCounts: {},
    globalMyDocumentCounts: {},
    documentsById: {},
    documentsByIdDocType: {},
    uploadConfirmationDocType: null,
    showDoctypeSelectionModal: false,
    showCreateDocumentTypeModal: false,
    showAutoClassifyPopUpModal: false,
    selectedDocumentType: null,
    // documentsById: MOCK_documentsById,

    [ALL_DOCUMENTS_PAGE]: {
      documentIds: [],
      meta: {},
      fetchState: null,
    },
    [ALL_DOCUMENTS_TYPE_PAGE]: {
      documentIds: [],
      fetchState: null,
      highlightedDocumentType: {},
      uploadSampleDocType: {}, // When user selects 'Proceed with Sample'
    },
    [REVIEW_DOCUMENTS_PAGE]: {
      documentIds: [],
      meta: {},
      fetchState: null,
    },

    [SKIPPED_DOCUMENTS_PAGE]: {
      documentIds: [],
      meta: {},
      fetchState: null,
    },

    [PROCESSED_DOCUMENTS_PAGE]: {
      columns: [],
      documentIds: [],
      meta: {},
      fetchState: null,
    },

    [EDIT_FIELDS]: {
      fetchState: null,
      loadingFieldId: '',
      editFieldChanges: false,
      changeDataTypeFromSettings: false,
    },

    [REVIEW_TOOL]: getReviewToolInitialState(),
    [EXCEL_TOOL]: getExcelViewToolInitialState(),

    previewDocId: null, // document being previewed
    newFolderId: '',
    deleteConfirmationDocId: null,
    deleteConfirmationDocType: null, // document that needs to be deleted
    autoClassifyStatus: '',
    currentEditId: '', // doc id that is to be edited; only one at a time
    activeSidebarTab: 'extract', //sidebar active tab
  };
}

export default handleActions(
  {
    [actionTypes.OPEN_PREVIEW](state, { payload }) {
      const { docId } = payload;

      return {
        ...state,
        previewDocId: docId,
      };
    },
    [actionTypes.CLOSE_PREVIEW](state) {
      return {
        ...state,
        previewDocId: null,
      };
    },
    [actionTypes.CHANGE_AUTO_CLASSIFY_STATUS](state, { payload }) {
      const { autoClassifyStatus } = payload;
      return {
        ...state,
        autoClassifyStatus: autoClassifyStatus,
      };
    },
    [actionTypes.UPDATE_DOC_DATA](state, { payload }) {
      const { docId, updates } = payload;
      const document = state.documentsById[docId];

      if (!document) {
        return state;
      }

      const updatedDocument = {
        ...document,
        ...updates,
      };

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [docId]: updatedDocument,
        },
      };
    },
    [actionTypes.UPDATE_ASSIGN_DATA](state, { payload }) {
      const { docId, updates } = payload;
      const document = state.documentsById[docId];

      if (!document) {
        return state;
      }
      var updatedDocument = { ...document };
      if (updates.userId) {
        updatedDocument = {
          ...document,
          uploadedBy: updates,
        };
      }

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [docId]: updatedDocument,
        },
      };
    },

    [actionTypes.DELETE_DOC_AFTER_CONFIRMATION](state, { payload }) {
      const { docId, flag } = payload;
      return {
        ...state,
        deleteConfirmationDocId: docId,
        flag: flag || null,
      };
    },
    [actionTypes.DELETE_DOC_HIDE_CONFIRMATION](state, { payload }) {
      const { docId } = payload;

      if (state.deleteConfirmationDocId !== docId) {
        return state;
      }

      return {
        ...state,
        deleteConfirmationDocId: null,
      };
    },
    [actionTypes.DELETE_DOC_FULFILLED](state, { payload }) {
      const { docId } = payload;

      let rtDocumentsById = { ...state[REVIEW_TOOL].documentsById };
      if (rtDocumentsById[docId]) {
        rtDocumentsById[docId] = {
          ...rtDocumentsById[docId],
          deleted: true,
        };
      }

      return {
        ...state,
        documentsById: _.omit(state.documentsById, docId),
        [ALL_DOCUMENTS_PAGE]: {
          ...state[ALL_DOCUMENTS_PAGE],
          documentIds: _.without(state[ALL_DOCUMENTS_PAGE].documentIds, docId),
        },
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_PAGE],
          documentIds: _.without(
            state[ALL_DOCUMENTS_TYPE_PAGE].documentIds,
            docId
          ),
        },
        [REVIEW_DOCUMENTS_PAGE]: {
          ...state[REVIEW_DOCUMENTS_PAGE],
          documentIds: _.without(
            state[REVIEW_DOCUMENTS_PAGE].documentIds,
            docId
          ),
        },
        [SKIPPED_DOCUMENTS_PAGE]: {
          ...state[SKIPPED_DOCUMENTS_PAGE],
          documentIds: _.without(
            state[SKIPPED_DOCUMENTS_PAGE].documentIds,
            docId
          ),
        },
        [PROCESSED_DOCUMENTS_PAGE]: {
          ...state[PROCESSED_DOCUMENTS_PAGE],
          documentIds: _.without(
            state[PROCESSED_DOCUMENTS_PAGE].documentIds,
            docId
          ),
        },
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          documentsById: rtDocumentsById,
        },
      };
    },
    [actionTypes.DELETE_SPREADSHEET_DOC_FULFILLED](state, { payload }) {
      const { docId } = payload;

      let rtDocumentsById = { ...state[EXCEL_TOOL].documentsById };
      if (rtDocumentsById[docId]) {
        rtDocumentsById[docId] = {
          ...rtDocumentsById[docId],
          deleted: true,
        };
      }

      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[REVIEW_TOOL],
          documentsById: rtDocumentsById,
        },
      };
    },

    [actionTypes.DOCUMENT_COUNTS_FETCH_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});
      const { counts, countsFolder } = data;
      if (state.selectedFolderId) {
        return {
          ...state,
          globalDocumentCounts: countsFolder || {},
          globalMyDocumentCounts: counts || {},
        };
      } else
        return {
          ...state,
          globalDocumentCounts: counts || {},
          globalMyDocumentCounts: counts || {},
        };
    },

    [actionTypes.DISPLAY_CREATE_DOCUMENT_TYPE_MODAL](state, { payload }) {
      return {
        ...state,
        showCreateDocumentTypeModal:
          typeof payload === 'boolean'
            ? payload
            : !state.showCreateDocumentTypeModal,
      };
    },

    [actionTypes.DISPLAY_AUTO_CLASSIFY_MODAL](state, { payload }) {
      return {
        ...state,
        showAutoClassifyPopUpModal:
          typeof payload === 'boolean'
            ? payload
            : !state.showAutoClassifyPopUpModal,
      };
    },

    [actionTypes.DISPLAY_SELECT_DOCUMENT_TYPE_MODAL](state, { payload }) {
      return {
        ...state,
        showDoctypeSelectionModal:
          typeof payload === 'boolean'
            ? payload
            : !state.showDoctypeSelectionModal,
      };
    },
    [actionTypes.SELECTED_MODEL_HUB](state, { payload }) {
      const { documentTypeModel } = payload;
      return {
        ...state,
        selectedModelHub: documentTypeModel,
      };
    },

    [actionTypes.SELECT_DOCUMENT_TYPE](state, { payload }) {
      return {
        ...state,
        selectedDocumentType: payload,
      };
    },

    [actionTypes.GET_UPDATED_SUMMARY_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});

      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          summaryData: data,
        },
      };
    },
    [actionTypes.SET_DOCUMENT_COUNTS](state, { payload }) {
      const { counts, counts_folder } = payload;
      if (state.selectedFolderId) {
        return {
          ...state,
          globalDocumentCounts: counts_folder || {},
          globalMyDocumentCounts: counts || {},
        };
      } else
        return {
          ...state,
          globalDocumentCounts: counts || {},
          globalMyDocumentCounts: counts || {},
        };
    },

    [actionTypes.ALL_DOCUMENTS_FETCH](state) {
      return {
        ...state,
        [ALL_DOCUMENTS_PAGE]: {
          ...state[ALL_DOCUMENTS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.ALL_DOCUMENTS_FETCH_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});
      const { documents, ...meta } = data;
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(documents, {
          idKey: 'docId',
          optionalId: 'folderId',
        });
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          ...documentsById,
        },
        [ALL_DOCUMENTS_PAGE]: {
          ...state[ALL_DOCUMENTS_PAGE],
          documentIds: documentIds,
          meta: {
            ...state[ALL_DOCUMENTS_PAGE].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.DOCTYPE_DOCUMENTS_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});
      const { documents } = data;
      const { itemsById: documentsByIdDocType } = mapArrToStateKeys(documents, {
        idKey: 'docId',
        optionalId: 'folderId',
      });
      return {
        ...state,
        documentsByIdDocType: {
          ...state.documentsByIdDocType,
          ...documentsByIdDocType,
        },
      };
    },
    // [actionTypes.ALL_DOCUMENTS_FETCH_CANCEL] (state) {
    //     return {
    //         ...state,
    //         [ALL_DOCUMENTS_PAGE]: {
    //             ...(state[ALL_DOCUMENTS_PAGE]),
    //             fetchState: null,
    //         },
    //     };
    // },
    [actionTypes.ALL_DOCUMENTS_FETCH_REJECTED](state) {
      return {
        ...state,
        [ALL_DOCUMENTS_PAGE]: {
          ...state[ALL_DOCUMENTS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.ALL_DOCUMENTS_RESET](state) {
      return {
        ...state,
        [ALL_DOCUMENTS_PAGE]: {
          documentIds: [],
          meta: {},
        },
      };
    },
    [actionTypes.ALL_DOCUMENTS_TYPE_FETCH](state) {
      return {
        ...state,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
          error: null,
        },
      };
    },

    [actionTypes.DUPLICATE_DOCUMENT_TYPE_FETCH](state) {
      return {
        ...state,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          /* documentIds:[],
                documentsById:{},
                fetchState: apiConstants.FETCH_STATES.FETCHING,*/
        },
      };
    },
    [actionTypes.UPDATE_DOCUMENT_TYPE](state, { payload }) {
      const { document } = payload;
      if (!document) {
        return state;
      }
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(document, { idKey: 'id' });
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          ...documentsById,
        },
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          documentIds: documentIds,
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
          error: null,
        },
      };
    },
    [actionTypes.UPLOAD_DOCUMENT_TYPE_CONFIRMATION](state, { payload }) {
      const { docType, payload: fieldType } = payload;
      return {
        ...state,
        uploadConfirmationDocType: docType,
        fieldType: fieldType,
      };
    },
    [actionTypes.UPLOAD_DOCUMENT_TYPE_HIDE_CONFIRMATION](state, { payload }) {
      const { docType } = payload;
      if (state.uploadConfirmationDocType !== docType) {
        return state;
      }
      return {
        ...state,
        uploadConfirmationDocType: null,
        fieldType: null,
      };
    },
    [actionTypes.SETTING_DOCUMENT_TYPE_CONFIRMATION_FULFILLED](
      state,
      { payload }
    ) {
      const { docType, config, docId, docSetting, filterList } = payload;
      let docSettingData = [];
      for (let i = 0; i < docSetting.length; i++) {
        docSettingData.push({
          ...filterList.find(
            (itmInner) => itmInner.id === docSetting[i].filterId
          ),
          ...docSetting[i],
        });
      }

      return {
        ...state,
        downloadConfirmationType: docType,
        config: config,
        docId,
        docSettingData,
      };
    },
    [actionTypes.RT_SET_SETTING_DATA](state, { payload }) {
      const { docSetting, filterList } = payload;
      let docSettingData = [];
      for (let i = 0; i < docSetting.length; i++) {
        docSettingData.push({
          ...filterList.find(
            (itmInner) => itmInner.id === docSetting[i].filterId
          ),
          ...docSetting[i],
        });
      }

      return {
        ...state,
        docSettingData,
      };
    },
    [actionTypes.SETTING_DOCUMENT_TYPE_CONFIRMATION_CANCEL](
      state,
      { payload }
    ) {
      const { docType } = payload;
      const doc = state.downloadConfirmationType;
      if (doc !== docType) {
        return state;
      }
      return {
        ...state,
        downloadConfirmationType: null,
      };
    },

    [actionTypes.DOWNLOAD_DOCUMENT_CONFIRMATION](state, { payload }) {
      const { docId } = payload;
      return {
        ...state,
        downloadDocConfirmation: docId,
        docId,
      };
    },

    [actionTypes.DOWNLOAD_DOCUMENT_TYPE_HIDE_CONFIRMATION](state, { payload }) {
      const { docType } = payload;
      const doc =
        state.downloadConfirmationType || state.downloadDocConfirmation;
      if (doc !== docType) {
        return state;
      }
      return {
        ...state,
        downloadConfirmationType: null,
        downloadDocConfirmation: null,
      };
    },

    [actionTypes.SHOW_ANALYTICS](state, { payload }) {
      const { docType, config, docId } = payload;
      return {
        ...state,
        analyticsDocument: docType,
        config: config,
        docId,
      };
    },
    [actionTypes.SET_ANALYTICS](state, { payload }) {
      const { generalAnalytics, accuracyAnalytics } = payload;
      return {
        ...state,
        analyticsData: { ...generalAnalytics, ...accuracyAnalytics },
      };
    },

    [actionTypes.HIDE_ANALYTICS](state, { payload }) {
      const { docType } = payload;
      const doc = state.analyticsDocument;
      if (doc !== docType) {
        return state;
      }
      return {
        ...state,
        analyticsDocument: null,
        analyticsData: null,
      };
    },

    [actionTypes.REJECT_ANALYTICS](state, { meta }) {
      const docId = _.get(meta, 'docId');

      return {
        ...state,
        rejectedAnalyticsDocId: docId,
      };
    },

    [actionTypes.HIDE_ALERT_MODAL](state) {
      return {
        ...state,
        showAlertModalSlug: null,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          error: null,
        },
      };
    },
    [actionTypes.SHOW_ALERT_MODAL](state, { payload }) {
      const { modalPayload } = payload;
      return {
        ...state,
        showAlertModalSlug: true,
        modalPayload,
      };
    },

    [actionTypes.RT_SHOW_FILTER_MODAL](state, { payload }) {
      const { fieldId, docType } = payload;
      return {
        ...state,
        fieldId,
        docType,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          selectedFieldId: fieldId,
        },
      };
    },

    [actionTypes.RT_FETCH_EDITFIELD_FILTER_LOADING](state) {
      return {
        ...state,
        [EDIT_FIELDS]: {
          ...state[EDIT_FIELDS],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },

    [actionTypes.RT_FETCH_EDITFIELD_FILTER_FULFILLED](state) {
      return {
        ...state,
        [EDIT_FIELDS]: {
          ...state[EDIT_FIELDS],
          fetchState: null,
        },
      };
    },

    [actionTypes.RT_SET_FIELD_FILTER](state, { payload }) {
      const { fieldId } = state;
      //const { filters }=payload;
      if (!fieldId) {
        return {
          ...state,
        };
      }
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              filters: payload,
            },
          },
        },
      };
    },
    [actionTypes.RT_SET_STANDARD_FILTER](state, { payload }) {
      const { fieldId } = state;
      //const { filters }=payload;
      if (!fieldId) {
        return {
          ...state,
        };
      }
      let currentFilter = state[REVIEW_TOOL].fieldsById[fieldId].filters;
      let changedFilter = currentFilter.filter(
        (item) =>
          item.filterId !== 200 && (item.filterId !== 14 || item.id !== 18)
      );
      const updatedFilter = payload.filter(
        (item) =>
          item.filterId === 200 || (item.filterId === 14 && item.id === 18)
      );
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              filters: [...changedFilter, ...updatedFilter],
            },
          },
        },
      };
    },

    [actionTypes.RT_SET_EDIT_FILTER](state, { payload }) {
      const { fieldId } = state;
      if (!fieldId) {
        return {
          ...state,
        };
      }
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              filters: payload,
            },
          },
        },
      };
    },
    [actionTypes.UPDATE_DISPLAY_LABEL](state, { payload }) {
      const { fieldId } = state;
      const { id = '', label = '' } = payload;
      if (!fieldId) {
        return {
          ...state,
        };
      }
      let currentFilter = state[REVIEW_TOOL]?.fieldsById[fieldId]?.filters;
      let displayFilter = currentFilter?.find((item) => item.id === id);
      displayFilter.value = label;
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              filters: [...currentFilter],
            },
          },
        },
      };
    },

    [actionTypes.RT_HIDE_FILTER_MODAL](state, { payload }) {
      const { fieldId } = payload;
      if (state.fieldId !== fieldId) {
        return state;
      }

      return {
        ...state,
        fieldId: null,
      };
    },

    [actionTypes.ALL_DOCUMENTS_TYPE_FETCH_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});
      const { document, disabledDocTypes = [] } = data;
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(document, { idKey: 'id' });
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          ...documentsById,
        },
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          documentIds: documentIds,
          disabledDocTypes: disabledDocTypes,
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
          error: null,
        },
      };
    },
    [actionTypes.ALL_DOCUMENTS_TYPE_FETCH_REJECTED](state) {
      return {
        ...state,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.ALL_DOCUMENTS_TYPE_RESET](state) {
      return {
        ...state,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          documentIds: [],
          documentsById: {},
          error: null,
        },
      };
    },

    [actionTypes.DOCUMENTS_TYPES_DYNAMIC_FETCH](state) {
      return {
        ...state,
        [DYNAMIC_DOCUMENTS]: {
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.DOCUMENTS_TYPES_DYNAMIC_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});
      const filteredDocList = _.map(data.document, (obj) =>
        _.pick(obj, ['title', 'docType'])
      ).map((obj) => ({ label: obj.title, value: obj.docType }));
      return {
        ...state,
        [DYNAMIC_DOCUMENTS]: {
          documents: filteredDocList,
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.DOCUMENTS_TYPES_DYNAMIC_ERROR](state, { payload }) {
      return {
        ...state,
        [DYNAMIC_DOCUMENTS]: {
          fetchState: apiConstants.FETCH_STATES.FAILURE,
          error: payload,
        },
      };
    },
    [actionTypes.ALL_DOCUMENTS_TYPE_FETCH_REJECTED](state) {
      return {
        ...state,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },

    [actionTypes.REVIEW_DOCUMENTS_FETCH](state) {
      return {
        ...state,
        [REVIEW_DOCUMENTS_PAGE]: {
          ...state[REVIEW_DOCUMENTS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.REVIEW_DOCUMENTS_FETCH_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});
      const { documents, ...meta } = data;

      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(documents, {
          idKey: 'docId',
          optionalId: 'folderId',
        });

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          ...documentsById,
        },
        [REVIEW_DOCUMENTS_PAGE]: {
          ...state[REVIEW_DOCUMENTS_PAGE],
          documentIds: documentIds,
          meta: {
            ...state[REVIEW_DOCUMENTS_PAGE].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.REVIEW_DOCUMENTS_FETCH_REJECTED](state) {
      return {
        ...state,
        [REVIEW_DOCUMENTS_PAGE]: {
          ...state[REVIEW_DOCUMENTS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.REVIEW_DOCUMENTS_RESET](state) {
      return {
        ...state,
        [REVIEW_DOCUMENTS_PAGE]: {
          documentIds: [],
          meta: {},
        },
      };
    },

    [actionTypes.SKIPPED_DOCUMENTS_FETCH](state) {
      return {
        ...state,
        [SKIPPED_DOCUMENTS_PAGE]: {
          ...state[SKIPPED_DOCUMENTS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.SKIPPED_DOCUMENTS_FETCH_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});
      const { documents, ...meta } = data;

      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(documents, {
          idKey: 'docId',
          optionalId: 'folderId',
        });

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          ...documentsById,
        },
        [SKIPPED_DOCUMENTS_PAGE]: {
          ...state[SKIPPED_DOCUMENTS_PAGE],
          documentIds: documentIds,
          meta: {
            ...state[SKIPPED_DOCUMENTS_PAGE].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.SKIPPED_DOCUMENTS_FETCH_REJECTED](state) {
      return {
        ...state,
        [SKIPPED_DOCUMENTS_PAGE]: {
          ...state[SKIPPED_DOCUMENTS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.SKIPPED_DOCUMENTS_RESET](state) {
      return {
        ...state,
        [SKIPPED_DOCUMENTS_PAGE]: {
          documentIds: [],
          meta: {},
        },
      };
    },

    [actionTypes.PROCESSED_DOCUMENTS_FETCH](state) {
      return {
        ...state,
        [PROCESSED_DOCUMENTS_PAGE]: {
          ...state[PROCESSED_DOCUMENTS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.PROCESSED_DOCUMENTS_FETCH_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});
      const { columns, documents, ...meta } = data;

      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(documents, {
          idKey: 'docId',
          optionalId: 'folderId',
        });

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          ...documentsById,
        },
        [PROCESSED_DOCUMENTS_PAGE]: {
          ...state[PROCESSED_DOCUMENTS_PAGE],
          columns: columns,
          documentIds: documentIds,
          meta: {
            ...state[PROCESSED_DOCUMENTS_PAGE].meta,
            ...meta,
          },
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.PROCESSED_DOCUMENTS_FETCH_REJECTED](state) {
      return {
        ...state,
        [PROCESSED_DOCUMENTS_PAGE]: {
          ...state[PROCESSED_DOCUMENTS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.PROCESSED_DOCUMENTS_RESET](state) {
      return {
        ...state,
        [PROCESSED_DOCUMENTS_PAGE]: {
          documentIds: [],
          meta: {},
        },
      };
    },

    [actionTypes.UPDATE_REVIEW_DOC_DATA](state, { payload }) {
      const { docId, updates } = payload;
      const document = state[REVIEW_TOOL].documentsById[docId];

      if (!document) {
        return state;
      }

      const updatedDocument = {
        ...document,
        ...updates,
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          documentsById: {
            ...state[REVIEW_TOOL].documentsById,
            [docId]: updatedDocument,
          },
        },
      };
    },

    [actionTypes.RT_START_REVIEW_FULFILLED](state, { payload, meta }) {
      const { originLocation, sort } = meta;
      const data = _.get(payload.responsePayload, 'data', {});
      const { documents } = data;
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(documents, { idKey: 'docId' });

      documentIds.forEach((documentId) => {
        const document = documentsById[documentId] || {};
        let width = 0;
        let height = 0;
        document.pages &&
          document.pages.forEach((page) => {
            width = page.image.width;
            height += page.image.height;
          });

        document.width = width;
        document.height = height;
      });
      let { documentsById: prevDocs } = state;
      if (prevDocs && _.isEmpty(prevDocs)) {
        prevDocs = documentsById;
      }
      return {
        ...state,
        ddObject: null,
        documentsById: prevDocs,
        [REVIEW_TOOL]: {
          ...getReviewToolInitialState(),
          originLocation,
          documentsById,
          documentIds,
          sort_by: sort,
          fetchError: null,
        },
      };
    },

    [actionTypes.RT_DATA_FETCH_ERROR](state, { payload }) {
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fetchError: payload,
        },
      };
    },

    [actionTypes.RT_UPDATE_REVIEW_FULFILLED](state, { payload, meta }) {
      const { originLocation } = meta;
      const data = _.get(payload.responsePayload, 'data', {});
      const { documents } = data;
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(documents, { idKey: 'docId' });
      documentIds.forEach((documentId) => {
        const document = documentsById[documentId] || {};
        let width = 0;
        let height = 0;
        document.pages &&
          document.pages.forEach((page) => {
            width = page.image.width;
            height += page.image.height;
          });

        document.width = width;
        document.height = height;
      });
      let { documentsById: prevDocs } = state;
      if (prevDocs && _.isEmpty(prevDocs)) {
        prevDocs = documentsById;
      }
      return {
        ...state,
        ddObject: null,
        documentsById: prevDocs,
        [REVIEW_TOOL]: {
          ...getReviewToolInitialState(),
          originLocation,
          documentsById: {
            ...state[REVIEW_TOOL].documentsById,
            ...documentsById,
          },
          documentIds: [...state[REVIEW_TOOL].documentIds],
        },
      };
    },

    [actionTypes.RT_START_EXCEL_VIEW_FULFILLED](state, { payload, meta }) {
      const { originLocation } = meta;
      const data = _.get(payload.responsePayload, 'data', {});
      const { documents } = data;
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(documents, { idKey: 'docId' });
      documentIds.forEach((documentId) => {
        const document = documentsById[documentId] || {};
        let width = 0;
        let height = 0;
        document.pages &&
          document.pages.forEach((page) => {
            width = page.image.width;
            height += page.image.height;
          });

        document.width = width;
        document.height = height;
      });
      let { documentsById: prevDocs } = state;
      if (prevDocs && _.isEmpty(prevDocs)) {
        prevDocs = documentsById;
      }
      return {
        ...state,
        documentsById: prevDocs,
        [EXCEL_TOOL]: {
          ...getExcelViewToolInitialState(),
          originLocation,
          documentsById,
          documentIds,
        },
      };
    },

    [actionTypes.RT_START_EDITFIELD_FULFILLED](
      state,
      { payload, meta, message }
    ) {
      const { originLocation, docId } = meta;
      const data = _.get(payload.responsePayload, 'data', {});
      const { document } = data;
      // const documentIds=[];
      // const documentsById={};
      // documentIds.push(document[0].docId);
      // documentsById[document[0].docId]=document.find(item => item.docId);
      // documentIds.forEach((documentId) => {
      //     const document = documentsById[documentId];
      //     let width = 0;
      //     let height = 0;
      //     document.pages.forEach((page) => {
      //         width = page.image.width;
      //         height +=  page.image.height;
      //     });

      //     documentsById[documentId].width = width;
      //     documentsById[documentId].height = height;
      // });
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(document, { idKey: 'docId' });
      documentIds.forEach((documentId) => {
        const document = documentsById[documentId] || {};
        let width = 0;
        let height = 0;
        document.pages &&
          document.pages.forEach((page) => {
            width = page.image.width;
            height += page.image.height;
          });

        document.width = width;
        document.height = height;
      });
      let { documentsById: prevDocs } = state;
      if (prevDocs && _.isEmpty(prevDocs)) {
        prevDocs = documentsById;
      }

      return {
        ...state,
        docId,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          //Remove the error message in success response
          //error: message,
        },
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          //...getReviewToolInitialState(),
          docId,
          originLocation,
          documentsById,
          documentIds,
          docTypeId: document[0].docTypeId,
        },
      };
    },
    [actionTypes.CHANGE_FIELD_VISIBILITY](state, { payload }) {
      const { is_hidden, fieldId } = payload;
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              prevVisibility:
                state[REVIEW_TOOL].fieldsById[fieldId]?.isHidden || null,
              isHidden: is_hidden,
            },
          },
        },
      };
    },
    [actionTypes.CUSTOM_DOCTYPE_EDITFIELD_FLOW](state, { payload }) {
      const { files } = payload;
      return {
        ...state,
        [EDIT_FIELDS]: {
          ...state[EDIT_FIELDS],
          customDocTypeFiles: files,
        },
      };
    },
    [actionTypes.CHANGE_FIELD_VISIBILITY_REJECTED](state, { meta }) {
      const { fieldId } = meta;
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              prevVisibility: null,
              isHidden:
                state[REVIEW_TOOL].fieldsById[fieldId]?.prevVisibility || null,
            },
          },
        },
      };
    },

    [actionTypes.RT_FETCH_FILTER_FULFILLED](state, { payload }) {
      return {
        ...state,
        filterList: payload,
      };
    },

    [actionTypes.RT_START_EDITFIELD_REJECTED](state, { payload, meta }) {
      const { responsePayload } = payload;
      const { docId } = meta;
      return {
        ...state,
        docId,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          error: responsePayload?.error?.message || 'Something went wrong!',
        },
        [REVIEW_TOOL]: {
          ...getReviewToolInitialState(),
        },
      };
    },
    [actionTypes.RT_RESET_REVIEW_TOOL](state) {
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...getReviewToolInitialState(),
        },
      };
    },
    [actionTypes.RT_SECTIONS_UPDATE_SECTION](state, { payload }) {
      const { sectionId, section } = payload;
      let sectionsById = state[REVIEW_TOOL].sectionsById;
      sectionsById = {
        ...sectionsById,
        [sectionId]: section,
      };
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          sectionsById,
        },
      };
    },
    [actionTypes.RT_SECTIONS_UPDATE_FIELDS_BY_ID](state, { payload }) {
      const { fieldsById } = payload;
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
        },
      };
    },
    [actionTypes.RT_SECTIONS_UPDATE_DATA](state, { payload, docId }) {
      const { data: sections } = payload;
      const document = state[REVIEW_TOOL].documentsById[docId];
      const { width: docWidth, height: docHeight } = document;

      const {
        sectionIds,
        sectionsById,
        fieldsById,
        sectionFieldIds,
        lineItemRowsById,
        lineItemId,
      } = transformToReviewToolData({ sections, docWidth, docHeight });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fetchingDataForDocId: null,
          fetchDataFailedForDocId: null,
          sectionIds,
          sectionsById,
          fieldsById,
          sectionFieldIds,
          lineItemRowsById,
          lineItemId,
        },
      };
    },

    [actionTypes.RT_DOCUMENT_DATA_FETCH](state, { payload }) {
      const docId = _.get(payload, 'docId');
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          ...getReviewToolDocInitialState(),
          docId: docId,
          fetchingDataForDocId: docId,
        },
      };
    },
    [actionTypes.RT_EXCEL_DOCUMENT_DATA_FETCH](state, { payload }) {
      const docId = _.get(payload, 'docId');
      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          docId: docId,
          fetchingDataForDocId: docId,
          isFetchingExcelData: true,
        },
      };
    },

    [actionTypes.UPDATE_DOC_ID_FULFILLED](state, { payload }) {
      const { docId, bboxes } = payload;
      const document = state[REVIEW_TOOL].documentsById[docId];
      const { width: docWidth, height: docHeight, pages = [] } = document;
      const pageHeight = docHeight / pages.length;

      const suggestionBboxesByID = {};
      const suggestionBboxesByPage = {};

      bboxes.forEach((bbox) => {
        const id = uuidv1();
        const [x1, y1, x2, y2] = bbox.rectangle;

        const pageNumber = Math.ceil(y1 / pageHeight) || 1;

        bbox.page = pageNumber;

        const x1Percentage = (x1 / docWidth) * 100;
        const y1Percentage = (y1 / docHeight) * 100;
        const x2Percentage = (x2 / docWidth) * 100;
        const y2Percentage = (y2 / docHeight) * 100;

        const top = _.round(y1Percentage, 4);
        const left = _.round(x1Percentage, 4);
        const width = _.round(x2Percentage - x1Percentage, 4);
        const height = _.round(y2Percentage - y1Percentage, 4);

        bbox.uuid = id;
        bbox.rectanglePercentages = [
          x1Percentage,
          y1Percentage,
          x2Percentage,
          y2Percentage,
        ];
        bbox.position = {
          top,
          left,
          width,
          height,
        };

        suggestionBboxesByPage[pageNumber] = [
          ...(suggestionBboxesByPage[pageNumber] || []),
          bbox,
        ];
        suggestionBboxesByID[id] = bbox;
      });
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          docId,
          suggestionBboxesByID,
          suggestionBboxesByPage,
        },
      };
    },

    [actionTypes.RT_DOCUMENT_DATA_FETCH_FULFILLED](state, { payload, meta }) {
      const docId = _.get(meta, 'docId');
      const { bboxes, sections, DDfields, rtUpdateFields } = payload;

      let { allTableGrids } = payload;

      const document = state[REVIEW_TOOL].documentsById[docId];
      const { width: docWidth, height: docHeight, pages = [] } = document;
      const pageHeight = docHeight / pages.length;

      const suggestionBboxesByID = {};
      const suggestionBboxesByPage = {};

      const gridBboxesByID = {};
      const gridBboxIds = [];

      bboxes.forEach((bbox) => {
        const id = uuidv1();
        const [x1, y1, x2, y2] = bbox.rectangle;

        const pageNumber = Math.ceil(y1 / pageHeight) || 1;

        bbox.page = pageNumber;

        const x1Percentage = (x1 / docWidth) * 100;
        const y1Percentage = (y1 / docHeight) * 100;
        const x2Percentage = (x2 / docWidth) * 100;
        const y2Percentage = (y2 / docHeight) * 100;

        const top = _.round(y1Percentage, 4);
        const left = _.round(x1Percentage, 4);
        const width = _.round(x2Percentage - x1Percentage, 4);
        const height = _.round(y2Percentage - y1Percentage, 4);

        bbox.uuid = id;
        bbox.rectanglePercentages = [
          x1Percentage,
          y1Percentage,
          x2Percentage,
          y2Percentage,
        ];
        bbox.position = {
          top,
          left,
          width,
          height,
        };

        suggestionBboxesByPage[pageNumber] = [
          ...(suggestionBboxesByPage[pageNumber] || []),
          bbox,
        ];
        suggestionBboxesByID[id] = bbox;
      });

      allTableGrids.forEach((bbox) => {
        const id = uuidv1();
        const { topLeft, bottomRight } = bbox;
        const [x1, y1] = topLeft;
        const [x2, y2] = bottomRight;

        const x1Percentage = (x1 / docWidth) * 100;
        const y1Percentage = (y1 / docHeight) * 100;
        const x2Percentage = (x2 / docWidth) * 100;
        const y2Percentage = (y2 / docHeight) * 100;

        const top = _.round(y1Percentage, 4);
        const left = _.round(x1Percentage, 4);
        const width = _.round(x2Percentage - x1Percentage, 4);
        const height = _.round(y2Percentage - y1Percentage, 4);

        bbox.rectanglePercentages = [
          x1Percentage,
          y1Percentage,
          x2Percentage,
          y2Percentage,
        ];

        bbox.rectangle = [x1, y1, x2, y2];

        bbox.position = {
          top,
          left,
          width,
          height,
        };

        bbox.uuid = id;
        gridBboxIds.push(id);
        gridBboxesByID[id] = bbox;
      });

      const {
        sectionIds,
        sectionsById,
        fieldsById,
        sectionFieldIds,
        lineItemRowsById,
        lineItemId,
        footerGridsById,
      } = transformToReviewToolData({ sections, docWidth, docHeight });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          docId,
          fetchingDataForDocId: null,
          fetchDataFailedForDocId: null,
          suggestionBboxesByID,
          suggestionBboxesByPage,
          gridBboxIds,
          gridBboxesByID,
          sectionIds,
          sectionsById,
          fieldsById,
          sectionFieldIds,
          lineItemId,
          lineItemRowsById,
          grids: [],
          footerGridsById,
          originalGrids: [],
        },
        DDfields,
        rtUpdateFields,
      };
    },

    [actionTypes.RT_DOCUMENT_DATA_LOAD_FETCH_FULFILLED](
      state,
      { payload, meta }
    ) {
      const docId = _.get(meta, 'docId');
      const { bboxes, sections, rtUpdateFields } = payload;

      const document = state[REVIEW_TOOL].documentsById[docId];
      const { width: docWidth, height: docHeight, pages = [] } = document;
      const pageHeight = docHeight / pages.length;

      const suggestionBboxesByID = {};
      const suggestionBboxesByPage = {};

      bboxes.forEach((bbox) => {
        const id = uuidv1();
        const [x1, y1, x2, y2] = bbox.rectangle;

        const pageNumber = Math.ceil(y1 / pageHeight) || 1;

        bbox.page = pageNumber;

        const x1Percentage = (x1 / docWidth) * 100;
        const y1Percentage = (y1 / docHeight) * 100;
        const x2Percentage = (x2 / docWidth) * 100;
        const y2Percentage = (y2 / docHeight) * 100;

        const top = _.round(y1Percentage, 4);
        const left = _.round(x1Percentage, 4);
        const width = _.round(x2Percentage - x1Percentage, 4);
        const height = _.round(y2Percentage - y1Percentage, 4);

        bbox.uuid = id;
        bbox.rectanglePercentages = [
          x1Percentage,
          y1Percentage,
          x2Percentage,
          y2Percentage,
        ];
        bbox.position = {
          top,
          left,
          width,
          height,
        };

        suggestionBboxesByPage[pageNumber] = [
          ...(suggestionBboxesByPage[pageNumber] || []),
          bbox,
        ];
        suggestionBboxesByID[id] = bbox;
      });

      const {
        sectionIds,
        sectionsById,
        fieldsById,
        sectionFieldIds,
        lineItemRowsById,
        lineItemId,
      } = transformToReviewToolData({ sections, docWidth, docHeight });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          docId,
          fetchingDataForDocId: null,
          fetchDataFailedForDocId: null,
          sectionIds,
          sectionsById,
          fieldsById,
          sectionFieldIds,
          lineItemId,
          lineItemRowsById,
          grids: [],
          suggestionBboxesByID,
          suggestionBboxesByPage,
        },
        rtUpdateFields,
      };
    },
    // [actionTypes.RT_DOCUMENT_DATA_FETCH_FULFILLED] (state, { meta }) {
    //     const docId = _.get(meta, 'docId');
    //     // const {
    //     //     bboxes,
    //     //     sections,
    //     //     DDfields,
    //     //     rtUpdateFields
    //     // } = payload;

    //     return {
    //         ...state,
    //         [REVIEW_TOOL]: {
    //             ...state[REVIEW_TOOL],
    //             docId,
    //             //bboxes,
    //             //sections,
    //             fetchingDataForDocId: null,
    //             fetchDataFailedForDocId: null,
    //             grids: []
    //         },
    //         //DDfields,
    //         //rtUpdateFields,
    //     };
    // },
    [actionTypes.RT_EXCEL_DOCUMENT_DATA_FETCH_FULFILLED](
      state,
      { payload, meta }
    ) {
      const docId = _.get(meta, 'docId');
      const { sections, summaryData } = payload;

      //const document = state[REVIEW_TOOL].documentsById[docId];
      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          docId,
          fetchingDataForDocId: null,
          fetchDataFailedForDocId: null,
          // bboxes,
          // sections,
          //document,
          excelData: sections,
          summaryData,
          isFetchingExcelData: false,
          grids: [],
        },
        // DDfields,
        // rtUpdateFields,
      };
    },
    [actionTypes.RT_DOCUMENT_DATA_FETCH_REJECTED](state, { meta }) {
      const docId = _.get(meta, 'docId');

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fetchingDataForDocId: null,
          fetchDataFailedForDocId: docId,
        },
      };
    },
    [actionTypes.RT_EXCEL_DOCUMENT_DATA_FETCH_REJECTED](state, { meta }) {
      const docId = _.get(meta, 'docId');
      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          fetchingDataForDocId: null,
          fetchDataFailedForDocId: docId,
        },
      };
    },

    [actionTypes.RT_START_EXCEL_VIEW_REJECTED](state, { meta }) {
      const docId = _.get(meta, 'docId');
      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          docId: docId,
          fetchingDataForDocId: null,
          fetchDataFailedForDocId: docId,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_UPDATE_CHILDREN](state, { payload, meta }) {
      const { docId, sectionFieldId } = meta;
      const { rows } = payload;

      const fieldsToBeAdded = [];
      const lineItemRowsById = {
        ...state[REVIEW_TOOL].lineItemRowsById,
      };

      const sectionField = {
        ...state[REVIEW_TOOL].fieldsById[sectionFieldId],
      };
      /* sectionField.lineItemColumns = columns.map((columnField)=>{
            fieldsToBeAdded.push({
                parentType: 'line_item_section_field',
                parentId: sectionFieldId,
                field: columnField,
            });
            return columnField;
        });*/
      sectionField.lineItemRowIds = rows.map((row) => {
        const { id, fields } = row;
        const rowFieldIds = [];

        fields.forEach((rowField) => {
          rowFieldIds.push(rowField.id);
          fieldsToBeAdded.push({
            parentType: 'line_item_section_field',
            parentId: sectionFieldId,
            parentRowId: id,
            field: rowField,
          });
        });

        lineItemRowsById[id] = {
          id,
          parentSectionFieldId: sectionFieldId,
          fieldIds: rowFieldIds,
        };

        return id;
      });

      const document = state[REVIEW_TOOL].documentsById[docId];
      const { width: docWidth, height: docHeight } = document;

      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: sectionField,
      };

      fieldsToBeAdded.forEach(({ field, parentType, parentId }) => {
        const fieldId = _.get(field, 'id');
        const content = _.get(field, 'content') || {};
        const uiValue = content.value;
        const uiLabel = _.get(field, 'label');
        const uiIsValidFormat = !_.isUndefined(content.isValidFormat)
          ? content.isValidFormat
          : true;

        const fieldPositions = computeFieldPositions({
          docWidth,
          docHeight,
          rectangle: content.position,
        });
        const uiRectangle = fieldPositions.rectangle;
        const uiRectanglePercentages = fieldPositions.rectanglePercentages;
        const uiPosition = fieldPositions.position;

        fieldsById[fieldId] = {
          ...field,
          _parentType: parentType,
          _parentId: parentId,
          uiValue,
          uiLabel,
          uiIsValidFormat,
          uiRectangle,
          uiRectanglePercentages,
          uiPosition,
        };
      });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
          lineItemRowsById,
        },
      };
    },
    [actionTypes.RT_LINE_ITEMS_ADD_LINE](state, { payload }) {
      const { sectionFieldId, baseItemId } = payload;

      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];
      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          isAddingNewLine: baseItemId ? false : true,
        },
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
        },
      };
    },
    [actionTypes.RT_LINE_ITEMS_ADD_LINE_FULFILLED](state, { meta }) {
      const { sectionFieldId } = meta;

      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];
      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          isAddingNewLine: false,
        },
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
        },
      };
    },
    [actionTypes.RT_LINE_ITEMS_ADD_LINE_REJECTED](state, { meta }) {
      const { sectionFieldId } = meta;

      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];
      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          isAddingNewLine: false,
        },
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
        },
      };
    },
    [actionTypes.RT_DOCUMENT_SET_SEARCH_BBOX](state, { payload }) {
      const { bboxes } = payload || {};

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          docuSearchBbox: bboxes || [],
        },
      };
    },
    [actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES_START](state, { payload }) {
      const { sectionFieldId } = payload;

      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];
      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          isAddingSimilarLines: true,
        },
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
        },
      };
    },
    [actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES](state, { payload }) {
      const { sectionFieldId } = payload;

      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];
      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          isAddingSimilarLines: true,
        },
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          copiedPage: null,
          fieldsById,
        },
      };
    },
    [actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES_FULFILLED](
      state,
      { meta, payload }
    ) {
      const { sectionFieldId } = meta;
      const {
        responsePayload: { data },
      } = payload;
      const lines = data ? data.lines : [];
      const childrens = lines.find((e) => e.id === sectionFieldId);
      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];
      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          ...childrens,
          isAddingSimilarLines: false,
        },
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES_REJECTED](state, { meta }) {
      const { sectionFieldId } = meta;

      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];
      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          isAddingSimilarLines: false,
        },
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
          grids: state.reviewTool?.grids,
        },
      };
    },
    [actionTypes.ADD_SEARCH_QUERY](state, { payload }) {
      const { query } = payload;
      return {
        ...state,
        searchQuery: query,
      };
    },
    [actionTypes.DOCUMENT_FETCHING_STATUS](state, { payload }) {
      const { status } = payload;
      return {
        ...state,
        docFetchingStatus: status,
      };
    },

    [actionTypes.RT_LINE_ITEMS_DELETE_FIELDS](state, { payload }) {
      const { rowIds } = payload;

      const lineItemRowsById = {
        ...state[REVIEW_TOOL].lineItemRowsById,
      };

      rowIds.forEach((rowId) => {
        if (!lineItemRowsById[rowId]) return;

        lineItemRowsById[rowId].isDeleting = true;
      });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          lineItemRowsById,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_DELETE_FIELDS_FULFILLED](state, { meta }) {
      const { sectionFieldId, rowIds, rowFieldIds, selectedGridId } = meta;

      const sectionField = { ...state[REVIEW_TOOL].fieldsById[sectionFieldId] };

      const footerGridsById = {
        ...state[REVIEW_TOOL].footerGridsById,
      };

      const selectedFooterGrid = footerGridsById[selectedGridId];

      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          lineItemRowIds: _.difference(sectionField.lineItemRowIds, rowIds),
        },
      };

      rowFieldIds.forEach((rowFieldId) => {
        const field = fieldsById[rowFieldId];
        const column = field.label;

        const columnFieldIds = sectionField?.columnFieldIds[column];
        const fieldIndex = columnFieldIds.indexOf(rowFieldId);

        if (fieldIndex !== -1) {
          columnFieldIds.splice(fieldIndex, 1);
        }

        if (_.has(fieldsById, rowFieldId)) {
          delete fieldsById[rowFieldId];
        }

        if (selectedFooterGrid.gridErrorFieldIds.includes(rowFieldId)) {
          selectedFooterGrid.gridErrorFieldIds =
            selectedFooterGrid.gridErrorFieldIds.filter(
              (errorFieldId) => errorFieldId !== rowFieldId
            );
        }

        if (selectedFooterGrid.gridLowConfidenceFieldIds.includes(rowFieldId)) {
          selectedFooterGrid.gridLowConfidenceFieldIds =
            selectedFooterGrid.gridLowConfidenceFieldIds.filter(
              (lowConfidenceFieldId) => lowConfidenceFieldId !== rowFieldId
            );
        }
      });

      const lineItemRowsById = {
        ...state[REVIEW_TOOL].lineItemRowsById,
      };

      rowIds.forEach((rowId) => {
        if (_.has(lineItemRowsById, rowId)) {
          delete lineItemRowsById[rowId];
        }
      });

      const gridConfidenceValue = getGridConfidenceValue(selectedFooterGrid);
      selectedFooterGrid.confidence = gridConfidenceValue;

      selectedFooterGrid.rowIds = selectedFooterGrid.rowIds.filter(
        (rowId) => !rowIds.includes(rowId)
      );

      let currentGridIds = fieldsById[sectionFieldId].gridIds.filter(
        (gridId) => gridId !== selectedGridId
      );

      var currentGridId = selectedGridId;
      if (selectedFooterGrid?.rowIds.length === 0) {
        delete footerGridsById[selectedGridId];
        fieldsById[sectionFieldId] = {
          ...sectionField,
          gridIds: currentGridIds,
        };
        currentGridId = currentGridIds.length > 0 ? currentGridIds[0] : null;
      }

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
          lineItemRowsById,
          footerGridsById,
          selectedGridId: currentGridId,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_DELETE_FIELDS_REJECTED](state, { meta }) {
      const { rowIds } = meta;

      const lineItemRowsById = {
        ...state[REVIEW_TOOL].lineItemRowsById,
      };

      rowIds.forEach((rowId) => {
        if (!lineItemRowsById[rowId]) return;

        lineItemRowsById[rowId].isDeleting = false;
      });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          lineItemRowsById,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_DELETE_ALL_ROWS](state, { payload }) {
      const { sectionFieldId } = payload;

      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];

      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          isDeletingAllRows: true,
        },
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_DELETE_ALL_ROWS_FULFILLED](state, { meta }) {
      const { gridIds, sectionFieldId } = meta;

      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];

      const footerGridsById = { ...state[REVIEW_TOOL].footerGridsById };
      const lineItemRowsById = {
        ...state[REVIEW_TOOL].lineItemRowsById,
      };

      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
      };

      //Removing lineItemRowId and fieldId of respective field
      sectionField.lineItemRowIds.forEach((rowId) => {
        lineItemRowsById[rowId].fieldIds.forEach((fieldId) => {
          delete fieldsById[fieldId];
        });
        delete lineItemRowsById[rowId];
      });

      fieldsById[sectionFieldId] = {
        ...sectionField,
        gridIds: [],
        lineItemRowIds: [],
        columnFieldIds: {},
        isDeletingAllRows: false,
      };

      //Removing gridId from footersGridById
      gridIds.forEach((gridId) => {
        delete footerGridsById[gridId];
      });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          lineItemRowsById,
          footerGridsById,
          fieldsById,
          selectedLineItemRowId: null,
          selectedGridId: null,
          selectedFieldId: null,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_DELETE_ALL_ROWS_REJECTED](state, { meta }) {
      const { sectionFieldId } = meta;

      const sectionField = state[REVIEW_TOOL].fieldsById[sectionFieldId];

      const fieldsById = {
        ...state[REVIEW_TOOL].fieldsById,
        [sectionFieldId]: {
          ...sectionField,
          isDeletingAllRows: false,
        },
      };

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById,
        },
      };
    },

    [actionTypes.RT_REMOVE_DOCUMENT_FROM_STACK](state, { payload }) {
      const docId = _.get(payload, 'docId');

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          documentIds: _.without(state[REVIEW_TOOL].documentIds, docId),
        },
      };
    },
    [actionTypes.RT_REMOVE_SPREADSHEET_FROM_STACK](state, { payload }) {
      const docId = _.get(payload, 'docId');

      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          documentIds: _.without(state[EXCEL_TOOL].documentIds, docId),
        },
      };
    },
    [actionTypes.RT_START_DOCUMENT_REVIEW](state, { payload }) {
      const docId = _.get(payload, 'docId');

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          startingReviewForDocId: docId,
        },
      };
    },
    [actionTypes.RT_START_DOCUMENT_REVIEW_FULFILLED](state, { payload, meta }) {
      const docId = _.get(meta, 'docId');
      const data = _.get(payload.responsePayload, 'data', {
        document: {},
      });
      const status = data.document.status || 'reviewing';

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          startingReviewForDocId: null,
          documentsById: {
            ...state[REVIEW_TOOL].documentsById,
            [docId]: {
              ...state[REVIEW_TOOL].documentsById[docId],
              status: status || state[REVIEW_TOOL].documentsById[docId].status,
            },
          },
        },
      };
    },
    [actionTypes.RT_START_DOCUMENT_REVIEW_REJECTED](state) {
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          startingReviewForDocId: null,
        },
      };
    },
    [actionTypes.RT_START_DOCUMENT_EXCEL_VIEW_FULFILLED](
      state,
      { payload, meta }
    ) {
      const docId = _.get(meta, 'docId') || _.get(payload, 'docId');
      const data = _.get(payload.responsePayload, 'data', {
        document: {},
      });
      const status = data.document.status || 'reviewing';
      const sections = _.get(payload, 'sections.sections');
      const rawData = state.excelTool.excelData[0];
      let newExcelData = [rawData, ...sections];
      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          excelData: newExcelData,
          startingReviewForDocId: null,
          documentsById: {
            ...state[EXCEL_TOOL].documentsById,
            [docId]: {
              ...state[EXCEL_TOOL].documentsById[docId],
              status: status || state[EXCEL_TOOL].documentsById[docId].status,
            },
          },
        },
      };
    },
    [actionTypes.RT_START_DOCUMENT_EXCEL_VIEW_REJECTED](state) {
      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          startingReviewForDocId: null,
        },
      };
    },
    [actionTypes.RT_FINISH_DOCUMENT_REVIEW](state, { payload }) {
      const docId = _.get(payload, 'docId');

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          finishingReviewForDocId: docId,
        },
      };
    },

    [actionTypes.RT_SET_CURRENT_GRID_ID](state, { payload }) {
      const gridId = payload?.gridId;
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          selectedGridId: gridId,
        },
      };
    },

    [actionTypes.RT_FINISH_DOCUMENT_REVIEW_FULFILLED](state, { payload }) {
      const docId = _.get(payload, 'docId');
      const data = _.get(payload.responsePayload, 'data', {
        document: {},
      });
      const status = data.document.status || 'processed';

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          finishingReviewForDocId: null,
          documentsById: {
            ...state[REVIEW_TOOL].documentsById,
            [docId]: {
              ...state[REVIEW_TOOL].documentsById[docId],
              status: status || state[REVIEW_TOOL].documentsById[docId].status,
            },
          },
        },
      };
    },
    [actionTypes.RT_FINISH_DOCUMENT_EXCEL_VIEW_FULFILLED](state, { payload }) {
      const docId = _.get(payload, 'docId');
      // const data = _.get(payload.responsePayload, 'data', { document : {} });
      const status = 'processed';

      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          finishingReviewForDocId: null,
          documentsById: {
            ...state[EXCEL_TOOL].documentsById,
            [docId]: {
              ...state[EXCEL_TOOL].documentsById[docId],
              status: status || state[EXCEL_TOOL].documentsById[docId].status,
            },
          },
        },
      };
    },
    [actionTypes.RT_SAVE_SPREADSHEET_FULFILLED](state, { payload }) {
      const sections = _.get(payload, 'sections.sections');
      const rawData = state.excelTool.excelData[0];
      let newExcelData = [rawData, ...sections];
      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          excelData: newExcelData,
        },
      };
    },

    [actionTypes.RT_LINE_ITEM_DROP_DOWN_FETCH_FULLFILLED](state, { payload }) {
      const docId = _.get(payload, 'docId');
      const sections = _.get(payload, 'sections');
      const document = state[REVIEW_TOOL].documentsById[docId];
      const { width: docWidth, height: docHeight } = document;

      const {
        sectionIds,
        sectionsById,
        fieldsById,
        sectionFieldIds,
        lineItemRowsById,
        lineItemId,
        footerGridsById,
      } = transformToReviewToolData({ sections, docWidth, docHeight });
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          finishingReviewForDocId: null,
          sectionIds,
          sectionsById,
          fieldsById,
          sectionFieldIds,
          lineItemRowsById,
          lineItemId,
          footerGridsById,
        },
      };
    },

    [actionTypes.RT_FINISH_DOCUMENT_REVIEW_REJECTED](state, { payload }) {
      const docId = _.get(payload, 'docId');
      const sections = _.get(payload.error.responsePayload.data, 'sections');

      const document = state[REVIEW_TOOL].documentsById[docId];
      const { width: docWidth, height: docHeight } = document;

      const {
        sectionIds,
        sectionsById,
        fieldsById,
        sectionFieldIds,
        lineItemRowsById,
        lineItemId,
      } = transformToReviewToolData({ sections, docWidth, docHeight });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          finishingReviewForDocId: null,
          sectionIds,
          sectionsById,
          fieldsById,
          sectionFieldIds,
          lineItemRowsById,
          lineItemId,
        },
      };
    },

    [actionTypes.RT_RETRY_VALIDATION](state, { payload }) {
      const docId = _.get(payload, 'docId');
      const sections = _.get(payload.response.responsePayload.data, 'sections');

      const document = state[REVIEW_TOOL].documentsById[docId];
      const { width: docWidth, height: docHeight } = document;

      const {
        sectionIds,
        sectionsById,
        fieldsById,
        sectionFieldIds,
        lineItemRowsById,
        lineItemId,
      } = transformToReviewToolData({ sections, docWidth, docHeight });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          finishingReviewForDocId: null,
          sectionIds,
          sectionsById,
          fieldsById,
          sectionFieldIds,
          lineItemRowsById,
          lineItemId,
        },
      };
    },
    [actionTypes.RT_FORCE_FINISH_DOCUMENT_REVIEW](state, { payload }) {
      const docId = _.get(payload, 'docId');

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          forceFinishingReviewForDocId: docId,
        },
      };
    },
    [actionTypes.RT_FORCE_FINISH_DOCUMENT_REVIEW_FULFILLED](
      state,
      { payload }
    ) {
      const docId = _.get(payload, 'docId');
      const data = _.get(payload.responsePayload, 'data', {
        document: {},
      });
      const status = data.document.status || 'processed';

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          forceFinishingReviewForDocId: null,
          documentsById: {
            ...state[REVIEW_TOOL].documentsById,
            [docId]: {
              ...state[REVIEW_TOOL].documentsById[docId],
              status: status || state[REVIEW_TOOL].documentsById[docId].status,
            },
          },
        },
      };
    },
    [actionTypes.RT_FORCE_FINISH_DOCUMENT_REVIEW_REJECTED](state) {
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          forceFinishingReviewForDocId: null,
        },
      };
    },

    [actionTypes.RT_SKIP_DOCUMENT_REVIEW](state, { payload }) {
      const docId = _.get(payload, 'docId');

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          skippingReviewForDocId: docId,
        },
      };
    },
    [actionTypes.RT_SKIP_DOCUMENT_REVIEW_FULFILLED](state, { payload }) {
      const docId = _.get(payload, 'docId');
      const data = _.get(payload.responsePayload, 'data', {
        document: {},
      });
      const status = data.document.status || null;

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          skippingReviewForDocId: null,
          documentsById: {
            ...state[REVIEW_TOOL].documentsById,
            [docId]: {
              ...state[REVIEW_TOOL].documentsById[docId],
              status: status || state[REVIEW_TOOL].documentsById[docId].status,
            },
          },
        },
      };
    },
    [actionTypes.RT_SKIP_DOCUMENT_REVIEW_REJECTED](state) {
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          skippingReviewForDocId: null,
        },
      };
    },
    [actionTypes.RT_SET_SELECTED_FIELD_ID](state, { payload }) {
      const {
        sectionFieldId,
        lineItemRowId,
        fieldId,
        lineItemFooterBtn,
        sectionId,
        gridId,
      } = payload;

      const newReviewToolState = {
        ...state[REVIEW_TOOL],
      };

      if (!_.isUndefined(sectionFieldId)) {
        newReviewToolState.selectedSectionFieldId = sectionFieldId;
      }

      if (!_.isUndefined(lineItemRowId)) {
        newReviewToolState.selectedLineItemRowId = lineItemRowId;
      }

      if (!_.isUndefined(fieldId)) {
        newReviewToolState.selectedFieldId = fieldId;
      }

      if (!_.isUndefined(gridId)) {
        newReviewToolState.selectedGridId = gridId;
      }

      newReviewToolState.selectedSectionId = sectionId || null;
      // Button value has to be set explicitly
      newReviewToolState.selectedLineItemFooterBtn = lineItemFooterBtn || null;
      return {
        ...state,
        [REVIEW_TOOL]: newReviewToolState,
      };
    },

    [actionTypes.RT_UPDATE_FIELD_DATA](state, { payload }) {
      const { fieldId, updates } = payload;

      const now = _.now();

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              ...updates,
              uiLastDataUpdate: now,
            },
          },
        },
      };
    },
    [actionTypes.RT_FIELD_DATA_PERSISTANCE_START](state, { payload }) {
      const { docId, fieldId } = payload;

      if (docId !== state[REVIEW_TOOL].docId) {
        return state;
      }

      const field = state[REVIEW_TOOL].fieldsById[fieldId];
      if (!field) {
        return state;
      }

      const now = _.now();
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              uiLastPersistAttempt: now,
              errorMessage: null,
            },
          },
        },
      };
    },
    [actionTypes.RT_FIELD_DATA_PERSISTANCE_FULFILLED](state, { payload }) {
      const { docId, fieldId, response, selectedLineItemRowId } = payload;

      const {
        lineItemRowsById,
        footerGridsById,
        docId: stateDocId,
        fieldsById,
      } = state[REVIEW_TOOL];

      if (docId !== stateDocId) {
        return state;
      }

      const field = fieldsById[fieldId];
      if (!field) {
        return state;
      }

      const data = _.get(response.responsePayload, 'data', {});
      const lowConfidence = _.get(data, 'item.lowConfidence', false);
      const formatMessage = _.get(data, 'item.formatMessage', '');
      const uiIsValidFormat = _.get(data, 'item.content.isValidFormat', '');
      const content = _.get(data, 'item.content', fieldsById[fieldId].content);
      const now = _.now();

      let newLineItemRowsById = { ...lineItemRowsById };
      let newFooterGridsById = { ...footerGridsById };

      let parentField = null;

      if (selectedLineItemRowId) {
        const updatedSelectedRow = {
          ...lineItemRowsById[selectedLineItemRowId],
        };

        const selectedGridId = updatedSelectedRow.gridId;

        const updatedSelectedFooterGrid = {
          ...footerGridsById[selectedGridId],
        };

        const parentId = data?.item?.subPId;

        if (parentId && fieldsById[parentId]) {
          parentField = { ...fieldsById[parentId] };
          const columnName = data?.item?.label;

          let columnFieldIds = parentField.columnFieldIds[columnName];
          const fieldIndex = columnFieldIds.indexOf(fieldId);

          // Updating columnFieldIds data on parent
          if (data?.item?.content?.value) {
            if (fieldIndex === -1) {
              columnFieldIds.push(fieldId);
            }
          } else {
            if (fieldIndex !== -1) {
              columnFieldIds = columnFieldIds.splice(fieldIndex, 1);
            }
          }
        }

        /**
         * Adding and removing errorFieldIds and lowConfidenceFieldIds based upon api response on lineItemRowId and footerGridsById
         */
        if (!uiIsValidFormat) {
          if (!updatedSelectedRow.errorFieldIds.includes(fieldId)) {
            updatedSelectedRow.errorFieldIds.push(fieldId);
            updatedSelectedFooterGrid.gridErrorFieldIds.push(fieldId);
          }
        } else {
          if (updatedSelectedRow.errorFieldIds.includes(fieldId)) {
            updatedSelectedRow.errorFieldIds =
              updatedSelectedRow.errorFieldIds.filter(
                (errorFieldId) => fieldId !== errorFieldId
              );
            updatedSelectedFooterGrid.gridErrorFieldIds =
              updatedSelectedFooterGrid.gridErrorFieldIds.filter(
                (errorFieldId) => fieldId !== errorFieldId
              );
          }
        }

        if (lowConfidence) {
          if (!updatedSelectedRow.lowConfidenceFieldIds.includes(fieldId)) {
            updatedSelectedRow.lowConfidenceFieldIds.push(fieldId);
            updatedSelectedFooterGrid.gridLowConfidenceFieldIds.push(fieldId);
          }
        } else {
          if (updatedSelectedRow.lowConfidenceFieldIds.includes(fieldId)) {
            updatedSelectedRow.lowConfidenceFieldIds =
              updatedSelectedRow.lowConfidenceFieldIds.filter(
                (lowConfidenceId) => fieldId !== lowConfidenceId
              );

            updatedSelectedFooterGrid.gridLowConfidenceFieldIds =
              updatedSelectedFooterGrid.gridLowConfidenceFieldIds.filter(
                (lowConfidenceId) => fieldId !== lowConfidenceId
              );
          }
        }

        // Updating confidence value on selected grid
        const gridConfidenceValue = getGridConfidenceValue(
          updatedSelectedFooterGrid
        );
        updatedSelectedFooterGrid.confidence = gridConfidenceValue;

        newLineItemRowsById[selectedLineItemRowId] = updatedSelectedRow;
        newFooterGridsById[selectedGridId] = updatedSelectedFooterGrid;
      }

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          lineItemRowsById: newLineItemRowsById,
          footerGridsById: newFooterGridsById,
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            ...(parentField ? { [parentField.id]: parentField } : {}),

            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              content,
              lowConfidence,
              formatMessage,
              uiValue: content.value,
              uiLastPersistSuccess: now,
              uiIsValidFormat,

              lastUpdated: {
                // tracking for Undo action
                lastUpdatedValue: content.value,
                lastUpdatedPosition: content.position,
                lastUpdatedFormatValidation: content.isValidFormat,
              },
            },
          },
        },
      };
    },
    [actionTypes.RT_REAL_TIME_UPDATE_FULFILLED](state, { payload }) {
      const { docId, fieldId, item } = payload;

      if (docId !== state[REVIEW_TOOL].docId) {
        return state;
      }

      const field = state[REVIEW_TOOL].fieldsById[fieldId];
      if (!field) {
        return state;
      }

      const lowConfidence = item[0].lowConfidence || false;
      const formatMessage = item[0].formatMessage || '';
      const uiIsValidFormat = item[0].content.isValidFormat || '';
      const content =
        item[0].content || state[REVIEW_TOOL].fieldsById[fieldId].content;
      const now = _.now();
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              content,
              lowConfidence,
              formatMessage,
              uiValue: content.value,
              uiLastPersistSuccess: now,
              uiIsValidFormat,
            },
          },
        },
      };
    },

    [actionTypes.RT_UPDATE_GRID_DATA](state, { payload }) {
      let { grids = [] } = payload;

      const gridsByPage = {};
      let isGridEdited = false;
      let copiedPage;
      if (_.has(payload, 'copiedPage')) {
        copiedPage = payload.copiedPage;
      }

      grids = sortGrids(grids);

      if (grids.length) {
        grids.forEach((grid, index) => {
          gridsByPage[grid.page + 1] = [
            ...(gridsByPage[grid.page + 1] || []),
            index,
          ];
        });
      }

      isGridEdited =
        _.some(grids, (item) => item.is_edited) ||
        grids.length !== state?.reviewTool?.originalGrids?.length;

      const awsGrids = state.reviewTool?.gridBboxesByID;
      Object.entries(awsGrids).forEach(([key, value]) => {
        const isOverlapped = isGridOverlapped([...grids, value]);
        awsGrids[key] = { ...value, isOverlapped };
      });

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          grids,
          gridsByPage,
          isGridEdited,
          gridBboxesByID: awsGrids,
          ...(copiedPage !== undefined && { copiedPage }),
        },
      };
    },

    [actionTypes.RT_FIELD_DATA_PERSISTANCE_REJECTED](state, { payload }) {
      const {
        fieldId,
        error: {
          responsePayload: { message },
        },
      } = payload;
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              errorMessage: message,
            },
          },
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_MANAGE_GRID](state, { payload }) {
      const { parentId, method, pid } = payload;
      let headers = state[REVIEW_TOOL].sectionsById[pid];
      headers = headers
        ? headers.children.find((item) => item.id === parentId)
        : null;
      headers = headers ? headers.lineItemColumns : [];
      headers = headers && headers.length ? headers.map((e) => e.label) : [];
      const gridFetching = ['POST', 'DELETE', 'TAG', 'GET'].includes(method);
      const multiGrids = ['SIMILAR_LINE'].includes(method);
      const updatedRow = ['PUT', 'PASTE', 'SIMILAR_LINE'].includes(method);
      const isPastingGrid = method === 'PASTE' ? true : false;

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          gridFetching: gridFetching,
          extractingMultiPage: multiGrids,
          updatedRow,
          gridHeadersById: {
            [parentId]: headers,
          },
          isPastingGrid,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_MANAGE_GRID_FULFILLED](state, { payload }) {
      let { data: grids, isNewGrid, extractSimilarLines } = payload;

      const gridsByPage = {};

      grids =
        grids && grids.length
          ? grids.map((grid, index) => {
              const { top_left = [], bottom_right = [], ...rest } = grid;
              const [x1, y1] = top_left;
              const [x2, y2] = bottom_right;
              const position = [x1, y1, x2, y2];

              const gridData = {
                ...rest,
                staticId: !!isNewGrid,
                topLeft: top_left,
                bottomRight: bottom_right,
                position,
              };
              return gridData;
            })
          : [];

      grids =
        isNewGrid || extractSimilarLines
          ? sortGrids([...state?.reviewTool?.grids, ...grids])
          : grids;

      grids = extractSimilarLines ? findNonOverlappingGrids(grids) : grids;

      if (grids?.length) {
        grids.forEach((grid, index) => {
          gridsByPage[grid.page + 1] = [
            ...(gridsByPage[grid.page + 1] || []),
            index,
          ];
        });
      }

      const awsGrids = state.reviewTool?.gridBboxesByID;
      Object.entries(awsGrids).forEach(([key, value]) => {
        const isOverlapped = isGridOverlapped([...grids, value]);
        awsGrids[key] = { ...value, isOverlapped };
      });

      let mainPosition = {};
      if (grids?.length > 0) {
        const { columns, rows, bottomRight } = grids[0];
        let xfinal = bottomRight[0];
        let yfinal = bottomRight[1];
        let positions = [];
        for (let i = 0; i < columns?.length; i++) {
          let position = [];
          let header = columns[i].header;
          if (i !== columns.length - 1) {
            for (let j = 0; j < rows.length; j++) {
              if (j !== rows.length - 1) {
                let xone = columns[i].x;
                let yone = rows[j].y;
                let xtwo = columns[i + 1].x;
                let ytwo = rows[j + 1].y;
                positions = [xone, yone, xtwo, ytwo];
                position.push(positions);
              } else {
                let xone = columns[i].x;
                let yone = rows[j].y;
                let xtwo = columns[i + 1].x;
                let ytwo = yfinal;
                positions = [xone, yone, xtwo, ytwo];
                position.push(positions);
              }
            }
          } else {
            for (let j = 0; j < rows.length; j++) {
              if (j !== rows.length - 1) {
                let xone = columns[i].x;
                let yone = rows[j].y;
                let xtwo = xfinal;
                let ytwo = rows[j + 1].y;
                positions = [xone, yone, xtwo, ytwo];
                position.push(positions);
              } else {
                let xone = columns[i].x;
                let yone = rows[j].y;
                let xtwo = xfinal;
                let ytwo = yfinal;
                positions = [xone, yone, xtwo, ytwo];
                position.push(positions);
              }
            }
          }
          mainPosition[header] = position;
        }
      }

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          gridBboxesByID: awsGrids,
          grids,
          originalGrids: isNewGrid
            ? state?.reviewTool?.originalGrids
            : _.cloneDeep(grids),
          updatedRow: false,
          mainGridPosition: mainPosition,
          extractingMultiPage: false,
          gridFetching: false,
          isPastingGrid: false,
          gridsByPage: gridsByPage,
          isGridEdited: !!isNewGrid,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_MANAGE_GRID_REJECTED](state) {
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          gridFetching: false,
          extractingMultiPage: false,
          updatedRow: false,
          isPastingGrid: false,
        },
      };
    },

    [actionTypes.RT_EXTRACT_SIMILAR_TABLES_REJECTED](state) {
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          gridFetching: false,
          extractingMultiPage: false,
          updatedRow: false,
          isPastingGrid: false,
        },
      };
    },

    [actionTypes.RT_LINE_ITEMS_EXTRACT_GRID_DATA_FULFILLED](state) {
      return {
        ...state,
      };
    },

    [actionTypes.RT_LINE_ITEMS_EXTRACT_GRID_DATA_REJECTED](state) {
      return {
        ...state,
      };
    },

    [actionTypes.SET_ALL_SELECTION_TYPE_WISE](state, { payload }) {
      const { uid, checked, clearAll = false } = payload;
      const { globalMyDocumentCounts } = state;
      const { documentIds = [], slectedList = [] } =
        state[`${uid}DocumentsPage`];

      let allSelected = [];
      if (clearAll) {
        allSelected = [];
      } else {
        if (checked) {
          // add ids from current page to existing selected list
          const selections = [...slectedList, ...documentIds];
          allSelected = [...new Set(selections)];
        } else {
          // remove the ids from current page from existing selected list
          allSelected = slectedList.filter(
            (item) => !documentIds.includes(item)
          );
        }
      }
      return {
        ...state,
        [`${uid}DocumentsPage`]: {
          ...state[`${uid}DocumentsPage`],
          selectedAll:
            allSelected.length === globalMyDocumentCounts[uid] ? true : false,
          slectedList: [...allSelected],
        },
      };
    },

    [actionTypes.SET_CHECK_SELECTION_TYPE_WISE](state, { payload }) {
      const { uid, checked = [] } = payload;
      const { documentIds = [] } = state[`${uid}DocumentsPage`];
      return {
        ...state,
        [`${uid}DocumentsPage`]: {
          ...state[`${uid}DocumentsPage`],
          slectedList: checked,
          selectedAll: !!(
            checked.length && documentIds.length === checked.length
          ),
        },
      };
    },

    [actionTypes.STORE_CLICKED_FOLDER_INFO_FULLFIED](state, { payload }) {
      const { selectedFolderData } = payload;
      return {
        ...state,
        selectedFolderData,
      };
    },
    [actionTypes.SET_FOLDERID](state, { payload }) {
      const newFolderId = _.get(payload, 'newFolderId');
      return {
        ...state,
        newFolderId,
      };
    },

    [actionTypes.STORE_CLICKED_FOLDER_ID](state, { payload }) {
      const { selectedFolderId } = payload;
      return {
        ...state,
        selectedFolderId,
      };
    },

    [actionTypes.STORE_SPLIT_DOCUMENT_ID](state, { payload }) {
      const { currentSplitDocId } = payload;
      return {
        ...state,
        currentSplitDocId,
      };
    },
    [actionTypes.STORE_ROOT_SPLIT_DOCUMENT_ID](state, { payload }) {
      const { currentRootSplitDocId } = payload;
      return {
        ...state,
        currentRootSplitDocId,
      };
    },
    [actionTypes.HANDLE_SPREADSHEET_VIEW](state, { payload }) {
      const { openSpreadsheetView } = payload;
      return {
        ...state,
        openSpreadsheetView,
      };
    },

    [actionTypes.UPDATE_REVIEW_DOCUMENT_ID](state, { payload }) {
      const { documentIds } = payload;
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          documentIds,
        },
      };
    },
    [actionTypes.UPDATE_EXCEL_REVIEW_DOCUMENT_ID](state, { payload }) {
      const { documentIds } = payload;
      return {
        ...state,
        [EXCEL_TOOL]: {
          ...state[EXCEL_TOOL],
          documentIds,
        },
      };
    },
    [actionTypes.RT_DROP_DOWN_FETCH_FULLFILLED](state, { payload }) {
      const { ddObject } = state;
      const { ddValue } = payload;
      return {
        ...state,
        ddObject: {
          ...ddObject,
          ...ddValue,
        },
      };
    },

    [actionTypes.RT_DROP_DOWN_MAP_FETCH_FULLFILLED](state, { payload }) {
      const { ddObject } = state;
      const { ddMap } = payload;
      return {
        ...state,
        ddObject: {
          ...ddObject,
          ...ddMap,
        },
      };
    },

    [actionTypes.RT_DROP_DOWN_SORT_WITH_GRID_HEADER](state, { payload }) {
      const { sortedOptions } = payload;
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          sortedColumnOptions: sortedOptions,
        },
      };
    },

    [actionTypes.SET_EDIT_DOC_ID](state, { payload }) {
      const { docId } = payload;
      return {
        ...state,
        currentEditId: docId,
      };
    },

    [actionTypes.RESET_EDIT_DOC_ID](state) {
      return {
        ...state,
        currentEditId: '',
      };
    },

    [actionTypes.SET_EDIT_DOC_ID](state, { payload }) {
      const { docId } = payload;
      return {
        ...state,
        currentEditId: docId,
      };
    },

    [actionTypes.UPDATE_DOC_NAME](state, { payload }) {
      const { documentsById } = state;
      const { docId, name } = payload;

      let editedDoc = documentsById[docId];

      if (editedDoc.displayType === 'folder') {
        editedDoc.folderName = name;
      } else {
        editedDoc.title = name;
      }

      return {
        ...state,
        documentsById: { ...documentsById, editedDoc },
      };
    },

    [actionTypes.RT_SET_COPIED_PAGE](state, { payload }) {
      const copiedPage = _.get(payload, 'copiedPage');
      const copiedGridId = _.get(payload, 'copiedGridId');

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          copiedPage,
          copiedGridId,
        },
      };
    },
    [actionTypes.RT_HANDLE_GRID_DRAG](state, { payload }) {
      const isDragging = _.get(payload, 'isDragging');

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          isDragging,
        },
      };
    },
    [actionTypes.RT_SHOW_FIRST_REVIEW_COMPLETE_MODAL](state, { payload }) {
      const { showFirstReviewCompleteModal } = payload;

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          showFirstReviewCompleteModal,
        },
      };
    },
    [actionTypes.UPLOAD_SAMPLE_DOC_TYPE](state, { payload }) {
      const { docType } = payload;

      return {
        ...state,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          uploadSampleDocType: docType,
        },
      };
    },
    [actionTypes.SET_HIGHLIGHTED_DOCUMENT_TYPE](state, { payload }) {
      const { docType } = payload;

      return {
        ...state,
        [ALL_DOCUMENTS_TYPE_PAGE]: {
          ...state[ALL_DOCUMENTS_TYPE_PAGE],
          highlightedDocumentType: docType,
        },
      };
    },

    [actionTypes.UPDATE_REVIEW_DOCUMENTS_CHATAI_BBOXES](state, { payload }) {
      const { bboxes } = payload;

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          chatAIBboxes: bboxes,
        },
      };
    },

    [actionTypes.UPDATE_COLLAPSED_SECTION_IDS](state, { payload }) {
      const { collapsedSectionIds } = payload;

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          collapsedSectionIds: collapsedSectionIds,
        },
      };
    },

    [actionTypes.SET_ACTIVE_SIDEBAR_TAB](state, { payload }) {
      return {
        ...state,
        activeSidebarTab: payload,
      };
    },

    /**
     * Optimistic updates for field data type change behaviour on frontend
     *
     * used prevDataType parameter to store old dataType value to revert changes if api calls fails
     */
    [actionTypes.CHANGE_FIELD_TYPE](state, { payload }) {
      const {
        fieldId,
        data: { data_type },
      } = payload;

      let updatedField = {
        ...state[REVIEW_TOOL].fieldsById[fieldId],
        prevDataType: state[REVIEW_TOOL].fieldsById[fieldId].type,
        type: data_type,
      };

      if (data_type === 'line_item') {
        updatedField = {
          ...updatedField,
          lineItemColumns: [],
          lineItemRowIds: [],
        };
      }

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: updatedField,
          },
        },
      };
    },

    [actionTypes.CHANGE_FIELD_TYPE_FULFILLED](state, { payload, meta }) {
      const { fieldId, uiValue = '', updateFromSettings = false } = meta;
      const responseFieldData = payload?.data;

      let newFields = {};
      let updatedField = {
        ...state[REVIEW_TOOL].fieldsById[fieldId],
        format: responseFieldData[0]?.format,
        type: updateFromSettings
          ? uiValue
          : state[REVIEW_TOOL]?.fieldsById[fieldId]?.type,
        prevDataType: null,
      };

      if (
        Array.isArray(responseFieldData) &&
        responseFieldData[0]?.type === 'line_item' &&
        responseFieldData[0]?.children.length
      ) {
        payload.data[0].children.forEach((field) => {
          newFields = {
            ...newFields,
            [field.id]: transformColumnFieldsData({
              field: field,
              parentId: fieldId,
              parentType: 'line_item_section_field',
            }),
          };
        });
        updatedField.lineItemColumns = responseFieldData[0].children;
        updatedField.lineItemRowIds = [];
      }

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: updatedField,
            ...newFields,
          },
        },
      };
    },

    /**
     * Reverting back the field dataType to previous data type
     */
    [actionTypes.CHANGE_FIELD_TYPE_REJECTED](state, { meta }) {
      const { fieldId } = meta;

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: {
            ...state[REVIEW_TOOL].fieldsById,
            [fieldId]: {
              ...state[REVIEW_TOOL].fieldsById[fieldId],
              prevDataType: null,
              type: state[REVIEW_TOOL].fieldsById[fieldId].prevDataType,
            },
          },
        },
      };
    },

    /**
     * Optimistic updates for field data order change behaviour on frontend
     *
     * used prevLineItemColumns and prevFieldIds parameter to store old order value to revert changes if api calls fails
     */
    [actionTypes.CHANGE_FIELD_ORDER](state, { payload }) {
      const {
        dragResult,
        data: { sub_p_id },
      } = payload;

      const { destination, source, draggableId } = dragResult;

      const tableId = Number(sub_p_id);
      let updatedFieldsById = { ...state[REVIEW_TOOL].fieldsById };
      let updatedSectionsById = { ...state[REVIEW_TOOL].sectionsById };

      //Table column drag and drop
      if (tableId) {
        const field = state[REVIEW_TOOL].fieldsById[tableId];

        const updatesLineItemColumns = [...field.lineItemColumns];

        updatesLineItemColumns.splice(
          destination.index,
          0,
          updatesLineItemColumns.splice(source.index, 1)[0]
        );

        updatedFieldsById = {
          ...updatedFieldsById,
          [tableId]: {
            ...field,
            prevLineItemColumns: field.lineItemColumns,
            lineItemColumns: updatesLineItemColumns,
          },
        };
      } else {
        //Field drag and drop
        if (source.droppableId === destination.droppableId) {
          // Drag within same section
          const section = updatedSectionsById[Number(source.droppableId)];
          const updatedFieldIds = [...section.fieldIds];

          updatedFieldIds.splice(
            destination.index,
            0,
            updatedFieldIds.splice(source.index, 1)[0]
          );

          updatedSectionsById = {
            ...updatedSectionsById,
            [section.id]: {
              ...section,
              prevFieldIds: section.fieldIds,
              fieldIds: updatedFieldIds,
            },
          };
        } else {
          //Addition of new field on destination
          const destinationSection =
            updatedSectionsById[Number(destination.droppableId)];
          const updatedDestinationFieldIds = [...destinationSection.fieldIds];

          updatedDestinationFieldIds.splice(
            destination.index,
            0,
            Number(draggableId)
          );

          //Removal of new field on source
          const sourceSection = updatedSectionsById[Number(source.droppableId)];
          const updatedSourceFieldIds = [...sourceSection.fieldIds];

          updatedSourceFieldIds.splice(source.index, 1);

          updatedSectionsById = {
            ...updatedSectionsById,
            [destinationSection.id]: {
              ...destinationSection,
              prevFieldIds: destinationSection.fieldIds,
              fieldIds: updatedDestinationFieldIds,
            },
            [sourceSection.id]: {
              ...sourceSection,
              prevFieldIds: sourceSection.fieldIds,
              fieldIds: updatedSourceFieldIds,
            },
          };
        }
      }

      //reordering focus
      const updatedSectionFieldIds = Object.values(updatedSectionsById)
        .map((field) =>
          field.fieldIds.filter(
            (fieldId) => !updatedFieldsById[fieldId]?.isHidden
          )
        )
        .flat();

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: updatedFieldsById,
          sectionsById: updatedSectionsById,
          sectionFieldIds: updatedSectionFieldIds,
        },
      };
    },

    /**
     * Updates to remove sections from sectionIds and sectionsById if api call succeds and sections did not have any fieldIds
     */
    [actionTypes.CHANGE_FIELD_ORDER_FULFILLED](state, { meta }) {
      const {
        dragResult,
        data: { sub_p_id },
      } = meta;

      const { destination, source } = dragResult;

      const tableId = Number(sub_p_id);
      let updatedSectionsById = { ...state[REVIEW_TOOL].sectionsById };
      let updatedSectionIds = [...state[REVIEW_TOOL].sectionIds];

      const sourceSection = updatedSectionsById[Number(source.droppableId)];

      //Remove section from sectionsById and sctionIds if source section has no field
      if (
        !tableId &&
        source.droppableId !== destination.droppableId &&
        sourceSection.fieldIds.length === 0
      ) {
        delete updatedSectionsById[Number(source.droppableId)];

        const sectionIndex = updatedSectionIds.findIndex(
          (sectionId) => sectionId === Number(source.droppableId)
        );

        updatedSectionIds.splice(sectionIndex, 1);
      }

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          sectionsById: updatedSectionsById,
          sectionIds: updatedSectionIds,
        },
      };
    },

    /**
     * Reverting back the field order to previous order
     */
    [actionTypes.CHANGE_FIELD_ORDER_REJECTED](state, { meta }) {
      const {
        data: { sub_p_id },
        dragResult,
      } = meta;

      const { destination, source } = dragResult;

      const tableId = Number(sub_p_id);
      let updatedFieldsById = { ...state[REVIEW_TOOL].fieldsById };
      let updatedSectionsById = { ...state[REVIEW_TOOL].sectionsById };

      if (tableId) {
        updatedFieldsById = {
          ...updatedFieldsById,
          [tableId]: {
            ...updatedFieldsById[tableId],
            prevLineItemColumns: null,
            lineItemColumns: updatedFieldsById[tableId].prevLineItemColumns,
          },
        };
      } else {
        if (source.droppableId === destination.droppableId) {
          updatedSectionsById = {
            ...updatedSectionsById,
            [destination.droppableId]: {
              ...updatedSectionsById[destination.droppableId],
              prevFieldIds: null,
              fieldIds:
                updatedSectionsById[destination.droppableId].prevFieldIds,
            },
          };
        } else {
          updatedSectionsById = {
            ...updatedSectionsById,
            [destination.droppableId]: {
              ...updatedSectionsById[destination.droppableId],
              prevFieldIds: null,
              fieldIds:
                updatedSectionsById[destination.droppableId].prevFieldIds,
            },
            [source.droppableId]: {
              ...updatedSectionsById[source.droppableId],
              prevFieldIds: null,
              fieldIds: updatedSectionsById[source.droppableId].prevFieldIds,
            },
          };
        }
      }

      //reordering focus
      const updatedSectionFieldIds = Object.values(updatedSectionsById)
        .map((field) =>
          field.fieldIds.filter(
            (fieldId) => !updatedFieldsById[fieldId]?.isHidden
          )
        )
        .flat();

      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          fieldsById: updatedFieldsById,
          sectionsById: updatedSectionsById,
          sectionFieldIds: updatedSectionFieldIds,
        },
      };
    },

    /**
     * Show field loader on add and edit operation
     */
    [actionTypes.SET_LOADING_FIELD_ID](state, { payload }) {
      return {
        ...state,
        [EDIT_FIELDS]: {
          ...state[EDIT_FIELDS],
          loadingFieldId: payload.id,
        },
      };
    },

    /**
     * Hide field loader on add and edit operation
     */
    [actionTypes.RESET_LOADING_FIELD_ID](state) {
      return {
        ...state,
        [EDIT_FIELDS]: {
          ...state[EDIT_FIELDS],
          loadingFieldId: '',
        },
      };
    },

    [actionTypes.SET_EDIT_FIELD_CHANGES](state, { payload }) {
      return {
        ...state,
        [EDIT_FIELDS]: {
          ...state[EDIT_FIELDS],
          editFieldChanges: payload,
        },
      };
    },

    [actionTypes.CHANGE_DATA_TYPE_FROM_SETTINGS_POPUP](state, { payload }) {
      return {
        ...state,
        [EDIT_FIELDS]: {
          ...state[EDIT_FIELDS],
          changeDataTypeFromSettings: payload,
        },
      };
    },

    [actionTypes.TOGGLE_FOOTER_EMPTY_COLUMN_VISIBILITY](state, { payload }) {
      return {
        ...state,
        [REVIEW_TOOL]: {
          ...state[REVIEW_TOOL],
          hideFooterEmptyColumn: payload,
        },
      };
    },
  },
  getInitialState()
);
