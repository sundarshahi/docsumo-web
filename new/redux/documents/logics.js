import {
  actions as appActions,
  actionTypes as configAction,
} from 'new/redux/app/actions';
import { actionTypes as docAction } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { createLogic } from 'redux-logic';

import _ from 'lodash';
import * as api from 'new/api';
import * as documentConstants from 'new/constants/document';
import routes from 'new/constants/routes';
import history from 'new/history';

import { actions, actionTypes } from './actions';

let changeDataTypeFromPopUpTimer = null;
let redirectCustomDocTypeTimer = null;

const deleteDocLogic = createLogic({
  type: actionTypes.DELETE_DOC,
  async process({ action }, dispatch, done) {
    const docId = _.get(action, 'payload.docId');
    const flag = _.get(action, 'payload.flag');
    const doc_type = _.get(action, 'payload.doc_type');
    try {
      dispatch(
        actions.updateDocData({
          docId: docId,
          updates: {
            isDeleting: true,
          },
        })
      );
      dispatch(
        actions.deleteDocHideConfirmation({
          docId: docId,
        })
      );
      flag === 'doc_type'
        ? await api.deleteDocumentType({
            docId: docId,
            doc_type,
          })
        : await api.deleteDocument({
            docId: docId,
          });
      dispatch(
        actions.deleteDocFulfilled({
          docId: docId,
        })
      );
      dispatch(
        appActions.setToast({
          title: flag ? 'Document type deleted' : 'Document Deleted',
          success: true,
        })
      );
      dispatch(actions.fetchDocumentCounts());
    } catch (e) {
      dispatch(
        actions.updateDocData({
          docId: docId,
          updates: {
            isDeleting: false,
          },
        })
      );
    } finally {
      done();
    }
  },
});

const documentCountsFetchLogic = createLogic({
  type: actionTypes.DOCUMENT_COUNTS_FETCH,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: actionTypes.DOCUMENT_COUNTS_FETCH_FULFILLED,
    failType: actionTypes.DOCUMENT_COUNTS_FETCH_REJECTED,
  },

  process({ action }) {
    return api.getDocumentCounts({
      queryParams: _.get(action, 'payload.queryParams'),
    });
  },
});
const updateSummaryLogic = createLogic({
  type: actionTypes.GET_UPDATED_SUMMARY,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: actionTypes.GET_UPDATED_SUMMARY_FULFILLED,
    failType: actionTypes.GET_UPDATED_SUMMARY_REJECTED,
  },

  process({ getState, action }) {
    const payloadDocId = _.get(action, 'payload.docId');
    const {
      documents: {
        excelTool: { docId },
      },
    } = getState();
    if (payloadDocId === docId) {
      return api.getSummaryPanelData({
        docId: _.get(action, 'payload.docId'),
      });
    }
  },
});

const allDocumentsTypesFetchLogic = createLogic({
  type: actionTypes.ALL_DOCUMENTS_TYPE_FETCH,
  cancelType: actionTypes.ALL_DOCUMENTS_TYPE_FETCH_CANCEL,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: actionTypes.ALL_DOCUMENTS_TYPE_FETCH_FULFILLED,
    failType: actionTypes.ALL_DOCUMENTS_TYPE_FETCH_REJECTED,
  },

  process({ action }) {
    return api.getAllDocumentsTypes({
      queryParams: _.get(action, 'payload.queryParams'),
    });
  },
});

const duplicateDocumentType = createLogic({
  type: actionTypes.DUPLICATE_DOCUMENT_TYPE_FETCH,
  latest: false,
  async process({ action }, dispatch, done) {
    try {
      dispatch(appActions.showLoaderOverlay());
      const response = await api.duplicateDocumentType({
        doc_type: _.get(action, 'payload.doc_type'),
        title_old: _.get(action, 'payload.old_name'),
      });
      dispatch(appActions.hideLoaderOverlay());
      await dispatch({
        type: actionTypes.ALL_DOCUMENTS_TYPE_FETCH_FULFILLED,
        payload: response,
      });
    } catch (e) {
      dispatch({
        type: actionTypes.ALL_DOCUMENTS_TYPE_FETCH_REJECTED,
        error: true,
        payload: e,
      });
    } finally {
      done();
    }
  },
});

const createDocumentTypeLogic = createLogic({
  type: actionTypes.NEW_DOCUMENTS_TYPE,
  latest: false,
  async process({ action }, dispatch, done) {
    try {
      dispatch(appActions.showLoaderOverlay());
      const response = await api.createDocumentType({
        queryParams: _.get(action, 'payload.queryParams'),
      });
      dispatch(appActions.hideLoaderOverlay());
      await dispatch({
        type: actionTypes.ALL_DOCUMENTS_TYPE_FETCH_FULFILLED,
        payload: response,
      });
    } catch (e) {
      dispatch({
        type: actionTypes.ALL_DOCUMENTS_TYPE_FETCH_REJECTED,
        error: true,
        payload: e,
      });
    } finally {
      done();
    }
  },
});

