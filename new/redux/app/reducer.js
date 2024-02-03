import _ from 'lodash';

import { actionTypes } from './actions';

function getInitialState() {
  return {
    isInitialized: false,
    token: null,
    tokenExpired: false,
    user: undefined, // This changes to null during init if there is no user.
    config: undefined,
    toast: null,
    showLoaderOverlay: false,
    showDarkOverlay: false,
    showIntroModal: false,
    showEditScreenPlayModal: false,
    showFeedback: false,
    showTooltipIntroModal: false,
    showCreditUtilizationModal: false,
    renameFolderId: null,
    addNewFolder: false,
    helpChildTTSequence: 1, //set it as undefined to hide flow
    helpTTSequence: 1, //set it as undefined to hide flow
    tooltipFlow: [],
    onboardingTutorialOrigin: '',
    socialSignonToken: {},
    SSOToken: {},
  };
}

export default function reducer(
  state = getInitialState(),
  { type, payload, meta }
) {
  /* eslint-disable indent */
  switch (type) {
    case actionTypes.SET_AUTH_TOKEN: {
      const { token } = payload;

      return {
        ...state,
        token,
      };
    }

    case actionTypes.SET_AUTH_TOKEN_EXPIRED_FLAG: {
      return {
        ...state,
        tokenExpired: payload,
      };
    }

    case actionTypes.SET_AUTH_TOKEN_EXPIRED_FLAG_FROM_API_CLIENT: {
      if (!state.user) {
        return state;
      }

      return {
        ...state,
        tokenExpired: true,
      };
    }

    case actionTypes.SET_INITIALIZED_FLAG: {
      return {
        ...state,
        isInitialized: payload,
      };
    }

    case actionTypes.SET_USER: {
      const { user } = payload;

      return {
        ...state,
        user,
      };
    }

    case actionTypes.UPDATE_USER: {
      const { updates } = payload;

      return {
        ...state,
        user: {
          ...state.user,
          ...updates,
        },
      };
    }

    case actionTypes.SET_HELP_TOOLTIP_SEQUENCE: {
      const { sequence, childSequence } = payload;

      return {
        ...state,
        helpTTSequence: sequence,
        helpChildTTSequence: childSequence,
        showTooltipIntroModal: false,
      };
    }

    case actionTypes.SET_CONFIG: {
      const { config } = payload;

      return {
        ...state,
        config,
      };
    }

    case actionTypes.UPDATE_CONFIG: {
      const { updates } = payload;

      return {
        ...state,
        config: {
          ...state.config,
          ...updates,
        },
      };
    }

    case actionTypes.UPDATE_PERMISSION_CONFIG_FULFILLED: {
      const data = _.get(payload.responsePayload, 'data', {});

      return {
        ...state,
        config: {
          ...state.config,
          documentTypes: data,
        },
      };
    }

    case actionTypes.SET_LOCAL_CONFIG_FLAGS: {
      const flags = payload;

      if (!state.config) {
        return state;
      }

      return {
        ...state,
        config: {
          ...state.config,
          flags: {
            ...state.config.flags,
            ...flags,
          },
        },
      };
    }

    case actionTypes.SET_APP_TOOLTIP_FLOW_START: {
      const showTooltipIntroModal = payload;
      return {
        ...state,
        showTooltipIntroModal,
      };
    }

    case actionTypes.SET_CONFIG_FLAGS_FULFILLED: {
      const { flags } = meta;

      if (!state.config) {
        return state;
      }

      return {
        ...state,
        config: {
          ...state.config,
          flags: {
            ...state.config.flags,
            ...flags,
          },
        },
      };
    }

    case actionTypes.USER_AND_CONFIG_FETCH_FULFILLED: {
      const { user, config } = payload;

      return {
        ...state,
        user,
        config,
      };
    }

    case actionTypes.USER_AND_CONFIG_FETCH_REJECTED: {
      return {
        ...state,
        user: null,
        config: null,
      };
    }

    case actionTypes.SET_TOAST: {
      let status = 'info';
      if (payload?.error) {
        status = 'error';
      } else if (payload?.success) {
        status = 'success';
      }

      return {
        ...state,
        toast: { ...payload, status },
      };
    }

    case actionTypes.REMOVE_TOAST: {
      const toastId = _.get(payload, 'id');

      if (toastId === _.get(state.toast, 'id')) {
        return {
          ...state,
          toast: null,
        };
      } else {
        return state;
      }
    }

    case actionTypes.REMOVE_ALL_TOAST: {
      return {
        ...state,
        toast: null,
      };
    }

    case actionTypes.SET_TOOLTIP_FLOW_DATAS_FULFILLED: {
      let tooltipFlow = _.get(payload, 'data.tooltipFlow');
      /* if(tooltipFlow){
                tooltipFlow = tooltipFlow.map(t => ({
                    ...t,
                    childrens : t.childrens.map(e => ({
                    ...e,
                    id: ttConstants[e.id]
                    }))
                    }
                ));
            } */
      return {
        ...state,
        tooltipFlow,
      };
    }

    case actionTypes.SET_FREETOOL_TOOLTIP: {
      let tooltipFlow = _.get(payload, 'data');
      return {
        ...state,
        tooltipFlow,
      };
    }

    case actionTypes.SHOW_LOADER_OVERLAY: {
      return {
        ...state,
        showLoaderOverlay: true,
      };
    }

    case actionTypes.HIDE_LOADER_OVERLAY: {
      return {
        ...state,
        showLoaderOverlay: false,
      };
    }

    case actionTypes.SHOW_DARK_OVERLAY: {
      return {
        ...state,
        showDarkOverlay: true,
      };
    }

    case actionTypes.HIDE_DARK_OVERLAY: {
      return {
        ...state,
        showDarkOverlay: false,
      };
    }

    case actionTypes.SHOW_INTRO_MODAL: {
      return {
        ...state,
        showIntroModal: true,
      };
    }

    case actionTypes.HIDE_INTRO_MODAL: {
      return {
        ...state,
        showIntroModal: false,
      };
    }

    case actionTypes.SHOW_CREDITUTILIZATION_MODAL: {
      return {
        ...state,
        showCreditUtilizationModal: true,
      };
    }

    case actionTypes.HIDE_CREDITUTILIZATION_MODAL: {
      return {
        ...state,
        showCreditUtilizationModal: false,
      };
    }

    case actionTypes.SHOW_EDIT_SCREEN_PLAY_MODAL: {
      return {
        ...state,
        showEditScreenPlayModal: true,
      };
    }

    case actionTypes.HIDE_EDIT_SCREEN_PLAY_MODAL: {
      return {
        ...state,
        showEditScreenPlayModal: false,
      };
    }

    case actionTypes.SHOW_FEEDBACK: {
      const showFeedback = _.get(payload, 'showFeedback', {});
      return {
        ...state,
        showFeedback: showFeedback,
      };
    }

    case actionTypes.FOLDER_OPTION: {
      const renameFolderId = _.get(payload, 'renameFolderId', {});
      const addNewFolder = _.get(payload, 'addNewFolder', {});
      return {
        ...state,
        renameFolderId: renameFolderId,
        addNewFolder: addNewFolder,
      };
    }

    case actionTypes.SET_TOOLTIP_ORIGIN: {
      const onboardingTutorialOrigin = payload;
      return {
        ...state,
        onboardingTutorialOrigin,
      };
    }

    case actionTypes.SET_SSO_TOKEN: {
      const { tokenResponse } = payload;
      return {
        ...state,
        SSOToken: {
          providerId: tokenResponse.providerId.split('.')[0],
          email: tokenResponse.email,
          fullName: tokenResponse.fullName,
          idToken: tokenResponse.idToken,
        },
      };
    }

    case actionTypes.UPDATE_DOC_TYPE_NAME: {
      const { documentName, docId } = payload;
      const { documentTypes = [] } = state.config;
      const docTypeIndex = documentTypes.findIndex(
        (doc) => doc !== null && doc.id === docId
      );
      documentTypes[docTypeIndex].title = documentName;
      return {
        ...state,
        config: {
          ...state.config,
          documentTypes,
        },
      };
    }

    case actionTypes.SET_CHATAI_POPUP: {
      const flags = payload;
      return {
        ...state,
        config: {
          ...state.config,
          flags: {
            ...state.config.flags,
            ...flags,
          },
        },
      };
    }

    case actionTypes.SET_CHATAI_ENABLED: {
      const flags = payload;
      return {
        ...state,
        config: {
          ...state.config,
          ...flags,
        },
      };
    }

    case actionTypes.UPDATE_USER_CREDIT: {
      const { credits } = payload;
      return {
        ...state,
        config: {
          ...state.config,
          credits,
        },
      };
    }

    default: {
      return state;
    }
  }
  /* eslint-enable indent */
}
