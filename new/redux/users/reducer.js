import { handleActions } from 'redux-actions';

import _ from 'lodash';
import * as apiConstants from 'new/constants/api';

import { actionTypes } from './actions';

export const USERS_PAGE = 'usersPage';
export const USERS_TOOL = 'usersTool';

function getInitialState() {
  return {
    [USERS_PAGE]: {
      documentIds: [],
      meta: {},
      fetchState: null,
      users: [],
      editUserId: null,
      addUser: false,
    },
  };
}

export default handleActions(
  {
    [actionTypes.USERS_FETCH](state) {
      return {
        ...state,
        [USERS_PAGE]: {
          ...state[USERS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.USERS_FETCH_FULFILLED](state, { payload }) {
      const { users, ...meta } = _.get(payload.responsePayload, 'data', {});

      return {
        ...state,
        [USERS_PAGE]: {
          ...state[USERS_PAGE],
          users: users,
          meta,
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.USERS_FETCH_REJECTED](state) {
      return {
        ...state,
        [USERS_PAGE]: {
          ...state[USERS_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },

    [actionTypes.SERVICE_RESET](state) {
      return {
        ...state,
        [USERS_PAGE]: {
          users: [],
          meta: {},
        },
      };
    },

    [actionTypes.USERS_DELETE](state, { payload }) {
      const user = _.get(payload, 'user', {});
      const currentUsers = _.get(state[USERS_PAGE], 'users');
      const newUsers = _.filter(currentUsers, (u) => u.userId !== user);
      return {
        ...state,
        [USERS_PAGE]: {
          ...state[USERS_PAGE],
          users: [...newUsers],
        },
      };
    },

    [actionTypes.CURRENT_USER](state, { payload }) {
      const currentUserId = _.get(payload, 'currentUserId', {});
      const addUser = _.get(payload, 'addUser', {});
      return {
        ...state,
        [USERS_PAGE]: {
          ...state[USERS_PAGE],
          editUserId: currentUserId,
          addUser: addUser,
        },
      };
    },
  },
  getInitialState()
);