const allDocumentsFetchLogic = createLogic({
  type: actionTypes.ALL_DOCUMENTS_FETCH,
  cancelType: actionTypes.ALL_DOCUMENTS_FETCH_CANCEL,

  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.DOCUMENT_FETCHING_STATUS,
        payload: {
          status: 'allDocumentsFetch',
        },
      });
      const response = await api.getAllDocuments({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.ALL_DOCUMENTS_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.ALL_DOCUMENTS_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

const getDocumentTypesDynamicLogic = createLogic({
  type: actionTypes.DOCUMENTS_TYPES_DYNAMIC_FETCH,
  cancelType: actionTypes.DOCUMENTS_TYPES_DYNAMIC_FETCH_ERROR,

  process: async function ({ action }, dispatch, done) {
    dispatch(appActions.showLoaderOverlay());
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      const response = await api.getAllDocumentsTypes({
        queryParams: {
          ...queryParams,
        },
      });
      await dispatch({
        type: actionTypes.DOCUMENTS_TYPES_DYNAMIC_FULFILLED,
        payload: response,
      });
      dispatch(appActions.hideLoaderOverlay());
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.DOCUMENTS_TYPES_DYNAMIC_ERROR,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});

const reviewDocumentsFetchLogic = createLogic({
  type: actionTypes.REVIEW_DOCUMENTS_FETCH,
  cancelType: actionTypes.REVIEW_DOCUMENTS_FETCH_CANCEL,

  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.DOCUMENT_FETCHING_STATUS,
        payload: {
          status: 'reviewDocumentsFetch',
        },
      });
      const response = await api.getReviewDocuments({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.REVIEW_DOCUMENTS_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.REVIEW_DOCUMENTS_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

const skippedDocumentsFetchLogic = createLogic({
  type: actionTypes.SKIPPED_DOCUMENTS_FETCH,
  cancelType: actionTypes.SKIPPED_DOCUMENTS_FETCH_CANCEL,

  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.DOCUMENT_FETCHING_STATUS,
        payload: {
          status: 'skippedDocumentsFetch',
        },
      });
      const response = await api.getSkippedDocuments({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.SKIPPED_DOCUMENTS_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.SKIPPED_DOCUMENTS_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

const processedDocumentsFetchLogic = createLogic({
  type: actionTypes.PROCESSED_DOCUMENTS_FETCH,
  cancelType: actionTypes.PROCESSED_DOCUMENTS_FETCH_CANCEL,

  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      await dispatch({
        type: actionTypes.DOCUMENT_FETCHING_STATUS,
        payload: {
          status: 'processedDocumentsFetch',
        },
      });
      const response = await api.getProcessedDocuments({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.PROCESSED_DOCUMENTS_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.PROCESSED_DOCUMENTS_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

const rtStartReviewLogic = createLogic({
  type: actionTypes.RT_START_REVIEW,
  process: async function ({ getState, action }, dispatch, done) {
    try {
      const {
        documents: { selectedFolderId },
      } = getState();
      let queryParams = _.get(action.payload, 'queryParams');
      let check = _.get(action.payload, 'check');
      let redirectFromEditField = _.get(
        action.payload,
        'redirectFromEditField'
      );
      let afterAction = _.get(action.payload, 'afterAction');
      queryParams = {
        ...queryParams,
      };
      if (selectedFolderId) {
        queryParams['folder_id'] = [selectedFolderId];
      }
      await dispatch(appActions.showLoaderOverlay());
      const response = await api.startReview({
        queryParams,
      });
      const documents = _.get(response, 'responsePayload.data.documents');
      if (_.isEmpty(documents)) {
        dispatch(appActions.hideLoaderOverlay());
        done();
        return;
      }
      if (afterAction) afterAction();

      if (check) {
        await dispatch({
          type: actionTypes.DOCTYPE_DOCUMENTS_FULFILLED,
          payload: response,
        });
      }

      await dispatch({
        type: actionTypes.RT_START_REVIEW_FULFILLED,
        payload: response,
        meta: {
          ...action.payload,
          originLocation: redirectFromEditField
            ? null
            : {
                ...window.location,
              },
          sort:
            Array.isArray(queryParams?.sort_by) && queryParams?.sort_by.length
              ? queryParams?.sort_by[0]
              : 'created_date.desc',
        },
      });

      let startDocId = _.get(action.payload, 'docId');
      startDocId = startDocId || documents[0].docId;
      const slug = _.get(action.payload, 'slug');
      const docType = _.get(action.payload, 'doc_type');
      const origin = _.get(action.payload, 'origin');
      const redirect = action?.payload?.redirect || routes.ROOT;

      await history.push(
        `${routes.REVIEW_DOC}${startDocId}?redirect=${redirect}`,
        {
          startDocId,
          slug,
          docType,
          origin,
        }
      );
      dispatch(appActions.hideLoaderOverlay());
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e?.responsePayload,
        meta: action.payload,
      });
      const { responsePayload: { message = '' } = {} } =
        (e && e.responsePayload) || {};
      dispatch(
        appActions.setToast({
          title:
            e.statusCode === 403
              ? 'Access Denied. Please contact admin to provide access.'
              : message,
          error: true,
        })
      );
      dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});
const rtStartExcelViewLogic = createLogic({
  type: actionTypes.RT_START_EXCEL_VIEW,
  process: async function ({ getState, action }, dispatch, done) {
    try {
      const {
        documents: { selectedFolderId },
      } = getState();
      let queryParams = _.get(action.payload, 'queryParams');
      let check = _.get(action.payload, 'check');
      queryParams = {
        ...queryParams,
      };
      if (selectedFolderId) {
        queryParams['folder_id'] = [selectedFolderId];
      }
      await dispatch(appActions.showLoaderOverlay());
      const response = await api.startReview({
        queryParams,
      });

      const documents = _.get(response, 'responsePayload.data.documents');
      if (_.isEmpty(documents)) {
        dispatch(appActions.hideLoaderOverlay());
        done();
        return;
      }

      if (check) {
        await dispatch({
          type: actionTypes.DOCTYPE_DOCUMENTS_FULFILLED,
          payload: response,
        });
      }

      await dispatch({
        type: actionTypes.RT_START_EXCEL_VIEW_FULFILLED,
        payload: response,
        meta: {
          ...action.payload,
          originLocation: {
            ...window.location,
          },
        },
      });

      let startDocId = _.get(action.payload, 'docId');
      startDocId = startDocId || documents[0].docId;
      const slug = _.get(action.payload, 'slug');
      const docType = _.get(action.payload, 'doc_type');
      const origin = _.get(action.payload, 'origin');
      await history.push(`${routes.DOCUMENT_SPREADSHEET}/${startDocId}`, {
        startDocId,
        slug,
        docType,
        origin,
      });
      dispatch(appActions.hideLoaderOverlay());
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_EXCEL_VIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});

const rtStartSingleReviewLogic = createLogic({
  type: actionTypes.RT_START_SINGLE_REVIEW,
  process: async function ({ action }, dispatch, done) {
    try {
      const docId = _.get(action, 'payload.docId');
      const onSuccess = action?.payload?.onSuccess;
      let response = await api.startReview({
        queryParams: {
          doc_id: docId,
        },
      });

      let documents = _.get(response, 'responsePayload.data.documents');
      documents = documents.filter((doc) => !doc.docId || doc.docId === docId);
      response = {
        ...response,
        responsePayload: {
          ...response.responsePayload,
          data: {
            ...response.responsePayload.data,
            documents,
          },
        },
        documentsById: {
          [docId]: documents && documents[0],
        },
      };
      if (_.isEmpty(documents)) {
        done();
        return;
      }
      let [doc] = documents;
      if (
        doc &&
        (doc.type === 'auto_classify' || doc.type === 'auto_classify__test')
      ) {
        history.push(`${routes.MANUAL_CLASSIFICATION}/${docId}`);
      } else if (doc && doc.excelType) {
        history.push(`${routes.DOCUMENT_SPREADSHEET}/${docId}`);
      }
      await dispatch({
        type: actionTypes.RT_START_REVIEW_FULFILLED,
        payload: response,
        meta: {
          ...action.payload,
          originLocation: {
            href: routes.REVIEW,
            pathname: routes.REVIEW,
            search: '',
          },
        },
      });
      if (onSuccess) {
        onSuccess();
      }

      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_DATA_FETCH_ERROR,
        error: true,
        payload: e?.responsePayload,
        meta: action.payload,
      });
      done();
    }
  },
});

const rtUpdateReviewLogic = createLogic({
  type: actionTypes.RT_UPDATE_REVIEW,
  process: async function ({ action }, dispatch, done) {
    try {
      const docId = _.get(action, 'payload.docId');
      let response = await api.startReview({
        queryParams: {
          doc_id: docId,
        },
      });
      let documents = _.get(response, 'responsePayload.data.documents');
      if (_.isEmpty(documents)) {
        done();
        return;
      }

      await dispatch({
        type: actionTypes.RT_UPDATE_REVIEW_FULFILLED,
        payload: response,
        meta: {
          ...action.payload,
          originLocation: {
            href: routes.REVIEW,
            pathname: routes.REVIEW,
            search: '',
          },
        },
      });
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});

const rtStartSingleExcelViewLogic = createLogic({
  type: actionTypes.RT_START_SINGLE_EXCEL_VIEW,
  process: async function ({ action }, dispatch, done) {
    try {
      const docId = _.get(action, 'payload.docId');
      let response = await api.startReview({
        queryParams: {
          doc_id: docId,
        },
      });
      let documents = _.get(response, 'responsePayload.data.documents');
      documents = documents.filter((doc) => !doc.docId || doc.docId === docId);
      response = {
        ...response,
        responsePayload: {
          ...response.responsePayload,
          data: {
            ...response.responsePayload.data,
            documents,
          },
        },
        documentsById: {
          [docId]: documents && documents[0],
        },
      };
      if (_.isEmpty(documents)) {
        done();
        return;
      }

      await dispatch({
        type: actionTypes.RT_START_EXCEL_VIEW_FULFILLED,
        payload: response,
        meta: {
          ...action.payload,
          originLocation: {
            ...window.location,
          },
        },
      });
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_EXCEL_VIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});

const rtUpdateDocumentId = createLogic({
  type: actionTypes.UPDATE_DOC_ID,
  latest: true, // take latest only
  async process({ action }, dispatch, done) {
    try {
      dispatch(appActions.showLoaderOverlay());
      const payload = _.get(action, 'payload');
      const { docId, docType, origin, customDocType } = payload;
      let response = null;
      if (customDocType) {
        dispatch({
          type: actionTypes.UPDATE_DOC_ID_FULFILLED,
          payload: {
            bboxes: [],
            docId,
          },
          meta: action.payload,
        });
      } else {
        response = await api.getEditFieldDocumentBboxes({
          docId,
          doc_type: docType,
        });
        const docBboxesResponse = response || {};
        dispatch({
          type: actionTypes.UPDATE_DOC_ID_FULFILLED,
          payload: {
            bboxes:
              _.get(docBboxesResponse, 'responsePayload.data.bboxes') ||
              _.get(docBboxesResponse, 'responsePayload.data.bbox') ||
              [],
            docId,
          },
          meta: action.payload,
        });
        history.push(
          `${routes.EDIT_FIELD}${docId}?slug=editField&docType=${docType}`,
          {
            startDocId: docId,
            slug: 'editField',
            docType,
            origin,
          }
        );
      }
      dispatch(appActions.hideLoaderOverlay());
      done();
    } catch (e) {
      //error
    } finally {
      dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});

const rtDocumentDataFetchLogic = createLogic({
  type: actionTypes.RT_DOCUMENT_DATA_FETCH,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const { docId, slug, doc_type } = payload;
      let responses = null;
      !slug
        ? (responses = await Promise.all([
            api.getDocumentBboxes({
              docId,
            }),
            api.getDocumentData({
              docId,
            }),
            api.getDocumentAllTableGrids({
              docId,
            }),
            // api.getDocumentDDValues({
            //     docId,
            // }),
          ]))
        : (responses = await Promise.all([
            api.getEditFieldDocumentBboxes({
              docId,
              doc_type,
            }),
            api.getEditFieldDocumentData({
              docId,
              doc_type,
            }),
            // api.getDocumentDDValues({
            //     docId,
            // }),
          ]));

      //Section data from the dummy data

      const [docBboxesResponse, docDataResponse, docAllTableGridsResponse] =
        responses;

      dispatch({
        type: actionTypes.RT_DOCUMENT_DATA_FETCH_FULFILLED,
        payload: {
          bboxes:
            _.get(docBboxesResponse, 'responsePayload.data.bboxes') ||
            _.get(docBboxesResponse, 'responsePayload.data.bbox') ||
            [],

          //To use the data from the api remove the sectionData which is a dummy data
          sections:
            _.get(docDataResponse, 'responsePayload.data.sections') ||
            _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
            [],
          //sections: sections,
          rtUpdateFields:
            _.get(docDataResponse, 'responsePayload.data.rtUpdateFields') ||
            _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
            [],
          allTableGrids:
            _.get(docAllTableGridsResponse, 'responsePayload.data') || [],
          //DDfields: _.get(dataDDResponse, 'responsePayload.data') || {}
        },
        meta: action.payload,
      });
      if (!slug) {
        dispatch({
          type: actionTypes.RT_DROP_DOWN_FETCH,
          payload: {
            sections:
              _.get(docDataResponse, 'responsePayload.data.sections') ||
              _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
              [],
            //sections: sections,
            doc_type,
            docId,
          },
          meta: action.payload,
        });
        dispatch({
          type: actionTypes.RT_DROP_DOWN_MAP_FETCH,
          payload: {
            sections:
              _.get(docDataResponse, 'responsePayload.data.sections') ||
              _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
              [],
            //sections: sections,
            doc_type,
            docId,
          },
          meta: action.payload,
        });
        dispatch({
          type: actionTypes.RT_LINE_ITEM_DROP_DOWN_FETCH,
          payload: {
            sections:
              _.get(docDataResponse, 'responsePayload.data.sections') ||
              _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
              [],
            //sections: sections,
            docId,
            doc_type,
          },
          meta: action.payload,
        });
      }
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_DOCUMENT_DATA_FETCH_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});

const rtDocumentDataLoadFetchLogic = createLogic({
  type: actionTypes.RT_DOCUMENT_DATA_LOAD_FETCH,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const { docId, slug, docType, handleInputFocus } = payload;
      let responses = null;
      !slug
        ? (responses = await Promise.all([
            api.getDocumentBboxes({
              docId,
            }),
            api.getDocumentData({
              docId,
            }),
          ]))
        : (responses = await Promise.all([
            api.getEditFieldDocumentBboxes({
              docId,
              doc_type: docType,
            }),
            api.getEditFieldDocumentData({
              docId,
              doc_type: docType,
            }),
          ]));
      const [docBboxesResponse, docDataResponse] = responses;

      dispatch({
        type: actionTypes.RT_DOCUMENT_DATA_LOAD_FETCH_FULFILLED,
        payload: {
          bboxes:
            _.get(docBboxesResponse, 'responsePayload.data.bboxes') ||
            _.get(docBboxesResponse, 'responsePayload.data.bbox') ||
            [],
          sections:
            _.get(docDataResponse, 'responsePayload.data.sections') ||
            _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
            [],
          //sections: sections,
          rtUpdateFields:
            _.get(docDataResponse, 'responsePayload.data.rtUpdateFields') ||
            _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
            [],
          //DDfields: _.get(dataDDResponse, 'responsePayload.data') || {}
        },
        meta: action.payload,
      });
      if (!slug) {
        dispatch({
          type: actionTypes.RT_DROP_DOWN_FETCH,
          payload: {
            sections:
              _.get(docDataResponse, 'responsePayload.data.sections') ||
              _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
              [],
            //sections: sections,
            doc_type: docType,
            docId,
          },
          meta: action.payload,
        });
        dispatch({
          type: actionTypes.RT_DROP_DOWN_MAP_FETCH,
          payload: {
            sections:
              _.get(docDataResponse, 'responsePayload.data.sections') ||
              _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
              [],
            //sections: sections,
            docId,
          },
          meta: action.payload,
        });
        dispatch({
          type: actionTypes.RT_LINE_ITEM_DROP_DOWN_FETCH,
          payload: {
            sections:
              _.get(docDataResponse, 'responsePayload.data.sections') ||
              _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
              [],
            //sections: sections,
            docId,
          },
          meta: action.payload,
        });
        handleInputFocus();
      }
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_DOCUMENT_DATA_FETCH_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});

const rtDocumentExcelDataFetchLogic = createLogic({
  type: actionTypes.RT_EXCEL_DOCUMENT_DATA_FETCH,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const { docId, slug, doc_type } = payload;
      let responses = null;
      !slug
        ? (responses = await Promise.all([
            api.getDocumentData({
              docId,
            }),
            api.getSummaryPanelData({
              docId,
            }),
          ]))
        : (responses = await Promise.all([
            api.getEditFieldDocumentData({
              docId,
              doc_type,
            }),
          ]));
      const [docDataResponse, summaryDataResponse] = responses;

      dispatch({
        type: actionTypes.RT_EXCEL_DOCUMENT_DATA_FETCH_FULFILLED,
        payload: {
          sections:
            _.get(docDataResponse, 'responsePayload.data.sections') ||
            _.get(docDataResponse, 'responsePayload.data.annotatedData') ||
            [],
          summaryData: _.get(summaryDataResponse, 'responsePayload.data') || [],
        },
        meta: action.payload,
      });

      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_EXCEL_DOCUMENT_DATA_FETCH_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});

const rtDropDownFetchLogic = createLogic({
  type: actionTypes.RT_DROP_DOWN_FETCH,
  latest: true, // take latest only

  async process({ getState, action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const { sections, docId, doc_type } = payload;
      const state = getState();
      const { documentsById, documentsByIdDocType } = state.documents;
      let documentsDocType;
      let type;
      if (documentsByIdDocType && Object.keys(documentsByIdDocType).length) {
        documentsDocType = documentsByIdDocType[docId];
      }
      if (documentsDocType) {
        type = documentsDocType.type;
      } else if (documentsById[docId]) {
        type = documentsById[docId].type;
      } else {
        type = doc_type;
      }
      // const { type } = documentsById[docId] || {};
      let ddValue = {};

      sections.forEach((section) => {
        const sectionChildren = _.get(section, 'children') || [];
        sectionChildren.forEach(async (sectionField) => {
          if (
            sectionField.dropDownType &&
            sectionField.dropDownType === 'list'
          ) {
            const itemId = sectionField.id;
            const response = await api.getDocumentDDValues({
              itemId,
              type,
            });
            const data = _.get(response, 'responsePayload.data');
            ddValue[itemId] = data;
            await dispatch({
              type: actionTypes.RT_DROP_DOWN_FETCH_FULLFILLED,
              payload: {
                ddValue,
              },
            });
          }
        });
      });
    } catch (e) {
      done();
    }
  },
});
const rtDropDownMapFetchLogic = createLogic({
  type: actionTypes.RT_DROP_DOWN_MAP_FETCH,
  latest: true, // take latest only

  async process({ getState, action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const { sections, docId, doc_type } = payload;
      const state = getState();
      const { documentsById, documentsByIdDocType } = state.documents;
      let documentsDocType;
      let type;
      if (documentsByIdDocType && Object.keys(documentsByIdDocType).length) {
        documentsDocType = documentsByIdDocType[docId];
      }
      if (documentsDocType) {
        type = documentsDocType.type;
      } else if (documentsById[docId]) {
        type = documentsById[docId].type;
      } else {
        type = doc_type;
      }
      let ddMap = {};

      sections.forEach((section) => {
        const sectionChildren = _.get(section, 'children') || [];
        sectionChildren.forEach(async (sectionField) => {
          if (sectionField.isIndex && sectionField.type === 'drop_down_map') {
            const itemId = sectionField.id;
            const response = await api.getDocumentDDMValues({
              itemId,
              docType: type,
              docId,
            });
            const data = _.get(response, 'responsePayload.data');
            ddMap[itemId] = data;
            await dispatch({
              type: actionTypes.RT_DROP_DOWN_MAP_FETCH_FULLFILLED,
              payload: {
                ddMap,
              },
            });
          }
        });
      });
      done();
    } catch (e) {
      done();
    }
  },
});
const rtLineItemDropDownFetchLogic = createLogic({
  type: actionTypes.RT_LINE_ITEM_DROP_DOWN_FETCH,
  latest: true, // take latest only

  async process({ getState, action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const { sections, docId, doc_type } = payload;
      const state = getState();
      const { documentsById, documentsByIdDocType } = state.documents;
      let documentsDocType;
      let type;
      if (documentsByIdDocType && Object.keys(documentsByIdDocType).length) {
        documentsDocType = documentsByIdDocType[docId];
      }
      if (documentsDocType) {
        type = documentsDocType.type;
      } else if (documentsById[docId]) {
        type = documentsById[docId].type;
      } else {
        type = doc_type;
      }

      for (let i = 0; i < sections.length; i++) {
        for (let j = 0; j < sections[i].children.length; j++) {
          if (sections[i].children[j].type === 'line_item') {
            for (
              let k = 0;
              k < sections[i].children[j].children[0][0].length;
              k++
            ) {
              if (
                sections[i].children[j].children[0][0][k].type ===
                  'drop_down' &&
                sections[i].children[j].children[0][0][k].dropDownType ===
                  'list'
              ) {
                const response = await api.getDocumentDDValues({
                  itemId: sections[i].children[j].children[0][0][k].id,
                  type,
                  label: sections[i].children[j].children[0][0][k].label,
                  pType: sections[i].children[j].type,
                });
                const data = _.get(response, 'responsePayload.data');
                sections[i].children[j].children[0][0][k].options = data;
              }
            }
          }
        }
      }
      for (let i = 0; i < sections.length; i++) {
        for (let j = 0; j < sections[i].children.length; j++) {
          if (sections[i].children[j].type === 'line_item') {
            for (
              let k = 0;
              k < sections[i].children[j].children[0][0].length;
              k++
            ) {
              if (
                sections[i].children[j].children[0][0][k] &&
                sections[i].children[j].children[0][0][k].type ===
                  'drop_down' &&
                sections[i].children[j].children[0][0][k].dropDownType ===
                  'list'
              ) {
                for (
                  let m = 0;
                  m < sections[i].children[j].children.length;
                  m++
                ) {
                  for (
                    let z = 0;
                    z < sections[i].children[j].children[m].length;
                    z++
                  ) {
                    sections[i].children[j].children[m][z][k].options =
                      sections[i].children[j].children[0][0][k].options;
                    sections[i].children[j].children[m][z][k].dropDownType =
                      'list';
                  }
                }
              }
            }
          }
        }
      }
      // for(let i = 0; i<sections.length; i++){
      //     if(sections[i].type === 'line_item'){
      //         lineItem.push(i);
      //         lineItemData[i] = [];
      //         for(let k = 0; k < sections[i].children[0].children[0].length; k++){
      //             if(sections[i].children[0].children[0][k].type === 'drop_down' && sections[i].children[0].children[0][k].dropDownType === 'list'){
      //                 const response = await api.getDocumentDDValues({
      //                     itemId: sections[i].children[0].children[0][k].id,
      //                     type,
      //                     label: sections[i].children[0].children[0][k].label,
      //                     pType: sections[i].children[0].children[0][k].pType
      //                 });
      //                 const data =  _.get(response, 'responsePayload.data');
      //                 lineItemData[i].push({[k] : data});
      //                 dropDownData[k] = data;
      //             }
      //         }
      //     }
      // }
      // for(let i = 0; i < lineItem.length; i++){
      //     for(let k = 1; k < sections[lineItem[i]].children[0].children.length; k++){
      //         Object.keys(dropDownData).map(function(keyName) {
      //             //sections[lineItem[i]].children[0].children[k][keyName].dropDownType = 'list';
      //             for( let j = 0 ; j < lineItemData[lineItem[i]].length; j++ ){
      //                 if(sections[lineItem[i]].children[0].children[k][keyName] && lineItemData[lineItem[i]][j][keyName]){
      //                     sections[lineItem[i]].children[0].children[k][keyName].options =  lineItemData[lineItem[i]][j][keyName];
      //                     sections[lineItem[i]].children[0].children[k][keyName].dropDownType = 'list';
      //                 }
      //             }
      //         });
      //     }
      // }
      await dispatch({
        type: actionTypes.RT_LINE_ITEM_DROP_DOWN_FETCH_FULLFILLED,
        payload: {
          sections,
          docId,
        },
      });
    } catch (e) {
      done();
    }
  },
});

const rtDocumentSearchLogic = createLogic({
  type: actionTypes.RT_DOCUMENT_SEARCH_DATA_FETCH,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const { docId, queryParams } = payload;

      let responses = await api.getDocumentSearchBboxes({
        docId,
        queryParams,
      });

      dispatch({
        type: actionTypes.RT_DOCUMENT_SET_SEARCH_BBOX,
        payload: {
          bboxes: _.get(responses, 'responsePayload.data.bboxes') || [],
        },
      });
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_DOCUMENT_SET_SEARCH_BBOX,
        error: true,
        payload: {},
      });
      done();
    }
  },
});

const rtStartDocumentReviewLogic = createLogic({
  type: actionTypes.RT_START_DOCUMENT_REVIEW,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const docId = _.get(action.payload, 'docId');
      const docType = _.get(action.payload, 'docType');
      const response = await api.startDocumentReview({
        docId,
        docType,
      });

      dispatch({
        type: actionTypes.RT_START_DOCUMENT_REVIEW_FULFILLED,
        payload: response,
        meta: action.payload,
      });
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_DOCUMENT_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});
const rtStartDocumentExcelViewLogic = createLogic({
  type: actionTypes.RT_START_DOCUMENT_EXCEL_VIEW,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const docId = _.get(action.payload, 'docId');
      const docType = _.get(action.payload, 'docType');
      const response = await api.startDocumentReview({
        docId,
        docType,
      });

      dispatch({
        type: actionTypes.RT_START_DOCUMENT_EXCEL_VIEW_FULFILLED,
        payload: response,
        meta: action.payload,
      });
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_DOCUMENT_EXCEL_VIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});

const rtGoToDocumentLogic = createLogic({
  type: actionTypes.RT_GO_TO_DOCUMENT,
  latest: false,

  async process({ getState, action }, dispatch, done) {
    try {
      const { docId, slug, doc_type, redirect = true } = action.payload;

      const state = getState();
      const { documentIds, documentsById } = state.documents.reviewTool;
      if (!_.isEmpty(documentIds) && documentIds.indexOf(docId) < 0) {
        // Doc doesn't exist in stack
        done();
        return;
      }

      // Fetch data
      dispatch({
        type: actionTypes.RT_DOCUMENT_DATA_FETCH,
        payload: {
          docId,
          slug,
          doc_type,
        },
      });

      const docStatus = documentsById[docId] && documentsById[docId].status;
      let shouldAutoStartReview = ![
        documentConstants.STATUSES.PROCESSED,
        documentConstants.STATUSES.REVIEWING,
        documentConstants.STATUSES.REVIEW_SKIPPED,
      ].includes(docStatus);
      // eslint-disable-next-line compat/compat
      const parsedUrl = new URL(window.location.href);
      const client = parsedUrl.searchParams.get('client');
      if (sessionStorage.getItem('tempToken') && client) {
        shouldAutoStartReview = ![
          documentConstants.STATUSES.PROCESSED,
          documentConstants.STATUSES.REVIEWING,
          documentConstants.STATUSES.REVIEW_SKIPPED,
        ].includes(docStatus);
      }

      if (shouldAutoStartReview) {
        dispatch({
          type: actionTypes.RT_START_DOCUMENT_REVIEW,
          payload: {
            docId,
          },
        });
      }
      if (
        slug !== 'editField' &&
        !sessionStorage.getItem('tempToken') &&
        redirect
      ) {
        let startDocId = docId;
        await history.replace(
          `/review-document/${docId}${history.location.search}`,
          {
            startDocId,
            slug,
            docType: doc_type,
            origin,
          }
        );
      }

      done();
    } catch (e) {
      done();
    }
  },
});
const rtGoToExcelDocumentLogic = createLogic({
  type: actionTypes.RT_GO_TO_EXCEL_DOCUMENT,
  latest: false,

  async process({ getState, action }, dispatch, done) {
    try {
      const { docId, slug, doc_type, origin } = action.payload;

      const state = getState();
      const { documentIds, documentsById } = state.documents.excelTool;
      if (!_.isEmpty(documentIds) && documentIds.indexOf(docId) < 0) {
        // Doc doesn't exist in stack
        done();
        return;
      }

      // Fetch data
      dispatch({
        type: actionTypes.RT_EXCEL_DOCUMENT_DATA_FETCH,
        payload: {
          docId,
          slug,
          doc_type,
          origin,
        },
      });

      const docStatus = documentsById[docId] && documentsById[docId].status;
      let shouldAutoStartReview = ![
        documentConstants.STATUSES.PROCESSED,
        documentConstants.STATUSES.REVIEWING,
        documentConstants.STATUSES.REVIEW_SKIPPED,
      ].includes(docStatus);
      // eslint-disable-next-line compat/compat
      const parsedUrl = new URL(window.location.href);
      const client = parsedUrl.searchParams.get('client');
      if (sessionStorage.getItem('tempToken') && client) {
        shouldAutoStartReview = ![
          documentConstants.STATUSES.PROCESSED,
          documentConstants.STATUSES.REVIEWING,
          documentConstants.STATUSES.REVIEW_SKIPPED,
        ].includes(docStatus);
      }

      if (shouldAutoStartReview) {
        dispatch({
          type: actionTypes.RT_START_DOCUMENT_EXCEL_VIEW,
          payload: {
            docId,
          },
        });
      }

      done();
    } catch (e) {
      done();
    }
  },
});

const rtUpdateFieldValueLogic = createLogic({
  type: actionTypes.RT_UPDATE_FIELD_VALUE,
  latest: false, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const fieldId = _.get(action.payload, 'fieldId');
      const value = _.get(action.payload, 'value');
      const label = _.get(action.payload, 'label');

      const updates = {
        uiValue: value,
        uiLabel: label,
      };

      dispatch({
        type: actionTypes.RT_UPDATE_FIELD_DATA,
        payload: {
          fieldId,
          updates,
        },
      });
      done();
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error(e);
      done();
    }
  },
});

const rtStartEditFieldLogic = createLogic({
  type: actionTypes.RT_START_EDITFIELD,
  process: async function ({ action }, dispatch, done) {
    try {
      const docType = _.get(action.payload, 'docType');
      const isReload = _.get(action.payload, 'reload');
      const docTypeCard = _.get(action.payload, 'docTypeCard');
      const queryParams = _.get(action.payload, 'queryParams', {});
      const shouldPushHistory = _.get(
        action.payload,
        'shouldPushHistory',
        true
      );

      const afterAction = _.get(action.payload, 'afterAction');

      if (docTypeCard) {
        dispatch(appActions.showLoaderOverlay());
      }
      const response = await api.editFieldReview({
        doc_type: docType,
        queryParams,
      });
      const document = _.get(response, 'responsePayload.data.document');
      const message = _.get(response, 'responsePayload.message');
      const filterResponse = await api.getFilterList({
        doc_type: docType,
      });
      const filter = _.get(filterResponse, 'responsePayload.data');
      if (_.isEmpty(document)) {
        dispatch({
          type: actionTypes.RT_START_EDITFIELD_REJECTED,
          error: true,
          payload: response,
          meta: action.payload,
        });
        dispatch(appActions.hideLoaderOverlay());
        done();
        return;
      }
      const newResponse = {
        responsePayload: {
          data: {
            document: [
              ...document,
              //type : docType
            ],
          },
        },
      };
      dispatch({
        type: actionTypes.RT_START_EDITFIELD_FULFILLED,
        payload: newResponse,
        meta: {
          ...action.payload,
        },
        message,
      });

      dispatch({
        type: actionTypes.RT_FETCH_FILTER_FULFILLED,
        payload: filter,
      });

      const startDocId = !docTypeCard
        ? _.get(action.payload, 'docId')
        : document[0]?.docId;
      const slug = _.get(action.payload, 'slug');
      const origin = _.get(action.payload, 'origin');
      dispatch(appActions.hideLoaderOverlay());
      const searchParams = new URLSearchParams(history.location.search);
      const redirect = searchParams.get('redirect') || routes.ROOT;

      if (shouldPushHistory) {
        history.push(
          `${routes.EDIT_FIELD}${startDocId}?slug=${slug}&docType=${docType}&redirect=${redirect}`,
          {
            startDocId,
            slug,
            docType,
            origin,
          }
        );
      }
      if (afterAction) afterAction();
      if (isReload) history.go(0);
      done();
    } catch (e) {
      const afterError = _.get(action.payload, 'afterError');

      if (afterError) {
        afterError(e);
      } else {
        dispatch({
          type: actionTypes.RT_START_EDITFIELD_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }

      dispatch(appActions.hideLoaderOverlay());
      done();
    } finally {
      dispatch(appActions.hideLoaderOverlay());
    }
  },
});

const rtcustomDocTypeEditFieldFlow = createLogic({
  type: actionTypes.CUSTOM_DOCTYPE_EDITFIELD_FLOW,
  process: async function ({ action }, dispatch, done) {
    try {
      const files = _.get(action.payload, 'files', {});
      const transformedFiles = _.get(action.payload, 'transformedFiles', {});
      dispatch(appActions.showLoaderOverlay());
      const response = await api.createDocumentType({
        title: _.get(action.payload, 'title'),
      });
      const documentTypesList = _.get(
        response,
        'responsePayload.data.document'
      );

      const docType = documentTypesList[documentTypesList?.length - 1].docType;
      const filterResponse = await api.getFilterList({
        doc_type: docType,
      });
      const filter = _.get(filterResponse, 'responsePayload.data');

      const newResponse = {
        responsePayload: {
          data: {
            document: [...transformedFiles],
          },
        },
      };

      dispatch(appActions.hideLoaderOverlay());

      await dispatch({
        type: actionTypes.RT_START_EDITFIELD_FULFILLED,
        payload: newResponse,
        meta: {
          ...action.payload,
          docId: transformedFiles[0].docId,
        },
      });

      dispatch({
        type: actionTypes.RT_FETCH_FILTER_FULFILLED,
        payload: filter,
      });

      dispatch({
        type: actionTypes.RT_DOCUMENT_DATA_FETCH_FULFILLED,
        payload: {
          bboxes: [],
          sections: _.get(response, 'responsePayload.data.fields') || [],
          rtUpdateFields: [],
          allTableGrids: [],
        },
        meta: {
          ...action.payload,
          docId: transformedFiles[0].docId,
        },
      });

      const startDocId = transformedFiles[0]?.docId;
      const slug = 'editField';
      const searchParams = new URLSearchParams(history.location.search);
      const redirect = searchParams.get('redirect') || routes.ROOT;

      redirectCustomDocTypeTimer = setTimeout(() => {
        history.push(
          `${routes.EDIT_FIELD}${startDocId}?slug=${slug}&docType=${docType}&redirect=${redirect}&customDocType=true`,
          {
            startDocId,
            slug,
            docType,
          }
        );
      }, 100);

      done();
    } catch (e) {
      appActions.setToast({
        title:
          e?.responsePayload?.message ||
          'An error occurred while creating custom document type.',
        error: true,
      });
    } finally {
      dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});

// const rtPersistFieldDataLogic = createLogic({
//     type: actionTypes.RT_PERSIST_FIELD_DATA,
//     latest: false,

//     async process({ getState, action }, dispatch, done) {
//         try {
//             const {
//                 docId,
//                 fieldId,
//             } = action.payload;

//             const state = getState();
//             const {
//                 fieldsById,
//             } = state.documents.reviewTool;

//             const field = fieldsById[fieldId];

//             if (!field) {
//                 throw new Error('Field does not exist in store');
//             }

//             const response = await api.updateFieldData({
//                 docId,
//                 fieldId,
//                 payload: {
//                     value: field.uiValue,
//                     time_spent: 1,
//                     is_valid_format: field.uiIsValidFormat,
//                     position: field.uiRectangle || [],
//                 },
//             });

//             dispatch({
//                 type: actionTypes.RT_PERSIST_FIELD_DATA_FULFILLED,
//                 payload: response,
//                 meta: action.payload,
//             });
//             done();
//         } catch(e) {
//             /* eslint-disable-next-line no-console */
//             console.error(e);
//             dispatch({
//                 type: actionTypes.RT_PERSIST_FIELD_DATA_REJECTED,
//                 error: true,
//                 payload: e,
//                 meta: action.payload,
//             });
//             done();
//         }
//     }
// });

const rtDeleteSection = createLogic({
  type: actionTypes.RT_SECTIONS_DELETE,
  latest: false,
  async process({ action }, dispatch, done) {
    const { docId, docType, id, afterAction } = _.get(action, 'payload');
    try {
      const response = await api.deleteSection({
        docType,
        id,
      });
      const data = _.get(response.responsePayload, 'data');
      dispatch(appActions.hideLoaderOverlay());
      if (_.isEmpty(data)) {
        done();
        return;
      }
      dispatch({
        type: actionTypes.RT_SECTIONS_UPDATE_DATA,
        payload: data,
        docId,
      });
      dispatch({
        type: actionTypes.SET_EDIT_FIELD_CHANGES,
        payload: true,
      });
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    } finally {
      afterAction();
    }
  },
});

const rtAddSectionField = createLogic({
  type: actionTypes.RT_SECTIONS_ADD_FIELD,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const { afterAction } = payload;
      const response = await api.addSectionField({
        payload,
      });
      const data = _.get(response.responsePayload, 'data');
      dispatch(appActions.hideLoaderOverlay());
      if (_.isEmpty(data)) {
        done();
        return;
      }
      dispatch({
        type: actionTypes.RT_SECTIONS_UPDATE_DATA,
        payload: data,
        docId: action.payload.docId,
      });
      dispatch({
        type: actionTypes.SET_EDIT_FIELD_CHANGES,
        payload: true,
      });
      let responseData = data?.data;
      let sectionFields =
        responseData.find((item) => item.id === payload.id)?.children || [];

      let newField = null;
      const hiddenIndex = sectionFields.findIndex((item) => item.isHidden);

      if (hiddenIndex >= 1) {
        newField = sectionFields[hiddenIndex - 1];
      } else {
        newField = sectionFields[sectionFields.length - 1];
      }

      afterAction(newField?.id);
      done();
    } catch (e) {
      const payload = _.get(action, 'payload');
      const { errorAfterAction } = payload;
      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(
        appActions.setToast({
          title:
            e?.responsePayload?.message ||
            'An error occurred while adding field. Please try again later.',
          error: true,
        })
      );
      errorAfterAction(e);
      done();
    }
  },
});

// const rtFilterSectionField=createLogic({
//     type: actionTypes.RT_SHOW_FILTER_MODAL,
//     latest: true, // take latest only
//     async process({action},dispatch,done){
//         try{
//             const response = await api.filterSectionField({
//                 payload: _.get(action, 'payload'),
//             });
//             const data = _.get(response.responsePayload, 'data');
//             if (_.isEmpty(data)) {
//                 done();
//                 return;
//             }
//             dispatch({
//                 type: actionTypes.RT_SET_FIELD_FILTER,
//                 payload: data,
//             });
//         } catch (e) {
//             dispatch({
//                 type: actionTypes.RT_START_REVIEW_REJECTED,
//                 error: true,
//                 payload: e,
//                 meta: action.payload,
//             });
//         }finally {
//             done();
//         }
//     }

// });
const rtFilterSectionField = createLogic({
  type: actionTypes.RT_SHOW_FILTER_MODAL,
  latest: true, // take latest only
  async process({ action }, dispatch, done) {
    try {
      dispatch({
        type: actionTypes.RT_FETCH_EDITFIELD_FILTER_LOADING,
      });

      const response = await api.filterSectionField({
        payload: _.get(action, 'payload'),
      });
      const { docType, filterType } = action.payload;
      if (filterType === 'drop_down_map') {
        const filterResponse = await api.getFilterList({
          doc_type: docType,
        });
        const filter = _.get(filterResponse, 'responsePayload.data');
        dispatch({
          type: actionTypes.RT_FETCH_FILTER_FULFILLED,
          payload: filter,
        });
      }
      const data = _.get(response.responsePayload, 'data');
      if (_.isEmpty(data)) {
        done();
        return;
      }
      await dispatch({
        type: actionTypes.RT_SET_FIELD_FILTER,
        payload: data,
      });
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
    } finally {
      dispatch({
        type: actionTypes.RT_FETCH_EDITFIELD_FILTER_FULFILLED,
      });
      done();
    }
  },
});
const rtUpdateStandardFilter = createLogic({
  type: actionTypes.RT_STANDARD_FILTER,
  latest: true, // take latest only
  async process({ action }, dispatch, done) {
    try {
      const response = await api.filterSectionField({
        payload: _.get(action, 'payload'),
      });
      const { docType, filterType, id } = action.payload;
      if (filterType === 'drop_down_map') {
        const filterResponse = await api.getFilterList({
          doc_type: docType,
        });
        const filter = _.get(filterResponse, 'responsePayload.data');
        dispatch({
          type: actionTypes.RT_FETCH_FILTER_FULFILLED,
          payload: filter,
        });
      }
      const data = _.get(response.responsePayload, 'data');
      if (_.isEmpty(data)) {
        done();
        return;
      }
      await dispatch({
        type: actionTypes.RT_SET_STANDARD_FILTER,
        payload: data,
        meta: id,
      });
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
    } finally {
      done();
    }
  },
});
// const rtAdditionalFilter=createLogic({
//     type: actionTypes.RT_ADDITIONAL_FILTER,
//     latest: true, // take latest only
//     async process({action},dispatch,done){
//         try{
//             const response = await api.additionalFilter({
//                 payload: _.get(action, 'payload'),
//             });
//             const data = _.get(response.responsePayload, 'data');
//             if (_.isEmpty(data)) {
//                 done();
//                 return;
//             }
//             dispatch({
//                 type: actionTypes.RT_SET_EDIT_FILTER,
//                 payload: data,
//             });
//         } catch (e) {
//             dispatch({
//                 type: actionTypes.RT_START_REVIEW_REJECTED,
//                 error: true,
//                 payload: e,
//                 meta: action.payload,
//             });
//             done();
//         }
//     }

// });
const rtAdditionalFilter = createLogic({
  type: actionTypes.RT_ADDITIONAL_FILTER,
  latest: true, // take latest only
  async process({ action }, dispatch, done) {
    try {
      const { filterId, label, docType, fieldId, uiValue, fieldLabel } = _.get(
        action,
        'payload'
      );
      if (filterId === 1) {
        const response = await api.changeFieldType({
          docType: docType,
          fieldId: fieldId,
          data: { data_type: uiValue },
        });
        var data = _.get(response.responsePayload, 'fieldSettings');
        if (uiValue === 'line_item') {
          let dataTypeToUpdate = data.find((item) => item.id === 2);
          let labelToUpdate = data.find((item) => item.id === 1);
          if (dataTypeToUpdate) {
            dataTypeToUpdate.value = 108;
          }
          if (labelToUpdate) {
            labelToUpdate.value = fieldLabel;
          }
        }
        if (_.isEmpty(data)) {
          done();
          return;
        }
        if (label === 'Dropdown Mapped') {
          const filterResponse = await api.getFilterList({
            doc_type: docType,
          });
          const filter = _.get(filterResponse, 'responsePayload.data');
          dispatch({
            type: actionTypes.RT_FETCH_FILTER_FULFILLED,
            payload: filter,
          });
          dispatch({
            type: actionTypes.RT_SET_EDIT_FILTER,
            payload: data,
          });
          dispatch({
            type: actionTypes.CHANGE_FIELD_TYPE_FULFILLED,
            payload: response?.responsePayload,
            meta: { ...action.payload, updateFromSettings: true },
          });
          if (uiValue !== 'line_item') {
            dispatch({
              type: actionTypes.CHANGE_DATA_TYPE_FROM_SETTINGS_POPUP,
              payload: false,
            });
          }
          return;
        }
        dispatch({
          type: actionTypes.RT_SET_EDIT_FILTER,
          payload: data,
        });
        dispatch({
          type: actionTypes.CHANGE_FIELD_TYPE_FULFILLED,
          payload: response?.responsePayload,
          meta: { ...action.payload, updateFromSettings: true },
        });

        changeDataTypeFromPopUpTimer = setTimeout(() => {
          if (uiValue !== 'line_item') {
            dispatch({
              type: actionTypes.CHANGE_DATA_TYPE_FROM_SETTINGS_POPUP,
              payload: false,
            });
          }
        }, 1000);
      } else if (filterId === 3 && label === 'Index') {
        const response = await api.changeFilter({
          payload: _.get(action, 'payload'),
        });
        const data = _.get(response.responsePayload, 'data');
        //if(status==='success'){
        if (_.isEmpty(data)) {
          done();
          return;
        }
        dispatch({
          type: actionTypes.RT_SET_EDIT_FILTER,
          payload: data,
        });
        const { docType } = action.payload;
        const filterResponse = await api.getFilterList({
          doc_type: docType,
        });
        const filter = _.get(filterResponse, 'responsePayload.data');
        dispatch({
          type: actionTypes.RT_FETCH_FILTER_FULFILLED,
          payload: filter,
        });
        // }
      } else {
        const response = await api.changeFilter({
          payload: _.get(action, 'payload'),
        });
        const data = _.get(response.responsePayload, 'data');
        //if(status==='success'){
        if (_.isEmpty(data)) {
          done();
          return;
        }
        dispatch({
          type: actionTypes.RT_SET_EDIT_FILTER,
          payload: data,
        });
        // }
      }
    } catch (e) {
      dispatch(
        appActions.setToast({
          title:
            `${e?.responsePayload?.error}:
            ${e?.responsePayload?.message || ''}` ||
            'An error occurred. Please try again later.',
          error: true,
        })
      );
      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});

const rtDeleteSectionField = createLogic({
  type: actionTypes.RT_SECTIONS_DELETE_FIELD,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const response = await api.deleteSectionField({
        payload: _.get(action, 'payload'),
      });
      const data = _.get(response.responsePayload, 'data');
      dispatch(appActions.hideLoaderOverlay());
      if (_.isEmpty(data)) {
        done();
        return;
      }
      dispatch({
        type: actionTypes.RT_SECTIONS_UPDATE_DATA,
        payload: data,
        docId: _.get(action.payload, 'docId'),
      });
      dispatch({
        type: actionTypes.SET_EDIT_FIELD_CHANGES,
        payload: true,
      });
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});
const rtAddNewSectionTable = createLogic({
  type: actionTypes.RT_SECTIONS_ADD_SECTION,
  latest: false,
  async process({ action }, dispatch, done) {
    const { docId, docType, sectionType, afterAction } = _.get(
      action,
      'payload'
    );
    try {
      const response = await api.addNewSectionTable({
        docType,
        sectionType,
      });
      const data = _.get(response.responsePayload, 'data');
      dispatch(appActions.hideLoaderOverlay());
      if (_.isEmpty(data)) {
        done();
        return;
      }
      dispatch({
        type: actionTypes.RT_SECTIONS_UPDATE_DATA,
        payload: data,
        docId,
      });
      dispatch({
        type: actionTypes.SET_EDIT_FIELD_CHANGES,
        payload: true,
      });
      afterAction();
      done();
    } catch (e) {
      const { errorAfterAction } = _.get(action, 'payload');
      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(
        appActions.setToast({
          title:
            e?.responsePayload?.message ||
            'An error occurred while adding section. Please try again later.',
          error: true,
        })
      );
      errorAfterAction(e);
      done();
    }
  },
});

const rtAddNewFooteColumnLogic = createLogic({
  type: actionTypes.RT_FOOTER_ADD_COLUMNS,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const {
        docId,
        sectionId,
        sectionFieldId,
        docType,
        type,
        label,
        afterAction,
      } = action.payload;

      const response = await api.editFieldAddFooterColumn({
        sectionFieldId,
        docType,
        type,
        label,
      });
      const data = _.get(response.responsePayload, 'data', {});
      if (_.isEmpty(data)) {
        done();
        return;
      }
      await dispatch({
        type: actionTypes.RT_SECTIONS_UPDATE_DATA,
        payload: data,
        docId,
      });
      dispatch({
        type: actionTypes.SET_EDIT_FIELD_CHANGES,
        payload: true,
      });
      let sectionFields =
        data?.data.find((item) => item.id === sectionId)?.children || [];

      const lineItemColumns =
        sectionFields.find((item) => item.id === sectionFieldId)
          ?.lineItemColumns || [];

      afterAction(lineItemColumns[lineItemColumns?.length - 1]?.id);
      done();
    } catch (e) {
      const { errorAfterAction } = action.payload;

      dispatch({
        type: actionTypes.RT_START_REVIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(
        appActions.setToast({
          title:
            e?.responsePayload?.message ||
            'An error occurred while adding column. Please try again later.',
          error: true,
        })
      );
      errorAfterAction(e);
      done();
    }
  },
});
const rtAddLineLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_ADD_LINE,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const { docId, sectionFieldId, onSuccess, baseItemId, onSave, gridId } =
        action.payload;
      const response = await api.reviewAddLine({
        docId,
        sectionFieldId,
        baseItemId,
        gridId,
      });

      const data = _.get(response.responsePayload, 'data', {});
      const children = data.children;
      const [columns, ...restChildren] = children;

      const rows = restChildren.map((child) => {
        // row is an array of field objects
        const fields = [];
        const fieldIds = [];

        child.forEach((field) => {
          fields.push(field);
          fieldIds.push(field.id);
        });

        const id = fieldIds.join('-');

        return {
          id,
          fields,
        };
      });

      if (onSave && _.isFunction(onSave)) {
        onSave();
      }

      await dispatch({
        type: actionTypes.RT_LINE_ITEMS_ADD_LINE_FULFILLED,
        payload: response,
        meta: action.payload,
      });

      if (onSuccess && _.isFunction(onSuccess)) {
        onSuccess({
          columns,
          rows,
        });
      }
    } catch (e) {
      dispatch({
        type: actionTypes.RT_LINE_ITEMS_ADD_LINE_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
    } finally {
      done();
    }
  },
});

const rtAddSimilarLinesLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const { docId, sectionFieldId, fromGrid, afterAction } = action.payload;
      let response = {};
      if (fromGrid) {
        const {
          payload: { data, docType, ...rest },
        } = action;
        const result = data.map(
          ({ bottomRight, topLeft, columns, ...reste }) => ({
            ...reste,
            columns: columns.map(({ origHeader, ...rest }) => ({
              orig_header: origHeader,
              ...rest,
            })),
            bottom_right: bottomRight,
            top_left: topLeft,
          })
        );
        const payload = {
          table_grid: data ? [...result] : [],
          doc_type: docType,
        };
        response = await api.extractGridData({ ...rest, payload });
      } else {
        response = await api.reviewAddSimilarLines({
          docId,
          sectionFieldId,
        });
      }

      const data = _.get(response.responsePayload, 'data', {});
      if (data?.lines?.length > 0) {
        const children = data?.lines[0]?.children;
        const [columns, ...restChildren] = children;

        const rows = restChildren.map((child) => {
          // row is an array of field objects
          const fields = [];
          const fieldIds = [];

          child.forEach((field) => {
            fields.push(field);
            fieldIds.push(field.id);
          });

          const id = fieldIds.join('-');

          return {
            id,
            fields,
          };
        });

        dispatch({
          type: actionTypes.RT_LINE_ITEMS_UPDATE_CHILDREN,
          payload: {
            columns,
            rows,
          },
          meta: action.payload,
        });
      }

      dispatch({
        type: actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES_FULFILLED,
        payload: response,
        meta: action.payload,
      });
      if (afterAction) {
        afterAction();
      }
      done();
    } catch (e) {
      const { afterError } = action.payload;
      dispatch({
        type: actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      afterError();
      done();
    }
  },
});

const rtDeleteLineItemRowLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_DELETE_ROW,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const {
        docId,
        sectionFieldId,
        rowId,
        rowFieldIds,
        onSuccess,
        onFailure,
        selectedGridId,
      } = action.payload;
      dispatch({
        type: actionTypes.RT_LINE_ITEMS_DELETE_FIELDS,
        payload: {
          docId,
          sectionFieldId,
          rowIds: [rowId],
          rowFieldIds,
          selectedGridId,
          onSuccess,
          onFailure,
        },
      });
    } catch (e) {
      // Do nothing
    } finally {
      done();
    }
  },
});

const rtDeleteAllLineItemRowsLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_DELETE_ALL_ROWS,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const { docId, sectionFieldId, gridIds, onSuccess } = action.payload;

      const response = await api.reviewDeleteLineItemFields({
        docId,
        sectionFieldId,
        gridIds: gridIds,
      });

      if (response) {
        dispatch({
          type: actionTypes.RT_LINE_ITEMS_DELETE_ALL_ROWS_FULFILLED,
          payload: response,
          meta: action.payload,
        });

        done();
      }
    } catch (e) {
      dispatch({
        type: actionTypes.RT_LINE_ITEMS_DELETE_ALL_ROWS_REJECTED,
        payload: e,
        meta: action.payload,
      });
      done();
    } finally {
      done();
    }
  },
});

const rtDeleteLineItemFieldsLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_DELETE_FIELDS,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const { docId, sectionFieldId, rowFieldIds, onSuccess } = action.payload;

      const response = await api.reviewDeleteLineItemFields({
        docId,
        sectionFieldId,
        fieldIds: rowFieldIds,
      });

      if (response) {
        dispatch({
          type: actionTypes.RT_LINE_ITEMS_DELETE_FIELDS_FULFILLED,
          payload: response,
          meta: action.payload,
        });

        if (onSuccess && _.isFunction(onSuccess)) {
          onSuccess();
        }

        done();
      }
    } catch (e) {
      dispatch({
        type: actionTypes.RT_LINE_ITEMS_DELETE_FIELDS_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });

      const { onFailure } = action.payload;
      if (onFailure && _.isFunction(onFailure)) {
        onFailure();
      }

      done();
    }
  },
});

