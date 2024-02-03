import { actions as appActions } from 'new/redux/app/actions';
import { createLogic } from 'redux-logic';

import _ from 'lodash';
import * as api from 'new/api';
import routes from 'new/constants/routes';
import history from 'new/history';

import { actionTypes } from './actions';

const rtStartClassifyLogic = createLogic({
  type: actionTypes.START_CLASSIFY,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action.payload, 'queryParams');
      queryParams = {
        ...queryParams,
      };
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
      await dispatch({
        type: actionTypes.START_CLASSIFY_FULFILLED,
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
      const docType = _.get(action.payload, 'doc_type');
      const origin = _.get(action.payload, 'origin');
      await history.push(`${routes.MANUAL_CLASSIFICATION}/${startDocId}`, {
        startDocId,
        docType,
        origin,
      });
      dispatch(appActions.hideLoaderOverlay());
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.START_CLASSIFY_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      const { statusCode, responsePayload: { message, error } = {} } = e || {};
      dispatch(
        appActions.setToast({
          title:
            statusCode === 403
              ? 'Access Denied. Please contact admin to provide access.'
              : message || error,
          error: true,
        })
      );
      history.push(routes.ALL);
      dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});

const rtStartSingleClassifyLogic = createLogic({
  type: actionTypes.START_SINGLE_CLASSIFY,
  process: async function ({ action }, dispatch, done) {
    try {
      const docId = _.get(action, 'payload.docId');
      await dispatch(appActions.showLoaderOverlay());
      let response = await api.startReview({
        queryParams: {
          doc_id: docId,
          doc_type: 'auto_classify',
        },
      });
      const documents = _.get(response, 'responsePayload.data.documents');
      if (_.isEmpty(documents)) {
        dispatch(appActions.hideLoaderOverlay());
        done();
        return;
      }
      await dispatch({
        type: actionTypes.START_CLASSIFY_FULFILLED,
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
      dispatch(appActions.hideLoaderOverlay());
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.START_CLASSIFY_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      const { responsePayload: { message, error } = {} } = e || {};
      dispatch(
        appActions.setToast({
          title:
            e.statusCode === 403
              ? 'Access Denied. Please contact admin to provide access.'
              : message || error,
          error: true,
        })
      );
      history.push(routes.ALL);
      dispatch(appActions.hideLoaderOverlay());
      done();
    }
  },
});

export default [rtStartClassifyLogic, rtStartSingleClassifyLogic];
