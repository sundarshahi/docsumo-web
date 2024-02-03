import { handleActions } from 'redux-actions';

import _ from 'lodash';
import * as apiConstants from 'new/constants/api';

import { actionTypes } from './actions';

export const SERVICE_PAGE = 'servicePage';
export const SERVICE_TOOL = 'serviceTool';

function getInitialState() {
  return {
    [SERVICE_PAGE]: {
      documentIds: [],
      meta: {},
      fetchState: null,
      updatingServiceIds: [],
    },
  };
}

export default handleActions(
  {
    [actionTypes.SERVICE_FETCH](state) {
      return {
        ...state,
        [SERVICE_PAGE]: {
          ...state[SERVICE_PAGE],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.SERVICE_FETCH_FULFILLED](state, { payload }) {
      const data = _.get(payload.responsePayload, 'data', {});

      return {
        ...state,
        [SERVICE_PAGE]: {
          ...state[SERVICE_PAGE],
          services: data,
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.SERVICE_FETCH_REJECTED](state) {
      return {
        ...state,
        [SERVICE_PAGE]: {
          ...state[SERVICE_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },
    [actionTypes.SERVICE_RESET](state) {
      return {
        ...state,
        [SERVICE_PAGE]: {
          services: [],
          meta: {},
        },
      };
    },
    [actionTypes.SERVICE_IS_UPDATING](
      state,
      { payload: { serviceId, action } }
    ) {
      let updatingServiceIds = state[SERVICE_PAGE].updatingServiceIds;
      if (action === 'remove') {
        updatingServiceIds.splice(updatingServiceIds.indexOf(serviceId), 1);
      } else if (action === 'add') {
        updatingServiceIds = [...new Set(updatingServiceIds), serviceId];
      }

      return {
        ...state,
        [SERVICE_PAGE]: {
          ...state[SERVICE_PAGE],
          updatingServiceIds: updatingServiceIds,
        },
      };
    },
  },
  getInitialState()
);
