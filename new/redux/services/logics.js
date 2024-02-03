import { showToast } from 'new/redux/helpers';
import { createLogic } from 'redux-logic';

import _ from 'lodash';
import * as api from 'new/api';

import {
  actions as appActions,
  actionTypes as configAction,
} from '../app/actions';

import { actions as serviceAction, actionTypes } from './actions';

const servicesFetchLogic = createLogic({
  type: actionTypes.SERVICE_FETCH,
  process: async function ({ action }, dispatch, done) {
    try {
      let queryParams = _.get(action, 'payload.queryParams');
      const response = await api.getServices(queryParams);

      await dispatch({
        type: actionTypes.SERVICE_FETCH_FULFILLED,
        payload: response,
      });
      done();
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.SERVICE_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      done();
    }
  },
});

const servicesUpdateStateLogic = createLogic({
  type: actionTypes.SERVICE_STATUS_UPDATE,
  process: async function ({ action }, dispatch, done) {
    try {
      let {
        serviceId,
        status,
        uploadSample,
        callback = null,
      } = _.get(action, 'payload');

      await dispatch(
        serviceAction.updateService({
          serviceId: serviceId,
          action: 'add',
        })
      );

      const response = await api.updateStatusServices({
        serviceId,
        status,
        uploadSample,
      });

      if (callback) {
        callback();
      }

      await dispatch(
        serviceAction.updateService({
          serviceId: serviceId,
          action: 'remove',
        })
      );

      await dispatch({
        type: actionTypes.SERVICE_FETCH_FULFILLED,
        payload: response,
      });

      const responseData = await api.getDocTypeConfig();
      const data = _.get(
        responseData.responsePayload,
        'data.documentTypes',
        {}
      );
      await dispatch({
        type: configAction.UPDATE_CONFIG,
        payload: {
          updates: {
            documentTypes: data,
          },
        },
      });
    } catch (e) {
      if (!e.isCancel) {
        dispatch({
          type: actionTypes.SERVICE_FETCH_REJECTED,
          error: true,
          payload: e,
          meta: action.payload,
        });
      }
      dispatch(
        serviceAction.updateService({
          isUpdating: false,
          serviceId: '',
        })
      );
      dispatch(
        appActions.setToast({
          title:
            'An error occurred while updating API. Please try again later.',
          error: true,
        })
      );
    } finally {
      done();
    }
  },
});

const servicesUploadDocLogic = createLogic({
  type: actionTypes.SERVICE_UPLOAD_DUMMY_DOC,
  process: async function ({ action }, _dispatch, done) {
    let { serviceId } = _.get(action, 'payload');
    await api.uploadDummyDocOfServices(serviceId);
    showToast({ title: 'Sample document uploaded successfully!!' });
    done();
  },
});

export default [
  servicesFetchLogic,
  servicesUpdateStateLogic,
  servicesUploadDocLogic,
];
