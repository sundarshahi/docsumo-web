import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

import _ from 'lodash';
import * as uuid from 'uuid/v4';

export const KEY = 'APP';
export const KEY_CAMELIZED = _.camelCase(KEY);

const SET_AUTH_TOKEN = `${KEY}_SET_AUTH_TOKEN`;
const SET_AUTH_TOKEN_EXPIRED_FLAG = `${KEY}_SET_AUTH_TOKEN_EXPIRED_FLAG`;
const SET_AUTH_TOKEN_EXPIRED_FLAG_FROM_API_CLIENT = `${KEY}_SET_AUTH_TOKEN_EXPIRED_FLAG_FROM_API_CLIENT`;
const SET_INITIALIZED_FLAG = `${KEY}_SET_INITIALIZED_FLAG`;
const SET_USER = `${KEY}_SET_USER`;
const UPDATE_USER = `${KEY}_UPDATE_USER`;
const SET_CONFIG = `${KEY}_SET_CONFIG`;
const UPDATE_CONFIG = `${KEY}_UPDATE_CONFIG`;
const UPDATE_PERMISSION_CONFIG = `${KEY}_UPDATE_PERMISSION_CONFIG`;
const UPDATE_PERMISSION_CONFIG_FULFILLED = `${KEY}_UPDATE_PERMISSION_CONFIG_FULFILLED`;
const UPDATE_PERMISSION_CONFIG_REJECTED = `${KEY}_UPDATE_PERMISSION_CONFIG_REJECTED`;
const SET_LOCAL_CONFIG_FLAGS = `${KEY}_SET_LOCAL_CONFIG_FLAGS`;
const SET_TOOLTIP_FLOW_DATAS = `${KEY}_SET_TOOLTIP_FLOW_DATAS`;
const SET_TOOLTIP_FLOW_DATAS_FULFILLED = `${KEY}_SET_TOOLTIP_FLOW_DATAS_FULFILLED`;
const SET_APP_TOOLTIP_FLOW_START = `${KEY}_SET_APP_TOOLTIP_FLOW_START`;

const SET_CONFIG_FLAGS = `${KEY}_SET_CONFIG_FLAGS`;
const SET_CONFIG_FLAGS_FULFILLED = `${KEY}_SET_CONFIG_FLAGS_FULFILLED`;
const SET_CONFIG_FLAGS_REJECTED = `${KEY}_SET_CONFIG_FLAGS_REJECTED`;

const USER_AND_CONFIG_FETCH = `${KEY}_USER_AND_CONFIG_FETCH`;
const USER_AND_CONFIG_FETCH_FULFILLED = `${KEY}_USER_AND_CONFIG_FETCH_FULFILLED`;
const USER_AND_CONFIG_FETCH_REJECTED = `${KEY}_USER_AND_CONFIG_FETCH_REJECTED`;

const SET_TOAST = `${KEY}_SET_TOAST`;
const REMOVE_TOAST = `${KEY}_REMOVE_TOAST`;
const REMOVE_ALL_TOAST = `${KEY}_REMOVE_ALL_TOAST`;
const SHOW_LOADER_OVERLAY = `${KEY}_SHOW_LOADER_OVERLAY`;
const HIDE_LOADER_OVERLAY = `${KEY}_HIDE_LOADER_OVERLAY`;
const SHOW_DARK_OVERLAY = `${KEY}_SHOW_DARK_OVERLAY`;
const HIDE_DARK_OVERLAY = `${KEY}_HIDE_DARK_OVERLAY`;
const SHOW_INTRO_MODAL = `${KEY}_SHOW_INTRO_MODAL`;
const SHOW_EDIT_SCREEN_PLAY_MODAL = `${KEY}_SHOW_EDIT_SCREEN_PLAY_MODAL`;
const HIDE_INTRO_MODAL = `${KEY}_HIDE_INTRO_MODAL`;
const SHOW_CREDITUTILIZATION_MODAL = `${KEY}_SHOW_CREDITUTILIZATION_MODAL`;
const HIDE_CREDITUTILIZATION_MODAL = `${KEY}_HIDE_CREDITUTILIZATION_MODAL`;

