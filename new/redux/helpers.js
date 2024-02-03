import _ from 'lodash';
import * as uuid from 'uuid/v4';

import { actions as appActions } from './app/actions';
import { actions as documentActions } from './documents/actions';
import { KEY_CAMELIZED as requestsStateCamelizedKey } from './requests/actions';
import { actions as uploadActions } from './upload/actions';
import { actions as csvUploadActions } from './uploadcsv/actions';
import getStore from './store';

/*
 * Example
 * dispatchAction({ type: 'Key', payload: 'value' });
 */
const dispatchAction = (params) => {
  getStore().dispatch(params);
};

const getState = () => {
  return getStore().getState();
};

const getValueFromPath = (path) => {
  return _.get(getState(), path);
};

const isRequestActive = (state, key) => {
  if (key.endsWith('_FETCH')) {
    key = key.replace('_FETCH', '');
  }
  const requests = state[requestsStateCamelizedKey];
  if (_.get(requests, `${key}.isFetching`) || false) {
    return true;
  }
  return false;
};

const showToast = ({ id = uuid(), title = '', ...props }) => {
  dispatchAction(
    appActions.setToast({
      id,
      title,
      ...props,
    })
  );
};

const showIntroModal = () => {
  dispatchAction(appActions.showIntroModal());
};
const showFeedbackForm = () => {
  dispatchAction(
    appActions.showFeedback({
      showFeedback: true,
    })
  );
};
const changeFolderOption = () => {
  dispatchAction(
    appActions.setFolderOption({
      renameFolderId: null,
      addNewFolder: true,
    })
  );
};

const storeFolderId = ({ folderId }) => {
  dispatchAction(
    documentActions.createNewFolderId({
      newFolderId: folderId,
    })
  );
};

const closeAnalytics = (analyticsDocument) => {
  dispatchAction(
    documentActions.hideAnalytics({
      docType: analyticsDocument,
    })
  );
};

const closeCSVUploadOverlay = () => {
  dispatchAction(csvUploadActions.clearUploads());
};
const closeUploadOverlay = () => {
  dispatchAction(uploadActions.clearUploads());
};

export {
  changeFolderOption,
  closeAnalytics,
  closeCSVUploadOverlay,
  closeUploadOverlay,
  dispatchAction,
  getState,
  getStore,
  getValueFromPath,
  isRequestActive,
  showFeedbackForm,
  showIntroModal,
  showToast,
  storeFolderId,
};