const manageLineGrid = createLogic({
  type: actionTypes.RT_LINE_ITEMS_MANAGE_GRID, // only apply this logic to this type
  latest: true, // only take latest

  processOptions: {
    dispatchReturn: true, // use returned/resolved value(s) for dispatching
    successType: actionTypes.RT_LINE_ITEMS_MANAGE_GRID_FULFILLED, // dispatch this success act type
    failType: actionTypes.RT_LINE_ITEMS_MANAGE_GRID_REJECTED, // dispatch this failed action type
  },

  process({ action }) {
    const {
      payload: {
        method,
        data,
        bbox,
        currentPage,
        index,
        grid_index,
        gridViewEnable,
        grid_id,
        ...rest
      },
    } = action;
    let payload = {};
    const includePage = ['DELETE', 'PUT', 'POST'].includes(method);
    if (data) {
      payload = data.map(({ bottomRight, topLeft, ...rest }) => ({
        ...rest,
        bottom_right: bottomRight,
        top_left: topLeft,
      }));
      payload = {
        table_grid: [...payload],
      };
    }
    if (includePage) {
      payload = {
        ...payload,
        page: currentPage - 1,
      };
    }

    /* eslint-disable indent */
    switch (method) {
      case 'PUT':
        return api
          .postDocumentGrids({
            ...rest,
            payload: { ...payload, grid_index },
          })
          .then(({ responsePayload }) => responsePayload)
          .catch((e) => {
            throw new Error(
              e?.responsePayload?.message || 'Something went wrong!'
            );
          });
      case 'SIMILAR_LINE':
        return api
          .addTableMultiplePage({ payload, ...rest })
          .then(({ responsePayload }) => responsePayload);
      case 'POST':
        return api
          .addDocumentGrids({ ...rest, payload: bbox })
          .then(({ responsePayload }) => ({
            ...responsePayload,
            isNewGrid: true,
          }))
          .catch((e) => {
            throw new Error(
              e?.responsePayload?.message || 'Something went wrong!'
            );
          });
      case 'TAG':
        return api
          .tagDocumentGrids({ ...rest, payload: { index } })
          .then(({ responsePayload }) => responsePayload)
          .catch((e) => {
            throw new Error(
              e?.responsePayload?.message || 'Something went wrong!'
            );
          });
      case 'DELETE':
        return api
          .deleteDocumentGrids({ ...rest, grid_id })
          .then(({ responsePayload }) => responsePayload);
      case 'PASTE':
        return api
          .pasteGrid({ ...rest, grid_id })
          .then(({ responsePayload }) => {
            return { ...responsePayload, method };
          });
      default:
        return api.getDocumentGrids({ ...rest }).then(({ responsePayload }) => {
          if (!responsePayload?.data?.length && gridViewEnable) {
            gridViewEnable();
          }
          return responsePayload;
        });
    }
    /* eslint-enable indent */
  },
});

