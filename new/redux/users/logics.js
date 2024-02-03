import { createLogic } from 'redux-logic';

import { get } from 'lodash';
import * as api from 'new/api';

import { actionTypes } from './actions';

const usersFetchLogic = createLogic({
  type: actionTypes.USERS_FETCH,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = get(action, 'payload.queryParams');
      const response = await api.getMembers({
        queryParams: {
          ...queryParams,
        },
      });

      await dispatch({
        type: actionTypes.USERS_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.USERS_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

export default [usersFetchLogic];
