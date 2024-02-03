import { actions as documentActions } from 'new/redux/documents/actions';
import { storeFolderId } from 'new/redux/helpers';
import * as reduxHelpers from 'new/redux/helpers';
import { actions as uploadActions } from 'new/redux/upload/actions';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { getCancelTokenSource } from 'new/api/apiClient';
import * as fileConstants from 'new/constants/file';
import routes from 'new/constants/routes';
import history from 'new/history';
import FileTypeWorker from 'new/workers/filetype.worker.js';
import PromiseWorker from 'promise-worker';
import * as uuid from 'uuid/v4';

const FILES_BY_ID = {};
let STORE_STATE_UPLOAD_FILES_BY_ID;
let unsubscribeStoreChangeListener;
let ACTIVE_UPLOAD;

const fileTypePromiseWorker = new PromiseWorker(new FileTypeWorker());

async function handleFileDrop({ files, dropAccepted, documentType }) {
  let validatedFiles = [];
  for (const file of files) {
    const id = uuid();
    const { name, type, size } = file;
    let fileObj = {
      id,
      name,
      type,
      size,
      documentType,
    };

    if (!dropAccepted) {
      fileObj = {
        ...fileObj,
        error: fileConstants.ERRORS.UNSUPPORTED,
      };
    } else if (
      (size > fileConstants.MAXIMUM_FILE_SIZE &&
        !documentType.includes('us_bank_statement')) ||
      (size > fileConstants.MAXIMUM_FILE_SIZE_USBS &&
        documentType.includes('us_bank_statement'))
    ) {
      fileObj = {
        ...fileObj,
        error: fileConstants.ERRORS.EXCEEDS_SIZE,
      };
    } else if (size === fileConstants.MINIMUM_FILE_SIZE) {
      fileObj = {
        ...fileObj,
        error: fileConstants.ERRORS.ZERO_SIZE,
      };
    } else {
      try {
        const { ext, mime } = await readNewFile(id, file);
        fileObj = {
          ...fileObj,
          ext,
          mime,
        };
      } catch (errorCode) {
        fileObj = {
          ...fileObj,
          error: errorCode,
        };
      }
    }
    const store = reduxHelpers.getStore();
    const {
      documents: { selectedFolderId, newFolderId },
    } = store.getState();
    if (selectedFolderId || newFolderId) {
      fileObj['folder_id'] = newFolderId || selectedFolderId;
    }
    validatedFiles = [...validatedFiles, fileObj];
  }

  // upload each file at a time
  for (const fileObj of validatedFiles) {
    dispatchNewFileUpload(fileObj);
  }
}

function readNewFile(id, file) {
  return new Promise(function (resolve, reject) {
    try {
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        const fileArrayBuffer = fileReader.result;
        let { ext, mime } = await fileTypePromiseWorker.postMessage(
          fileArrayBuffer
        );

        if (ext === undefined && mime === undefined) {
          ext = 'pdf';
          mime = 'application/pdf';
        }

        if (!fileConstants.SUPPORTED_MIME_TYPES.includes(mime)) {
          return reject(fileConstants.ERRORS.UNSUPPORTED);
        }

        setFile(id, file);

        resolve({
          id,
          ext,
          mime,
        });
      };
      fileReader.onabort = () => reject(fileConstants.ERRORS.READ_ABORTED);
      fileReader.onerror = () => reject(fileConstants.ERRORS.READ_ERRORED);
      fileReader.readAsArrayBuffer(file);
    } catch (e) {
      reject(fileConstants.ERRORS.READ_ERRORED);
    }
  });
}

function getFile(id) {
  return FILES_BY_ID[id];
}

function setFile(id, file) {
  FILES_BY_ID[id] = file;
}

function removeFile(id) {
  delete FILES_BY_ID[id];
}

function dispatchNewFileUpload(fileData) {
  reduxHelpers.dispatchAction(
    uploadActions.addNewFile({
      ...fileData,
      state: fileData.error
        ? fileConstants.STATES.ERROR
        : fileConstants.STATES.NEW,
    })
  );
}

function dispatchFileUploading(fileData) {
  reduxHelpers.dispatchAction(
    uploadActions.updateFileData({
      id: fileData.id,
      updates: {
        state: fileConstants.STATES.UPLOADING,
        error: null,
      },
    })
  );
}

function dispatchFileUploadProgress(fileData, percentCompleted) {
  reduxHelpers.dispatchAction(
    uploadActions.updateFileData({
      id: fileData.id,
      updates: {
        uploadProgress: percentCompleted,
      },
    })
  );
}

function dispatchFileUploadFinished(fileData) {
  reduxHelpers.dispatchAction(
    uploadActions.updateFileData({
      id: fileData.id,
      updates: {
        ...fileData,
        state: fileConstants.STATES.UPLOAD_FINISHED,
        error: null,
        uploadProgress: 100,
      },
    })
  );
}

