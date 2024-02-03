import { mapArrToStateKeys } from 'new/redux/reducerHelpers';
import { handleActions } from 'redux-actions';

import _ from 'lodash';

import { actionTypes } from './actions';

export const CLASSIFY_VIEW = 'classifyView';

function getInitialState() {
  return {
    originLocation: null,
    documentIds: [],
    documentsById: {},
    fetchingDataForDocId: null,
    fetchDataFailedForDocId: null,
    docId: null,
  };
}

export default handleActions(
  {
    [actionTypes.START_CLASSIFY_FULFILLED](state, { payload, meta }) {
      const { originLocation } = meta;
      const data = _.get(payload.responsePayload, 'data', {});
      const { documents } = data;
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(documents, { idKey: 'docId' });

      return {
        ...state,
        originLocation,
        documentsById,
        documentIds,
      };
    },
    [actionTypes.UPDATE_CLASSIFY_DATA](state, { payload }) {
      const { docId } = payload;
      const { documentsById, documentIds } = state;
      let newDocumentsIds = documentIds.filter((item) => item !== docId);
      let newDocumentsById = _.flow([
        Object.entries,
        (arr) => arr.filter(([key]) => key !== docId),
        Object.fromEntries,
      ])(documentsById);

      return {
        ...state,
        documentsById: newDocumentsById,
        documentIds: newDocumentsIds,
      };
    },
  },
  getInitialState()
);
