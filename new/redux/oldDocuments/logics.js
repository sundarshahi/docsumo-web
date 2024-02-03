import { createLogic } from 'redux-logic';

import _ from 'lodash';
import * as api from 'new/api';
import * as documentConstants from 'new/constants/document';

import { actionTypes } from './actions';

const oldRtGoToDocumentLogic = createLogic({
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

const oldRtDocumentDataFetchLogic = createLogic({
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
            api.getDocumentDataV1({
              docId,
            }),
            api.getDocumentAllTableGridsV1({
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

const oldRtDocumentDataLoadFetchLogic = createLogic({
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
            api.getDocumentDataV1({
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

const oldRtLineItemDropDownFetchLogic = createLogic({
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
              k < sections[i].children[j].children[0].length;
              k++
            ) {
              if (
                sections[i].children[j].children[0][k].type === 'drop_down' &&
                sections[i].children[j].children[0][k].dropDownType === 'list'
              ) {
                const response = await api.getDocumentDDValues({
                  itemId: sections[i].children[j].children[0][k].id,
                  type,
                  label: sections[i].children[j].children[0][k].label,
                  pType: sections[i].children[j].type,
                });
                // lineItem.push(j);
                // lineItemData[j] = [];
                const data = _.get(response, 'responsePayload.data');
                sections[i].children[j].children[0][k].options = data;
                // lineItemData[j].push({[k] : data});
                // dropDownData[k] = data;
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
              k < sections[i].children[j].children[0].length;
              k++
            ) {
              if (
                sections[i].children[j].children[0][k] &&
                sections[i].children[j].children[0][k].type === 'drop_down' &&
                sections[i].children[j].children[0][k].dropDownType === 'list'
              ) {
                for (
                  let m = 0;
                  m < sections[i].children[j].children.length;
                  m++
                ) {
                  sections[i].children[j].children[m][k].options =
                    sections[i].children[j].children[0][k].options;
                  sections[i].children[j].children[m][k].dropDownType = 'list';
                }
              }
            }
          }
        }
      }

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

const oldRtAddLineLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_ADD_LINE,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const { docId, sectionFieldId, onSuccess, baseItemId, onSave } =
        action.payload;

      const response = await api.reviewAddLineV1({
        docId,
        sectionFieldId,
        baseItemId,
      });

      const data = _.get(response.responsePayload, 'data', {});
      const children = data.lines[0].children;
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
        type: actionTypes.RT_LINE_ITEMS_UPDATE_CHILDREN,
        payload: {
          columns,
          rows,
        },
        meta: action.payload,
      });

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

const oldRtAddSimilarLinesLogic = createLogic({
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
        const result = data.map(({ bottomRight, topLeft, ...reste }) => ({
          ...reste,
          bottom_right: bottomRight,
          top_left: topLeft,
        }));
        const payload = {
          table_grid: data ? [...result] : [],
          doc_type: docType,
        };
        response = await api.extractGridDataV1({ ...rest, payload });
      } else {
        response = await api.reviewAddSimilarLines({
          docId,
          sectionFieldId,
        });
      }

      const data = _.get(response.responsePayload, 'data', {});
      const children = data.lines[0].children;
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

      dispatch({
        type: actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES_FULFILLED,
        payload: response,
        meta: action.payload,
      });
      if (data) {
        afterAction();
      }
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.RT_LINE_ITEMS_ADD_SIMILAR_LINES_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      done();
    }
  },
});

const oldRtDeleteLineItemRowLogic = createLogic({
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
      } = action.payload;

      dispatch({
        type: actionTypes.RT_LINE_ITEMS_DELETE_FIELDS,
        payload: {
          docId,
          sectionFieldId,
          rowIds: [rowId],
          rowFieldIds,
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

const oldRtDeleteAllLineItemRowsLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_DELETE_ALL_ROWS,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const {
        docId,
        sectionFieldId,
        rowIds,
        rowFieldIds,
        onSuccess,
        onFailure,
      } = action.payload;

      dispatch({
        type: actionTypes.RT_LINE_ITEMS_DELETE_FIELDS,
        payload: {
          docId,
          sectionFieldId,
          rowIds,
          rowFieldIds,
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

const oldRtDeleteLineItemFieldsLogic = createLogic({
  type: actionTypes.RT_LINE_ITEMS_DELETE_FIELDS,
  latest: false,

  async process({ action }, dispatch, done) {
    try {
      const { docId, sectionFieldId, rowFieldIds, onSuccess } = action.payload;

      const response = await api.reviewDeleteLineItemFieldsV1({
        docId,
        sectionFieldId,
        fieldIds: rowFieldIds,
      });

      dispatch({
        type: actionTypes.RT_LINE_ITEMS_DELETE_FIELDS_FULFILLED,
        payload: response,
        meta: action.payload,
      });

      done();

      if (onSuccess && _.isFunction(onSuccess)) {
        onSuccess();
      }
    } catch (e) {
      dispatch({
        type: actionTypes.RT_LINE_ITEMS_DELETE_FIELDS_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });

      done();

      const { onFailure } = action.payload;
      if (onFailure && _.isFunction(onFailure)) {
        onFailure();
      }
    }
  },
});

const oldManageLineGrid = createLogic({
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
      payload = data.map(({ bottomRight, topLeft, ...reste }) => ({
        ...reste,
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
          .postDocumentGridsV1({
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
          .addDocumentGridsV1({ ...rest, payload: bbox })
          .then(({ responsePayload }) => responsePayload)
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
        return api
          .getDocumentGridsV1({ ...rest })
          .then(({ responsePayload }) => {
            if (!responsePayload?.data?.length) {
              gridViewEnable();
            }
            return responsePayload;
          });
    }
    /* eslint-enable indent */
  },
});

export default [
  oldRtGoToDocumentLogic,
  oldRtDeleteAllLineItemRowsLogic,
  oldRtDocumentDataFetchLogic,
  oldRtDocumentDataLoadFetchLogic,
  oldRtAddLineLogic,
  oldRtAddSimilarLinesLogic,

  oldRtDeleteLineItemRowLogic,
  oldRtDeleteLineItemFieldsLogic,

  oldManageLineGrid,

  oldRtLineItemDropDownFetchLogic,
];