const HIDE_EDIT_SCREEN_PLAY_MODAL = `${KEY}_HIDE_EDIT_SCREEN_PLAY_MODAL`;
const SHOW_FEEDBACK = `${KEY}_SHOW_FEEDBACK`;
const FOLDER_OPTION = `${KEY}_FOLDER_OPTION`;

const SET_HELP_TOOLTIP_SEQUENCE = `${KEY}_SET_HELP_TOOLTIP_SEQUENCE`;
const SET_FREETOOL_TOOLTIP = `${KEY}_SET_FREETOOL_TOOLTIP`;
const SET_TOOLTIP_ORIGIN = `${KEY}_SET_TOOLTIP_ORIGIN`;

const SET_SOCIAL_SIGNON_TOKEN = `${KEY}_SET_SOCIAL_SIGNON_TOKEN`;
const SET_SSO_TOKEN = `${KEY}_SET_SSO_TOKEN`;
const SET_CHATAI_POPUP = `${KEY}_SET_CHATAI_POPUP`;
const SET_CHATAI_ENABLED = `${KEY}_SET_CHATAI_ENABLED`;

const UPDATE_DOC_TYPE_NAME = `${KEY}_UPDATE_DOC_TYPE_NAME`;

const UPDATE_USER_CREDIT = `${KEY}_UPDATE_USER_CREDIT`;

export const actionTypes = {
  SET_AUTH_TOKEN,
  SET_AUTH_TOKEN_EXPIRED_FLAG,
  SET_AUTH_TOKEN_EXPIRED_FLAG_FROM_API_CLIENT,
  SET_INITIALIZED_FLAG,
  USER_AND_CONFIG_FETCH,
  USER_AND_CONFIG_FETCH_FULFILLED,
  USER_AND_CONFIG_FETCH_REJECTED,
  SET_USER,
  UPDATE_USER,
  SET_CONFIG,
  UPDATE_CONFIG,
  UPDATE_PERMISSION_CONFIG,
  UPDATE_PERMISSION_CONFIG_FULFILLED,
  UPDATE_PERMISSION_CONFIG_REJECTED,
  SET_LOCAL_CONFIG_FLAGS,
  SET_TOOLTIP_FLOW_DATAS,
  SET_TOOLTIP_FLOW_DATAS_FULFILLED,
  SET_CONFIG_FLAGS,
  SET_CONFIG_FLAGS_FULFILLED,
  SET_CONFIG_FLAGS_REJECTED,
  SET_TOAST,
  SET_HELP_TOOLTIP_SEQUENCE,
  SET_FREETOOL_TOOLTIP,
  REMOVE_TOAST,
  SHOW_LOADER_OVERLAY,
  HIDE_LOADER_OVERLAY,
  SHOW_DARK_OVERLAY,
  HIDE_DARK_OVERLAY,
  SHOW_INTRO_MODAL,
  HIDE_INTRO_MODAL,
  SHOW_CREDITUTILIZATION_MODAL,
  HIDE_CREDITUTILIZATION_MODAL,
  SHOW_EDIT_SCREEN_PLAY_MODAL,
  HIDE_EDIT_SCREEN_PLAY_MODAL,
  SET_APP_TOOLTIP_FLOW_START,
  SHOW_FEEDBACK,
  FOLDER_OPTION,
  SET_TOOLTIP_ORIGIN,
  SET_SOCIAL_SIGNON_TOKEN,
  SET_SSO_TOKEN,
  SET_CHATAI_POPUP,
  SET_CHATAI_ENABLED,
  UPDATE_DOC_TYPE_NAME,
  UPDATE_USER_CREDIT,
};

