import { handleActions } from 'redux-actions';

import * as fileConstants from 'new/constants/file';

import { actionTypes } from './actions';

function getDefaultState() {
  return {
    fileIds: [],
    filesById: {},
    counts: {
      uploadable: 0, // Supported format and within size limit
      unsupported: 0,
      exceedsSize: 0,
      zeroSize: 0,
    },
    isOverlayCollpased: false,
    isCancelConfirmationModalVisible: false,
    showFileUploadModal: false,
    fileUploadOrigin: '',
  };
}

export default handleActions(
  {
    [actionTypes.TOGGLE_OVERLAY_COLLAPSE](state) {
      return {
        ...state,
        isOverlayCollpased: !state.isOverlayCollpased,
      };
    },
    [actionTypes.ADD_NEW_FILE](state, { payload }) {
      const counts = {
        ...state.counts,
      };

      if (!payload.error) {
        counts.uploadable = state.counts.uploadable + 1;
      } else {
        if (payload.error === fileConstants.ERRORS.UNSUPPORTED) {
          counts.unsupported = state.counts.unsupported + 1;
        } else if (payload.error === fileConstants.ERRORS.EXCEEDS_SIZE) {
          counts.exceedsSize = state.counts.exceedsSize + 1;
        } else if (payload.error === fileConstants.ERRORS.ZERO_SIZE) {
          counts.zeroSize = state.counts.zeroSize + 1;
        }
      }

      return {
        ...state,
        counts,
        fileIds: [...state.fileIds, payload.id],
        showFileUploadModal: true,
        filesById: {
          ...state.filesById,
          [payload.id]: payload,
        },
      };
    },

    [actionTypes.UPDATE_FILE_DATA](state, { payload }) {
      const { id, updates } = payload;

      return {
        ...state,
        filesById: {
          ...state.filesById,
          [id]: {
            ...state.filesById[id],
            ...updates,
          },
        },
      };
    },

    [actionTypes.CANCEL_FILE_UPLOAD](state, { payload }) {
      const { id } = payload;
      let fileObj = state.filesById[id];

      if (!fileObj) {
        return state;
      }

      return {
        ...state,
        filesById: {
          ...state.filesById,
          [id]: {
            ...fileObj,
            state: fileConstants.STATES.UPLOAD_CANCELLED,
            error: null,
            uploadProgress: 0,
          },
        },
      };
    },

    [actionTypes.CANCEL_ALL_UPLOADS](state) {
      const { fileIds, filesById } = state;
      if (!fileIds.length) {
        return state;
      }

      let newFilesById = {};
      fileIds.forEach((id) => {
        const fileObj = filesById[id];
        if (
          [fileConstants.STATES.NEW, fileConstants.STATES.UPLOADING].includes(
            fileObj.state
          )
        ) {
          newFilesById[id] = {
            ...fileObj,
            state: fileConstants.STATES.UPLOAD_CANCELLED,
          };
        } else {
          newFilesById[id] = fileObj;
        }
      });

      return {
        ...state,
        filesById: newFilesById,
      };
    },

    [actionTypes.RETRY_FILE_UPLOAD](state, { payload }) {
      const { id } = payload;
      let fileObj = state.filesById[id];

      if (!fileObj) {
        return state;
      }

      return {
        ...state,
        filesById: {
          ...state.filesById,
          [id]: {
            ...fileObj,
            state: fileConstants.STATES.NEW,
            error: null,
            uploadProgress: 0,
          },
        },
      };
    },

    [actionTypes.CLEAR_UPLOADS]() {
      return getDefaultState();
    },

    [actionTypes.SHOW_CANCEL_CONFIRMATION_MODAL](state) {
      return {
        ...state,
        isCancelConfirmationModalVisible: true,
      };
    },

    [actionTypes.HIDE_CANCEL_CONFIRMATION_MODAL](state) {
      return {
        ...state,
        isCancelConfirmationModalVisible: false,
      };
    },

    [actionTypes.UPDATE_FILE_DATA_WITH_DOC_ID](state, { payload }) {
      const { docId = '', updates } = payload;
      const fileByDocId = Object.values(state.filesById)?.find(
        (file) => file.docId === docId
      );

      return {
        ...state,
        showFileUploadModal: true,
        filesById: {
          ...state.filesById,
          [fileByDocId?.id]: {
            ...state.filesById[fileByDocId?.id],
            ...updates,
          },
        },
      };
    },

    [actionTypes.UPDATE_FILE_DATA_WITH_SAMPLE_FILE](state, { payload }) {
      const { title, type } = payload;
      const counts = {
        ...state.counts,
      };

      if (!payload.error) {
        counts.uploadable = state.counts.uploadable + 1;
      }
      let sampleDocId = crypto.randomUUID();
      const filePayload = {
        ...payload,
        id: sampleDocId,
        name: title,
        state: 'upload_finished',
        error: null,
        uploadProgress: 100,
        documentType: type,
      };
      return {
        ...state,
        counts,
        fileIds: [...state.fileIds, sampleDocId],
        showFileUploadModal: true,
        filesById: {
          ...state.filesById,
          [sampleDocId]: filePayload,
        },
      };
    },

    [actionTypes.TOGGLE_FILE_UPLOAD_MODAL](state, { payload }) {
      const { showFileUploadModal } = payload;
      return {
        ...state,
        showFileUploadModal,
      };
    },
    [actionTypes.UPDATE_FILE_UPLOAD_ORIGIN](state, { payload }) {
      const { origin = '' } = payload;
      return {
        ...state,
        fileUploadOrigin: origin,
      };
    },
  },
  getDefaultState()
);