const extractSimilarTables = createLogic({
  type: actionTypes.RT_EXTRACT_SIMILAR_TABLES,
  latest: true,

  async process({ action }, dispatch, done) {
    try {
      dispatch(appActions.showLoaderOverlay());
      const { docId, parentId, sourceGrid } = action.payload;
      let payload = {
        table_grid: sourceGrid?.staticId
          ? _.omit(sourceGrid, ['id', 'staticId'])
          : sourceGrid,
      };

      payload = {
        table_grid: {
          id: payload?.table_grid?.id,
          page: payload?.table_grid?.page,
          index: payload?.table_grid?.index,
          position: payload?.table_grid?.position,
          columns: payload?.table_grid?.columns,
          rows: payload?.table_grid?.rows,
          bottom_right: payload?.table_grid?.bottomRight,
          top_left: payload?.table_grid?.topLeft,
        },
      };

      const { responsePayload } = await api.extractSimilarTables({
        docId,
        parentId,
        payload,
      });

      if (responsePayload) {
        if (!responsePayload.data?.length) {
          dispatch(
            appActions.setToast({
              title: responsePayload?.message,
              error: true,
            })
          );
        } else {
          dispatch({
            type: actionTypes.RT_LINE_ITEMS_MANAGE_GRID_FULFILLED,
            payload: { ...responsePayload, extractSimilarLines: true },
          });
        }

        dispatch(appActions.hideLoaderOverlay());
        done();
      }
    } catch (e) {
      dispatch(appActions.hideLoaderOverlay());
      dispatch({
        type: actionTypes.RT_EXTRACT_SIMILAR_TABLES_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(
        appActions.setToast({
          title:
            e?.responsePayload?.message ||
            'An error occurred while extracting similar tables. Please try again later.',
          error: true,
        })
      );
    }
  },
});

const rtLineItemSuccessLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_MANAGE_GRID_FULFILLED,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    const {
      payload: { method },
    } = action;

    switch (method) {
      case 'PASTE':
        dispatch(
          appActions.setToast({
            title: 'Grid pasted successfully!',
            success: true,
          })
        );
        break;
      default:
        return;
    }
    done();
  },
});

const rtLineItemRejectLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_MANAGE_GRID_REJECTED,
  latest: true, // take latest only

  async process({ getState, action }, dispatch, done) {
    const {
      payload: { message },
    } = action;
    const state = getState();
    const { selectedSectionFieldId, docId } = state?.documents?.reviewTool;
    dispatch(
      appActions.setToast({
        title: message || 'Something went wrong!',
        error: true,
      })
    );
    //Fetches the intial grid data after the error
    const { responsePayload } = await api.getDocumentGrids({
      docId,
      parentId: selectedSectionFieldId,
    });
    dispatch({
      type: actionTypes.RT_LINE_ITEMS_MANAGE_GRID_FULFILLED,
      payload: responsePayload,
    });
    done();
  },
});

const extractGridData = createLogic({
  type: actionTypes.RT_LINE_ITEMS_EXTRACT_GRID_DATA, // only apply this logic to this type
  latest: true, // only take latest

  processOptions: {
    dispatchReturn: true, // use returned/resolved value(s) for dispatching
    successType: actionTypes.RT_LINE_ITEMS_EXTRACT_GRID_DATA_FULFILLED, // dispatch this success act type
    failType: actionTypes.RT_LINE_ITEMS_EXTRACT_GRID_DATA_REJECTED, // dispatch this failed action type
  },

  process({ action }) {
    // eslint-disable-next-line no-unused-vars
    const {
      payload: { data, ...rest },
    } = action;
    const result = data.map(({ bottomRight, topLeft, ...reste }) => ({
      ...reste,
      bottom_right: bottomRight,
      top_left: topLeft,
    }));
    const payload = {
      table_grid: data ? [...result] : [],
    };
    return api
      .extractGridData({ ...rest, payload })
      .then(({ responsePayload }) => responsePayload);
  },
});