export const actions = {
  setAuthToken: createAction(SET_AUTH_TOKEN, payloadPassthrough),

  setAuthTokenExpiredFlag: createAction(
    SET_AUTH_TOKEN_EXPIRED_FLAG,
    payloadPassthrough
  ),

  setInitializedFlag: createAction(SET_INITIALIZED_FLAG, payloadPassthrough),

  setUser: createAction(SET_USER, payloadPassthrough),

  updateUser: createAction(UPDATE_USER, payloadPassthrough),

  setConfig: createAction(SET_CONFIG, payloadPassthrough),

  updateConfig: createAction(UPDATE_CONFIG, payloadPassthrough),
  updatePermissionConfig: createAction(
    UPDATE_PERMISSION_CONFIG,
    payloadPassthrough
  ),

  setLocalConfigFlags: createAction(SET_LOCAL_CONFIG_FLAGS, payloadPassthrough),

  setTooltipData: createAction(SET_TOOLTIP_FLOW_DATAS, payloadPassthrough),

  setConfigFlags: createAction(SET_CONFIG_FLAGS, payloadPassthrough),

  setHelpTTSequence: createAction(
    SET_HELP_TOOLTIP_SEQUENCE,
    payloadPassthrough
  ),

  setFreetoolTooltipData: createAction(
    SET_FREETOOL_TOOLTIP,
    payloadPassthrough
  ),

  fetchUserAndConfig: createAction(USER_AND_CONFIG_FETCH),

  setToast: createAction(SET_TOAST, (payload) => {
    if (!_.has(payload, 'id')) {
      payload.id = uuid();
    }
    return new Promise((resolve) => resolve(payload));
  }),

  removeToast: createAction(REMOVE_TOAST, payloadPassthrough),
  removeAllToast: createAction(REMOVE_ALL_TOAST, payloadPassthrough),

  showLoaderOverlay: createAction(SHOW_LOADER_OVERLAY, payloadPassthrough),

  hideLoaderOverlay: createAction(HIDE_LOADER_OVERLAY, payloadPassthrough),

  showDarkOverlay: createAction(SHOW_DARK_OVERLAY, payloadPassthrough),

  hideDarkOverlay: createAction(HIDE_DARK_OVERLAY, payloadPassthrough),

  showIntroModal: createAction(SHOW_INTRO_MODAL, payloadPassthrough),
  showEditScreenPlay: createAction(
    SHOW_EDIT_SCREEN_PLAY_MODAL,
    payloadPassthrough
  ),
  hideEditScreenPlay: createAction(
    HIDE_EDIT_SCREEN_PLAY_MODAL,
    payloadPassthrough
  ),
  hideIntroModal: createAction(HIDE_INTRO_MODAL, payloadPassthrough),

  showCreditUtilizationModal: createAction(
    SHOW_CREDITUTILIZATION_MODAL,
    payloadPassthrough
  ),

  hideCreditUtilizationModal: createAction(
    HIDE_CREDITUTILIZATION_MODAL,
    payloadPassthrough
  ),

  showFeedback: createAction(SHOW_FEEDBACK, payloadPassthrough),

  setTooltipFlowModal: createAction(
    SET_APP_TOOLTIP_FLOW_START,
    payloadPassthrough
  ),

  setFolderOption: createAction(FOLDER_OPTION, payloadPassthrough),

  setTooltipOrigin: createAction(SET_TOOLTIP_ORIGIN, payloadPassthrough),

  setSocialSignonToken: createAction(
    SET_SOCIAL_SIGNON_TOKEN,
    payloadPassthrough
  ),
  setSSOToken: createAction(SET_SSO_TOKEN, payloadPassthrough),
  setChatAIPopup: createAction(SET_CHATAI_POPUP, payloadPassthrough),
  setChatAIEnabled: createAction(SET_CHATAI_ENABLED, payloadPassthrough),

  updateDocTypeName: createAction(UPDATE_DOC_TYPE_NAME, payloadPassthrough),

  updateUserCredit: createAction(UPDATE_USER_CREDIT, payloadPassthrough),
};
