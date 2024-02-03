import { createLogic } from 'redux-logic';

import _ from 'lodash';
import * as api from 'new/api';

import { actionTypes } from './actions';

export const userFetchLogic = createLogic({
  type: actionTypes.USER_AND_CONFIG_FETCH,
  async process(_unused, dispatch, done) {
    try {
      const [userResponse, configResponse] = await api.apiClient.all([
        api.getUser(),
        api.getConfig(),
      ]);
      const { user } = _.get(userResponse.responsePayload, 'data');
      const config = _.get(configResponse.responsePayload, 'data');

      dispatch({
        type: actionTypes.USER_AND_CONFIG_FETCH_FULFILLED,
        payload: { user, config },
      });
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.USER_AND_CONFIG_FETCH_REJECTED,
        error: true,
        payload: e,
      });
      done();
    }
  },
});

export const setConfigFlagsLogic = createLogic({
  type: actionTypes.SET_CONFIG_FLAGS,
  async process({ action }, dispatch, done) {
    const flags = action.payload;
    const flagsPayload = {};
    Object.keys(flags).forEach((key) => {
      const snakeCaseKey = _.snakeCase(key);
      flagsPayload[snakeCaseKey] = flags[key];
    });

    try {
      await api.updateConfigFlags({
        payload: flagsPayload,
      });

      dispatch({
        type: actionTypes.SET_CONFIG_FLAGS_FULFILLED,
        meta: {
          flags,
        },
      });
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.SET_CONFIG_FLAGS_REJECTED,
        error: true,
        payload: e,
        meta: {
          flags,
        },
      });
      done();
    }
  },
});

export const getTooltipFlowLogic = createLogic({
  type: actionTypes.SET_TOOLTIP_FLOW_DATAS, // only apply this logic to this type
  latest: true, // only take latest

  processOptions: {
    dispatchReturn: true, // use returned/resolved value(s) for dispatching
    successType: actionTypes.SET_TOOLTIP_FLOW_DATAS_FULFILLED, // dispatch this success act type
  },

  process() {
    // eslint-disable-next-line no-unused-vars
    return api.getUserFlow().then(({ responsePayload }) => responsePayload);
  },
});

export const updatePermissonConfigLogic = createLogic({
  type: actionTypes.UPDATE_PERMISSION_CONFIG,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: actionTypes.UPDATE_PERMISSION_CONFIG_FULFILLED,
    failType: actionTypes.UPDATE_PERMISSION_CONFIG_REJECTED,
  },

  process() {
    return api.getServices();
  },
});

export default [
  userFetchLogic,
  setConfigFlagsLogic,
  getTooltipFlowLogic,
  updatePermissonConfigLogic,
];