const getAndStoreFolder = createLogic({
  type: actionTypes.STORE_CLICKED_FOLDER_INFO,
  latest: false,
  async process({ action, getState }, dispatch, done) {
    try {
      const { selectedFolderId } = action.payload;

      const {
        documents: { documentsById },
      } = getState();
      const data = documentsById[selectedFolderId];
      let selectedFolderData = data || {};

      if (!data && selectedFolderId) {
        const response = await api.getFolderDetail({
          folder_id: selectedFolderId,
        });
        const { data } = _.get(response, 'responsePayload');
        selectedFolderData = data || {};
      }

      dispatch({
        type: actionTypes.STORE_CLICKED_FOLDER_INFO_FULLFIED,
        payload: {
          selectedFolderData,
        },
      });
    } catch (e) {
      // Do nothing
    } finally {
      done();
    }
  },
});

const showAnalytics = createLogic({
  type: actionTypes.SHOW_ANALYTICS,
  latest: true, // take latest only
  async process({ action }, dispatch, done) {
    try {
      dispatch(appActions.showLoaderOverlay());
      const payload = _.get(action, 'payload');
      const { docType, to, from } = payload;

      const response = await Promise.all([
        api.getGeneralAnalytics({
          docType,
          queryParams: _.omitBy(
            {
              type: 'range',
              to,
              from,
            },
            _.isNil
          ),
        }),
        api.getAccuracyAnalytics({
          docType,
          queryParams: _.omitBy(
            {
              type: 'range',
              to,
              from,
            },
            _.isNil
          ),
        }),
      ]);
      const [generalAnalyticsResponse, accuracyAnalyticsResponse] = response;
      var genAnalytics =
        _.get(generalAnalyticsResponse, 'responsePayload.data') || {};
      var accAnalytics =
        _.get(accuracyAnalyticsResponse, 'responsePayload.data') || {};

      // Get the dataset we want to update
      let averageApiTimeDataset = genAnalytics.averageApiTimePerDoc.datasets[0];
      let averageTurnaroundTimeDataset =
        genAnalytics.averageTurnaroundTime.datasets[0];
      let averageCorrectionDataset = accAnalytics.averageCorrection.datasets[0];

      // Update the backgroundColor
      averageApiTimeDataset.backgroundColor = 'rgb(77, 97, 252)';
      averageTurnaroundTimeDataset.backgroundColor = 'rgb(77, 97, 252)';
      averageCorrectionDataset.backgroundColor = 'rgb(77, 97, 252)';
      dispatch({
        type: actionTypes.SET_ANALYTICS,
        payload: {
          generalAnalytics: genAnalytics,
          accuracyAnalytics: accAnalytics,
        },
        meta: action.payload,
      });
      dispatch(appActions.hideLoaderOverlay());
    } catch (e) {
      dispatch(appActions.hideLoaderOverlay());
      dispatch({
        type: actionTypes.REJECT_ANALYTICS,
        error: true,
        payload: e,
        meta: action.payload,
      });
    } finally {
      done();
    }
  },
});