function dispatchFileUploadError(fileData, error) {
  reduxHelpers.dispatchAction(
    uploadActions.updateFileData({
      id: fileData.id,
      updates: {
        state: fileConstants.STATES.ERROR,
        error: error,
      },
    })
  );
}

function dispatchDocumentCountsFetch({ folderId = '' }) {
  reduxHelpers.dispatchAction(
    documentActions.fetchDocumentCounts({
      queryParams: {
        folder_id: folderId,
      },
    })
  );
}

async function startFileUpload(fileData) {
  ACTIVE_UPLOAD = {
    fileData,
  };

  try {
    dispatchFileUploading(fileData);

    const cancelTokenSource = getCancelTokenSource();
    ACTIVE_UPLOAD.cancelTokenSource = cancelTokenSource;

    let payload = {
      file: getFile(fileData.id),
      type: fileData.documentType,
    };
    if (fileData.folder_id) {
      payload['folder_id'] = fileData.folder_id;
    }
    const { responsePayload: { data: { document = [] } = {} } = {} } =
      await api.uploadDocument({
        payload,
        cancelToken: cancelTokenSource.token,
        onUploadProgress: (progressEvent) => {
          if (fileData.id !== _.get(ACTIVE_UPLOAD, 'fileData.id')) {
            // This is no longer an active upload. Ignore.
            return;
          }

          const percentCompleted = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          if (!Number.isNaN(percentCompleted)) {
            dispatchFileUploadProgress(fileData, percentCompleted);
          }
        },
      });
    // Mixpanel Sucessful document track
    const {
      upload = {},
      app: { user = {}, config = {} },
    } = reduxHelpers.getStore()?.getState();
    mixpanelTrackUploadDoc(
      upload?.fileUploadOrigin,
      user,
      fileData?.documentType,
      config
    );
    const [doc] = document;
    removeFile(fileData.id);
    ACTIVE_UPLOAD = null;
    dispatchFileUploadFinished({
      ...fileData,
      ...doc,
    });
    dispatchDocumentCountsFetch({ folderId: fileData?.folder_id });

    if (_.get(global, 'window.location.pathname') === routes.ALL) {
      const parsedUrl = new URL(window.location.href);

      history.push(`${routes.ALL}${parsedUrl?.search}`, {
        forceReload: true,
      });
    }
  } catch (e) {
    if (e.isCancel) {
      return;
    }

    ACTIVE_UPLOAD = null;
    dispatchFileUploadError(fileData, fileConstants.ERRORS.UPLOAD_FAILED);
  }
}

function startNextFileUpload(uploadState) {
  const { fileIds, filesById } = uploadState;
  let fileToUpload;
  fileIds.forEach((fileId) => {
    if (fileToUpload) return;
    const fileObj = filesById[fileId];
    if (fileObj.state === fileConstants.STATES.NEW) {
      fileToUpload = { ...fileObj };
    }
  });

  if (fileToUpload) {
    startFileUpload(fileToUpload);
  } else {
    storeFolderId({
      folderId: '',
    });
    const FolderInput = document.getElementById('folder-upload-input');
    if (FolderInput) {
      FolderInput.value = '';
    }
  }
}

function handleStoreChange() {
  const store = reduxHelpers.getStore();
  const uploadState = store.getState().upload;
  const hasStateChanged =
    STORE_STATE_UPLOAD_FILES_BY_ID !== uploadState.filesById;
  STORE_STATE_UPLOAD_FILES_BY_ID = uploadState.filesById;

  if (hasStateChanged) {
    if (ACTIVE_UPLOAD) {
      const id = _.get(ACTIVE_UPLOAD, 'fileData.id');
      const fileState = _.get(STORE_STATE_UPLOAD_FILES_BY_ID[id], 'state');
      if (fileState !== fileConstants.STATES.UPLOADING) {
        // Upload has been cancelled
        ACTIVE_UPLOAD.cancelTokenSource &&
          ACTIVE_UPLOAD.cancelTokenSource.cancel();
        ACTIVE_UPLOAD = null;

        // Start next upload
        startNextFileUpload(uploadState);
      }
    } else {
      // Start upload if possible
      startNextFileUpload(uploadState);
    }
  }
}

function subscribeToStoreChanges() {
  const store = reduxHelpers.getStore();
  STORE_STATE_UPLOAD_FILES_BY_ID = store.getState().upload.filesById;
  unsubscribeStoreChangeListener = store.subscribe(handleStoreChange);
}

function unsubscribeFromStoreChanges() {
  unsubscribeStoreChangeListener && unsubscribeStoreChangeListener();
}

function mixpanelTrackUploadDoc(evt, user, type, config) {
  mixpanel.track(evt, {
    'work email': user?.email,
    docType: type,
    version: 'new',
    canSwitchUIVersion: config?.canSwitchToOldMode || true,
    mode: user?.mode,
    plan: config?.accountType,
  });
}

export {
  getFile,
  handleFileDrop,
  mixpanelTrackUploadDoc,
  readNewFile,
  removeFile,
  setFile,
  subscribeToStoreChanges,
  unsubscribeFromStoreChanges,
};
