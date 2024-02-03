import { actions as appActions } from 'new/redux/app/actions';
import { createLogic } from 'redux-logic';

import _ from 'lodash';
import * as api from 'new/api';
import routes from 'new/constants/routes';
import history from 'new/history';
import * as utils from 'new/utils';

import { actionTypes } from './actions';

const modelFetchLogic = createLogic({
  type: actionTypes.MODEL_FETCH,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      const response = await api.getMODELList({
        queryParams: {
          ...queryParams,
        },
      });
      const { responsePayload } = await api.getModelTypes();
      let modelTypeData = _.get(responsePayload, 'data');
      const configResponse = await api.getDocumentModelConfig();
      let documentModelConfig = configResponse.responsePayload.data;
      if (typeof response.responsePayload === 'string') {
        var result = JSON.parse(
          response.responsePayload.replace(/\bNaN\b/g, '0')
        );
        const data = utils.camelCase(result.data);
        await dispatch({
          type: actionTypes.MODEL_FETCH_FULFILLED,
          payload: {
            responsePayload: { data },
          },
          modelTypeData,
          documentModelConfig,
        });
        done();
        return;
      }
      await dispatch({
        type: actionTypes.MODEL_FETCH_FULFILLED,
        payload: response,
        modelTypeData,
        documentModelConfig,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.MODEL_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

const openSingleViewLogic = createLogic({
  type: actionTypes.OPEN_SINGLE_VIEW,
  process: async function ({ getState, action }, dispatch, done) {
    try {
      let mId = _.get(action.payload, 'modelId');
      await dispatch(appActions.showLoaderOverlay());
      const response = await api.getModelSingleViewData({
        mId,
      });
      // const documents = _.get(response, 'responsePayload.data');
      // if (_.isEmpty(documents)) {
      //     dispatch(appActions.hideLoaderOverlay());
      //     return;
      // }

      if (typeof response.responsePayload === 'string') {
        var result = JSON.parse(
          response.responsePayload.replace(/\bNaN\b/g, '0')
        );

        const data = utils.camelCase(result.data);
        await dispatch({
          type: actionTypes.OPEN_SINGLE_VIEW_FULFILLED,
          payload: {
            responsePayload: { data },
          },
        });
      }

      if (!(typeof response.responsePayload === 'string')) {
        await dispatch({
          type: actionTypes.OPEN_SINGLE_VIEW_FULFILLED,
          payload: response,
          meta: {
            ...action.payload,
          },
        });
      }

      const {
        model: {
          modelPage: { model },
        },
      } = getState();

      let modelId = _.get(action.payload, 'modelId');
      modelId = modelId || model[0].modelId;
      await history.push(`${routes.MODEL}${modelId}`, {
        modelId,
      });
      await dispatch(appActions.hideLoaderOverlay());
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.OPEN_SINGLE_VIEW_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});

// const openTableViewLogic = createLogic({
//     type: actionTypes.OPEN_TABLE_VIEW,
//     process: async function ({ getState, action }, dispatch, done) {
//         try {
//             let ddId = _.get(action.payload, 'ddId');
//             await dispatch(appActions.showLoaderOverlay());
//             const response = await api.getTableViewData({
//                 ddId
//             });
//             const documents = _.get(response, 'responsePayload.data');
//             if (_.isEmpty(documents)) {
//                 let response = await api.getMODELHeader({
//                     dropDownId : ddId
//                 });
//                 var header = _.get(response, 'responsePayload.data');
//                 dispatch(appActions.hideLoaderOverlay());
//             }

//             await dispatch({
//                 type: actionTypes.OPEN_TABLE_VIEW_FULFILLED,
//                 payload: response,
//                 meta: {
//                     ...action.payload,
//                     header
//                 },
//             });

//             const { csv: { csvPage : { csv } } } = getState();

//             let docId = _.get(action.payload, 'ddId');
//             docId = docId || csv[0].ddId;
//             await history.push(`/database-table/${docId}`);
//             dispatch(appActions.hideLoaderOverlay());
//             done();
//         } catch (e) {
//             dispatch({
//                 type: actionTypes.OPEN_TABLE_VIEW_REJECTED,
//                 error: true,
//                 payload: e,
//                 meta: action.payload,
//             });
//             dispatch(appActions.hideLoaderOverlay());
//             done();
//         }
//     }
// });
// const getUpdatedTableViewLogic = createLogic({
//     type: actionTypes.GET_UPDATED_TABLE_VIEW,
//     process: async function ({ action }, dispatch, done) {
//         try {
//             let ddId = _.get(action.payload, 'ddId');
//             //await dispatch(appActions.showLoaderOverlay());
//             const response = await api.getTableViewData({
//                 ddId
//             });
//             const documents = _.get(response, 'responsePayload.data');
//             if (_.isEmpty(documents)) {
//                 let response = await api.getMODELHeader({
//                     dropDownId : ddId
//                 });
//                 var header = _.get(response, 'responsePayload.data');
//                 dispatch(appActions.hideLoaderOverlay());
//             }

//             await dispatch({
//                 type: actionTypes.OPEN_TABLE_VIEW_FULFILLED,
//                 payload: response,
//                 meta: {
//                     ...action.payload,
//                     header
//                 },
//             });
//             //dispatch(appActions.hideLoaderOverlay());
//             done();
//         } catch (e) {
//             dispatch({
//                 type: actionTypes.OPEN_TABLE_VIEW_REJECTED,
//                 error: true,
//                 payload: e,
//                 meta: action.payload,
//             });
//             // dispatch(appActions.hideLoaderOverlay());
//             done();
//         }
//     }
// });

export default [
  modelFetchLogic,
  openSingleViewLogic,
  // openTableViewLogic,
  // getUpdatedTableViewLogic
];