const changeAnalytics = createLogic({
  type: actionTypes.CHANGE_ANALYTICS,
  latest: true, // take latest only
  async process({ action }, dispatch, done) {
    try {
      dispatch(appActions.showLoaderOverlay());
      const payload = _.get(action, 'payload');
      const { docType, type, to, from } = payload;
      const response = await Promise.all([
        api.getGeneralAnalytics({
          docType,
          queryParams: _.omitBy(
            {
              type,
              to,
              from,
            },
            _.isNil
          ),
        }),
        api.getAccuracyAnalytics({
          docType,
          queryParams: _.omitBy(
            {
              type,
              to,
              from,
            },
            _.isNil
          ),
        }),
      ]);
      const [generalAnalyticsResponse, accuracyAnalyticsResponse] = response;
      var genAnalytics =
        _.get(generalAnalyticsResponse, 'responsePayload.data') || {};
      var accAnalytics =
        _.get(accuracyAnalyticsResponse, 'responsePayload.data') || {};

      // Get the dataset we want to update
      let averageApiTimeDataset = genAnalytics.averageApiTimePerDoc.datasets[0];
      let averageTurnaroundTimeDataset =
        genAnalytics.averageTurnaroundTime.datasets[0];
      let averageCorrectionDataset = accAnalytics.averageCorrection.datasets[0];

      // Update the backgroundColor
      averageApiTimeDataset.backgroundColor = 'rgb(77, 97, 252)';
      averageTurnaroundTimeDataset.backgroundColor = 'rgb(77, 97, 252)';
      averageCorrectionDataset.backgroundColor = 'rgb(77, 97, 252)';
      dispatch({
        type: actionTypes.SET_ANALYTICS,
        payload: {
          generalAnalytics: genAnalytics,
          accuracyAnalytics: accAnalytics,
        },
        meta: action.payload,
      });
      dispatch(appActions.hideLoaderOverlay());
    } catch (e) {
      dispatch(appActions.hideLoaderOverlay());
      dispatch({
        type: actionTypes.REJECT_ANALYTICS,
        error: true,
        payload: e,
        meta: action.payload,
      });
      showToast({
        title: e?.responsePayload?.error || 'Something went wrong!',
        error: true,
      });
    } finally {
      done();
    }
  },
});

