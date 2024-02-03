import { actions as appActions } from 'new/redux/app/actions';
import { createLogic } from 'redux-logic';

import _ from 'lodash';
import * as api from 'new/api';
import routes from 'new/constants/routes';
import history from 'new/history';

import { actionTypes } from './actions';

const csvFetchLogic = createLogic({
  type: actionTypes.CSV_FETCH,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      const response = await api.getCSVList({ queryParams });

      await dispatch({
        type: actionTypes.CSV_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.CSV_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

const openTableViewLogic = createLogic({
  type: actionTypes.OPEN_TABLE_VIEW,
  process: async function ({ getState, action }, dispatch, done) {
    try {
      let ddId = _.get(action.payload, 'ddId');
      let queryParams = _.get(action.payload, 'queryParams');
      await dispatch(appActions.showLoaderOverlay());
      const response = await api.getTableViewData({
        ddId,
        queryParams: {
          ...queryParams,
        },
      });
      const { data, ...meta } = _.get(response, 'responsePayload.data');
      const documents = data;
      if (_.isEmpty(documents)) {
        let response = await api.getCSVHeader({
          dropDownId: ddId,
        });
        var header = _.get(response, 'responsePayload.data');
        dispatch(appActions.hideLoaderOverlay());
      }

      await dispatch({
        type: actionTypes.OPEN_TABLE_VIEW_FULFILLED,
        payload: response,
        meta: {
          ddId,
          header,
          ...meta,
        },
      });

      const {
        csv: {
          csvPage: { csv },
        },
      } = getState();

      let docId = _.get(action.payload, 'ddId');
      docId = docId || csv[0].ddId;
      if (!queryParams) {
        await history.push(`${routes.DATABASE_TABLE}/${docId}`, {
          docId: docId,
          title: csv[0].title,
        });
      }
      dispatch(appActions.hideLoaderOverlay());
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.OPEN_TABLE_VIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});
const getUpdatedTableViewLogic = createLogic({
  type: actionTypes.GET_UPDATED_TABLE_VIEW,
  process: async function ({ action }, dispatch, done) {
    try {
      let ddId = _.get(action.payload, 'ddId');
      let queryParams = _.get(action.payload, 'queryParams');
      //await dispatch(appActions.showLoaderOverlay());
      const response = await api.getTableViewData({
        ddId,
        queryParams: {
          ...queryParams,
        },
      });
      const { data, ...meta } = _.get(response, 'responsePayload.data');
      const documents = data;
      if (_.isEmpty(documents)) {
        let response = await api.getCSVHeader({
          dropDownId: ddId,
        });
        var header = _.get(response, 'responsePayload.data');
        dispatch(appActions.hideLoaderOverlay());
      }

      await dispatch({
        type: actionTypes.OPEN_TABLE_VIEW_FULFILLED,
        payload: response,
        meta: {
          ddId,
          header,
          ...meta,
        },
      });
      //dispatch(appActions.hideLoaderOverlay());
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.OPEN_TABLE_VIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      // dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});

export default [csvFetchLogic, openTableViewLogic, getUpdatedTableViewLogic];
