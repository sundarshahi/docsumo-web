import { mapArrToStateKeys } from 'new/redux/reducerHelpers';
import { handleActions } from 'redux-actions';

import _ from 'lodash';
import * as apiConstants from 'new/constants/api';

import { actionTypes } from './actions';

export const CSV_PAGE = 'csvPage';
export const CSV_TOOL = 'csvTool';
export const TABLE_VIEW = 'tableView';

function getTableInitialView() {
  return {
    rowIds: [],
    headers: [],
    ddId: null,
    datas: [],
    selectedAll: false,
    selectedList: [],
    fieldById: {},
    meta: {},
  };
}

function getInitialState() {
  return {
    documentsById: {},
    uploadCsv: false,
    selectedField: null,
    [CSV_PAGE]: {
      documentIds: [],
      meta: {},
      fetchState: null,
      csv: [],
      editCSVId: null,
    },
    [TABLE_VIEW]: getTableInitialView(),
  };
}

export default handleActions(
  {
    [actionTypes.CSV_FETCH](state) {
      return {
        ...state,
        [CSV_PAGE]: {
          ...state[CSV_PAGE],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.CSV_FETCH_FULFILLED](state, { payload }) {
      const { ddData, ...meta } = _.get(payload.responsePayload, 'data', {});
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(ddData, { idKey: 'ddId' });

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          ...documentsById,
        },

        [CSV_PAGE]: {
          ...state[CSV_PAGE],
          documentIds: documentIds,
          csv: ddData,
          meta: meta,
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.CSV_FETCH_REJECTED](state) {
      return {
        ...state,
        [CSV_PAGE]: {
          ...state[CSV_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },

    [actionTypes.SET_CHECKBOX_SELECTION_ALL](state, { payload }) {
      const { checked } = payload;
      const { documentIds = [] } = state[CSV_PAGE];
      return {
        ...state,
        [CSV_PAGE]: {
          ...state[CSV_PAGE],
          selectedAll: checked,
          slectedList: checked ? [...documentIds] : [],
        },
      };
    },
    [actionTypes.SET_CHECKBOX_SELECTION_INDIVIDUAL](state, { payload }) {
      const { checked } = payload;
      const { documentIds = [] } = state[CSV_PAGE];
      return {
        ...state,
        [CSV_PAGE]: {
          ...state[CSV_PAGE],
          slectedList: checked,
          selectedAll: !!(
            checked.length && documentIds.length === checked.length
          ),
        },
      };
    },

    [actionTypes.SHOW_UPLOAD_CSV_MODAL](state) {
      return {
        ...state,
        uploadCsv: true,
      };
    },

    [actionTypes.HIDE_UPLOAD_CSV_MODAL](state) {
      return {
        ...state,
        uploadCsv: false,
      };
    },
    [actionTypes.STORE_CSV_DOCUMENT_ID](state, { payload }) {
      const { currentCSVDocId } = payload;
      return {
        ...state,
        currentCSVDocId,
      };
    },

    [actionTypes.OPEN_TABLE_VIEW_FULFILLED](state, { payload, meta }) {
      const { data = [] } = payload.responsePayload.data;

      const { ddId, header, ...rem } = meta;
      if (data.length === 0) {
        let headerObject = header.filter((item) => {
          if (item.label !== 'None') return item.label;
        });
        let headers = headerObject.map((item) => item.label);

        return {
          ...state,
          [TABLE_VIEW]: {
            ...getTableInitialView(),
            ddId: ddId,
            headers,
            meta: {
              ...state[TABLE_VIEW].meta,
              ...rem,
            },
          },
        };
      }
      let headers = Object.keys(data[0]).filter((item) => {
        if (item !== 'id') return item;
      });
      let rowIds = data.map((item) => item.id);
      let fieldById = {};

      for (let i = 0; i < rowIds.length; i++) {
        for (let j = 0; j < data.length; j++) {
          if (rowIds[i] === data[j].id) {
            fieldById[rowIds[i]] = data[j];
          }
        }
      }
      return {
        ...state,
        [TABLE_VIEW]: {
          ...getTableInitialView(),
          datas: data,
          headers,
          rowIds,
          ddId: ddId,
          fieldById,
          meta: {
            ...state[TABLE_VIEW].meta,
            ...rem,
          },
        },
      };
    },
    [actionTypes.OPEN_TABLE_VIEW_REJECTED](state) {
      return {
        ...state,
        [TABLE_VIEW]: {
          ...getTableInitialView(),
        },
      };
    },

    [actionTypes.SET_TABLE_CHECKBOX_SELECTION_ALL](state, { payload }) {
      const { checked } = payload;
      const { rowIds = [] } = state[TABLE_VIEW];
      return {
        ...state,
        [TABLE_VIEW]: {
          ...state[TABLE_VIEW],
          selectedAll: checked,
          selectedList: checked ? [...rowIds] : [],
        },
      };
    },
    [actionTypes.SET_TABLE_CHECKBOX_SELECTION_INDIVIDUAL](state, { payload }) {
      const { checked } = payload;
      const { rowIds = [] } = state[TABLE_VIEW];
      return {
        ...state,
        [TABLE_VIEW]: {
          ...state[TABLE_VIEW],
          selectedList: checked,
          selectedAll: !!(checked.length && rowIds.length === checked.length),
        },
      };
    },

    [actionTypes.UPDATED_TABLE_VIEW_FULFILLED](state, { payload, meta }) {
      const { data = {} } = payload.responsePayload;
      let rowIds = data.map((item) => item.id);
      const { ddId } = meta;
      return {
        ...state,
        [TABLE_VIEW]: {
          ...getTableInitialView(),
          datas: data,
          rowIds,
          ddId: ddId,
        },
      };
    },
    [actionTypes.SET_DELETE_CSV_ROW](state) {
      const { rowIds = [] } = state[TABLE_VIEW];
      const { selectedList = [] } = state[TABLE_VIEW];
      const { datas = [] } = state[TABLE_VIEW];

      const filteredRow = rowIds.filter(
        (value) => !selectedList.includes(value)
      );
      const filteredData = datas.filter(
        (data) => !selectedList.includes(data.id)
      );

      return {
        ...state,
        [TABLE_VIEW]: {
          ...state[TABLE_VIEW],
          rowIds: filteredRow,
          datas: filteredData,
        },
      };
    },
    [actionTypes.SET_FIELD_FOCUS](state, { payload }) {
      const { fieldId } = payload;

      return {
        ...state,
        selectedField: fieldId,
      };
    },

    // [actionTypes.SERVICE_RESET] (state) {
    //     return {
    //         ...state,
    //         [CSV_PAGE]: {
    //             users: [],
    //             meta: {},
    //         },
    //     };
    // },

    // [ actionTypes.CSV_DELETE] (state, { payload }) {
    //     const user = _.get(payload, 'user', {});
    //     const currentUsers = _.get(state[CSV_PAGE], 'users');
    //     const newUsers = _.filter(currentUsers, (u) => u.userId !== user);
    //     return {
    //         ...state,
    //         [CSV_PAGE]: {
    //             ...(state[CSV_PAGE]),
    //             users: [ ...newUsers ],
    //         },
    //     };
    // },

    // [ actionTypes.CURRENT_USER] (state, { payload }) {
    //     const currentUserId = _.get(payload, 'currentUserId', {});
    //     const addUser = _.get(payload, 'addUser', {});
    //     return {
    //         ...state,
    //         [CSV_PAGE]: {
    //             ...(state[CSV_PAGE]),
    //             editUserId: currentUserId,
    //             addUser : addUser
    //         },
    //     };

    // }
  },
  getInitialState()
);