const rtDocumentSettingFetchLogic = createLogic({
  type: actionTypes.SETTING_DOCUMENT_TYPE_CONFIRMATION,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const {
        title,
        docType,
        config,
        docId,
        showOverlayLoader = true,
      } = payload;
      if (showOverlayLoader) {
        dispatch(appActions.showLoaderOverlay());
      }
      const responses = await Promise.all([
        api.getDocumentSettingFilterList({
          doc_type: docType,
          title,
        }),
        api.getDocTypeSetting({
          doc_type: docType,
          title,
        }),
        // api.getDocumentDDValues({
        //     docId,
        // }),
      ]);
      const [filterListResponse, docSettingResponse] = responses;
      dispatch({
        type: actionTypes.SETTING_DOCUMENT_TYPE_CONFIRMATION_FULFILLED,
        payload: {
          filterList: _.get(filterListResponse, 'responsePayload.data') || [],
          docSetting: _.get(docSettingResponse, 'responsePayload.data') || [],
          docType,
          config,
          docId,
          //DDfields: _.get(dataDDResponse, 'responsePayload.data') || {}
        },
      });
      if (showOverlayLoader) {
        dispatch(appActions.hideLoaderOverlay());
      }
      done();
    } catch (e) {
      const payload = _.get(action, 'payload');
      const { showOverlayLoader = true } = payload;
      dispatch({
        type: actionTypes.SETTING_DOCUMENT_TYPE_CONFIRMATION_CANCEL,
        error: true,
        payload: action.payload,
      });

      if (showOverlayLoader) {
        dispatch(appActions.hideLoaderOverlay());
      }
      showToast({
        title: e?.responsePayload?.message || 'Something went wrong!',
        error: true,
      });
      done();
    }
  },
});
const rtChangeDocumentSetting = createLogic({
  type: actionTypes.RT_CHANGE_SETTING,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const {
        title,
        docType,
        config,
        id,
        filterId,
        value,
        label = '',
      } = payload;
      const responses = await Promise.all([
        api.getDocumentSettingFilterList({
          doc_type: docType,
          title,
        }),
        api.changeDocTypeSetting({
          doc_type: docType,
          id,
          filterId,
          value,
        }),
        // api.getDocumentDDValues({
        //     docId,
        // }),
      ]);
      const [filterListResponse, docSettingResponse] = responses;
      await dispatch({
        type: actionTypes.RT_SET_SETTING_DATA,
        payload: {
          filterList: _.get(filterListResponse, 'responsePayload.data') || [],
          docSetting: _.get(docSettingResponse, 'responsePayload.data') || [],
          docType,
          config,
          //DDfields: _.get(dataDDResponse, 'responsePayload.data') || {}
        },
      });
      // For disable doc type switch in DOc Settings
      if (filterId === 2 && label === 'Disable Document Type') {
        dispatch({
          type: actionTypes.DOWNLOAD_DOCUMENT_TYPE_HIDE_CONFIRMATION,
          payload: {
            docType,
          },
        });
        dispatch({
          type: actionTypes.ALL_DOCUMENTS_TYPE_FETCH,
          payload: {},
        });
        showToast({
          title: 'Document type disabled successfully!',
          success: true,
        });
      }
      done();
    } catch (e) {
      const { message = '' } = e.responsePayload || {};
      const payload = _.get(action, 'payload');
      const { checkErrorAlert } = payload;
      const errorMsg =
        message ||
        'An error occurred while updating settings. Please try again later.';

      dispatch(
        appActions.setToast({
          error: true,
          title: errorMsg,
        })
      );
      checkErrorAlert && checkErrorAlert();
      done();
    }
  },
});
const rtRealTimeUpdateLogic = createLogic({
  type: actionTypes.RT_REAL_TIME_UPDATE,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const { docId, response, currentId } = payload;
      const { ddOptions: ddValue, item: currentItems } = response;
      let item = currentItems.filter((current) => current.id !== currentId);

      const fieldIds = item.map((field) => field.id);
      if (Object.keys(ddValue).length !== 0) {
        dispatch({
          type: actionTypes.RT_DROP_DOWN_FETCH_FULLFILLED,
          payload: {
            ddValue,
          },
        });
      }
      for (let i = 0; i < fieldIds.length; i++) {
        dispatch({
          type: actionTypes.RT_REAL_TIME_UPDATE_FULFILLED,
          payload: {
            docId,
            fieldId: fieldIds[i],
            item: item.filter((p) => p.id === fieldIds[i]),
          },
        });
      }
      // dispatch({
      //     type: actionTypes.RT_SET_SETTING_DATA,
      //     payload: {

      //         //DDfields: _.get(dataDDResponse, 'responsePayload.data') || {}
      //     },
      // });
      done();
    } catch (e) {
      // dispatch({
      //     type: actionTypes.SETTING_DOCUMENT_TYPE_CONFIRMATION_CANCEL,
      //     error: true,
      //     payload: action.payload
      // });
      done();
    }
  },
});

const documentTypeStatusUpdateLogic = createLogic({
  type: actionTypes.UPDATE_DOCUMENT_TYPE_STATUS,
  latest: true, // take latest only

  async process({ action }, dispatch, done) {
    try {
      const payload = _.get(action, 'payload');
      const {
        serviceId,
        status,
        title,
        refresh = false,
        uploadSample = false,
      } = payload;

      const response = await api.updateStatusServices({
        serviceId,
        status,
        title,
        uploadSample,
      });

      const data = _.get(response.responsePayload, 'data');

      // Update documentTypes of config in store
      await dispatch({
        type: configAction.UPDATE_CONFIG,
        payload: {
          updates: {
            documentTypes: data,
          },
        },
      });

      if (refresh) {
        // To get latest document types data,
        // since frontend won't have data of recently enabled doc type
        await dispatch({
          type: docAction.ALL_DOCUMENTS_TYPE_FETCH,
        });
      }
      showToast({
        title: `Document type ${status ? 'enabled' : 'disabled'} successfully!`,
        success: true,
      });
      done();
    } catch (e) {
      done();
    }
  },
});

export const changeFieldOrder = createLogic({
  type: actionTypes.CHANGE_FIELD_ORDER,
  latest: true,
  async process({ action }, dispatch, done) {
    try {
      const response = await api.changeFieldOrder(action.payload);

      if (response) {
        dispatch({
          type: actionTypes.CHANGE_FIELD_ORDER_FULFILLED,
          payload: response?.responsePayload,
          meta: action.payload,
        });

        dispatch({
          type: actionTypes.SET_EDIT_FIELD_CHANGES,
          payload: true,
        });

        done();
      }
    } catch (e) {
      dispatch({
        type: actionTypes.CHANGE_FIELD_ORDER_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(
        appActions.setToast({
          title:
            e?.responsePayload?.message ||
            'An error occurred while updating field. Please try again later.',
          error: true,
        })
      );
      done();
    }
  },
});
export const changeFieldVisibility = createLogic({
  type: actionTypes.CHANGE_FIELD_VISIBILITY,
  latest: true,
  async process({ action }, dispatch, done) {
    try {
      const response = await api.changeFieldVisiblity(action.payload);

      if (response) {
        dispatch({
          type: actionTypes.CHANGE_FIELD_VISIBILITY_FULFILLED,
          payload: action.payload,
          meta: action.payload,
        });

        dispatch({
          type: actionTypes.SET_EDIT_FIELD_CHANGES,
          payload: true,
        });

        done();
      }
    } catch (error) {
      dispatch({
        type: actionTypes.CHANGE_FIELD_VISIBILITY_REJECTED,
        error: true,
        payload: error,
        meta: action.payload,
      });
      dispatch(
        appActions.setToast({
          title:
            error?.responsePayload?.message ||
            'An error occurred while updating field. Please try again later.',
          error: true,
        })
      );
      done();
    }
  },
});

export const changeFieldType = createLogic({
  type: actionTypes.CHANGE_FIELD_TYPE,
  latest: true,
  async process({ action }, dispatch, done) {
    try {
      const response = await api.changeFieldType(action.payload);

      if (response) {
        dispatch({
          type: actionTypes.CHANGE_FIELD_TYPE_FULFILLED,
          payload: response?.responsePayload,
          meta: action.payload,
        });
        dispatch({
          type: actionTypes.SET_EDIT_FIELD_CHANGES,
          payload: true,
        });
        done();
      }
    } catch (e) {
      dispatch({
        type: actionTypes.CHANGE_FIELD_TYPE_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(
        appActions.setToast({
          title:
            e?.responsePayload?.message ||
            'An error occurred while updating field. Please try again later.',
          error: true,
        })
      );
      done();
    }
  },
});

export default [
  deleteDocLogic,
  documentCountsFetchLogic,
  allDocumentsFetchLogic,

  createDocumentTypeLogic,
  allDocumentsTypesFetchLogic,
  duplicateDocumentType,

  reviewDocumentsFetchLogic,
  skippedDocumentsFetchLogic,
  processedDocumentsFetchLogic,

  rtStartReviewLogic,
  rtStartSingleReviewLogic,
  getDocumentTypesDynamicLogic,

  rtStartDocumentReviewLogic,

  rtGoToDocumentLogic,

  rtDocumentDataFetchLogic,

  rtDocumentSearchLogic,

  rtUpdateFieldValueLogic,
  rtStartEditFieldLogic,
  // rtPersistFieldDataLogic,

  rtAddNewSectionTable,
  rtDeleteSection,
  rtAddSectionField,
  rtDeleteSectionField,
  rtFilterSectionField,
  rtAdditionalFilter,
  rtAddNewFooteColumnLogic,

  rtAddLineLogic,
  rtAddSimilarLinesLogic,

  rtDeleteLineItemRowLogic,
  rtDeleteAllLineItemRowsLogic,
  rtDeleteLineItemFieldsLogic,

  manageLineGrid,
  extractGridData,
  extractSimilarTables,
  getAndStoreFolder,
  showAnalytics,
  changeAnalytics,
  rtDropDownFetchLogic,
  rtDocumentSettingFetchLogic,
  rtChangeDocumentSetting,
  rtLineItemDropDownFetchLogic,
  rtUpdateStandardFilter,
  rtDropDownMapFetchLogic,
  rtRealTimeUpdateLogic,
  rtUpdateDocumentId,
  rtDocumentDataLoadFetchLogic,

  rtStartExcelViewLogic,
  rtStartSingleExcelViewLogic,
  rtStartDocumentExcelViewLogic,
  rtGoToExcelDocumentLogic,
  rtDocumentExcelDataFetchLogic,
  updateSummaryLogic,
  rtUpdateReviewLogic,
  rtLineItemRejectLogic,
  rtLineItemSuccessLogic,

  documentTypeStatusUpdateLogic,
  changeFieldVisibility,

  changeFieldType,
  changeFieldOrder,
  rtcustomDocTypeEditFieldFlow,
];
