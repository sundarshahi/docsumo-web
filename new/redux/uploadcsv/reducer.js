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
  },
  getDefaultState()
);
