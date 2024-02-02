import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as requestActions } from 'new/redux/requests/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  Check,
  Edit,
  Group,
  HistoricShieldAlt,
  OpenNewWindow,
  Refresh,
  TableRows,
  Tools,
  UserCircle,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as GoogleSignonIcon } from 'new/assets/images/icons/signon_google.svg';
import { ReactComponent as MicrosoftSignonIcon } from 'new/assets/images/icons/signon_microsoft.svg';
import { SALES_ORIGIN_KEYS } from 'new/components/contexts/trackingConstants';
import { PageMetadata } from 'new/components/layout/page';
import HubspotMeetingPopup from 'new/components/modals/hubspot';
import { ACCOUNT_TYPES } from 'new/constants';
import passwordRegex from 'new/constants/passwordRegex';
import ROUTES from 'new/constants/routes';
import { getMemberPermissions } from 'new/helpers/permissions';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import { signInAuthProvider } from 'new/thirdParty/firebase';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button, { SIZE, VARIANT } from 'new/ui-elements/Button/Button';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import ErrorText from 'new/ui-elements/Input/components/ErrorText/ErrorText';
import Input from 'new/ui-elements/Input/Input';
import ToggleControl from 'new/ui-elements/ToggleControl/ToggleControl';
import addToHSQ from 'new/utils/addToHSQ';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';

import Database from '../Database/index';
import Integration from '../Integration/index';
import SecuritySettings from '../SecuritySettings/SecuritySettings';
import UserManagement from '../UserManagement/index';

import SkeletonLoader from './components/AccountSettingsSkeleton/SkeletonLoader';
import RedirectLoginModal from './components/RedirectLoginModal/RedirectLoginModal';
import ResetMFAFlow from './components/ResetMFAFlow/ResetMFAFlow';
import SetupMFAFlow from './components/SetupMFAFlow/SetupMFAFlow';
import ToggleMFAFlow from './components/ToggleMFAFlow/ToggleMFAFlow';
import SettingRoutes from './settingRoutes';

import styles from './index.scss';

let DATAS = [
  {
    name: '1 Day ',
    value: '1days',
  },
  {
    name: '7 Days',
    value: '7days',
  },
  {
    name: '30 Days',
    value: '30days',
  },
  {
    name: '60 Days',
    value: '60days',
  },
  {
    name: '90 Days',
    value: '90days',
  },
  {
    name: '120 Days',
    value: '120days',
  },
  {
    name: '180 Days',
    value: '180days',
  },
  {
    name: '1 Year',
    value: '365days',
  },
  {
    name: 'Never',
    value: 'never',
  },
];
let EXPIRY_DATA = [
  {
    name: '30 Mins',
    value: 0.02,
  },
  {
    name: '3 Hrs',
    value: 0.125,
  },
  {
    name: '12 Hrs',
    value: 0.5,
  },
  {
    name: '1 Day',
    value: 1,
  },
  {
    name: '3 Days',
    value: 3,
  },
  {
    name: '7 Days',
    value: 7,
  },
];

const MFA_FLOW_TYPES = {
  toggle: 'TOGGLE',
  reset: 'RESET',
  setup: 'SETUP',
};

class SettingsPage extends Component {
  state = {
    isFetchingData: false,
    user: null,
    config: {},

    isEditingName: false,
    isUpdatingName: false,
    uiNameValue: '',
    uiNameError: '',

    isEditingPassword: false,
    isUpdatingPassword: false,

    uiOldPasswordValue: '',
    uiNewPasswordValue: '',
    uiRepeatNewPasswordValue: '',

    uiOldPasswordError: '',
    uiNewPasswordError: '',
    uiRepeatNewPasswordError: '',
    uiPasswordError: '',

    uiDataValue: DATAS[0],
    uiDataError: '',
    valueData: { name: 'Never', value: 'never' },

    uiStageValue: false,
    uiStageError: '',

    uiExpireValue: EXPIRY_DATA[0],
    uiExpireError: '',
    valueExpire: { name: '1 Day', value: 1 },

    isUpdatingApiKey: false,

    showUser: true,
    allowEditFields: true,
    redirectToLogin: false,

    socialSigninError: '',

    resetMFAFlowStep: 1,

    mfaFlowType: '',

    isHupspotMeetingPopupOpen: false,
  };
  isMounted = false;
  nameInputRef = React.createRef();
  oldPasswordInputRef = React.createRef();
  newPasswordInputRef = React.createRef();
  repeatNewPasswordInputRef = React.createRef();
  webhookUrlInputRef = React.createRef();

  componentDidMount() {
    this.isMounted = true;
    this.fetchData();
    const { user, location, config } = this.props;
    const permissions = getMemberPermissions() || {};
    this.setState({
      ...permissions,
    });

    chameleonIdentifyUser(user, config);
    // Sending to hubspot
    addToHSQ(user, location);
  }

  updateCreditsNav(user) {
    this.props.appActions.updateUserCredit({
      credits: {
        monthly_doc_current: user?.monthlyDocCurrent,
        monthly_doc_limit: user?.monthlyDocLimit,
      },
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { isEditingName, isEditingPassword, isEditingWebhookUrl } =
      this.state;

    const {
      isEditingName: prevIsEditingName,
      isEditingPassword: prevIsEditingPassword,
      isEditingWebhookUrl: prevIsEditingWebhookUrl,
    } = prevState;

    if (isEditingName && isEditingName !== prevIsEditingName) {
      // Focus name input
      if (this.nameInputRef && this.nameInputRef.current) {
        this.nameInputRef.current.focus();
      }
    }

    if (isEditingPassword && isEditingPassword !== prevIsEditingPassword) {
      // Focus old password input
      if (this.oldPasswordInputRef && this.oldPasswordInputRef.current) {
        this.oldPasswordInputRef.current.focus();
      } else if (this.newPasswordInputRef && this.newPasswordInputRef.current) {
        this.newPasswordInputRef.current.focus();
      }
    }

    if (
      isEditingWebhookUrl &&
      isEditingWebhookUrl !== prevIsEditingWebhookUrl
    ) {
      // Focus webhook url input
      if (this.webhookUrlInputRef && this.webhookUrlInputRef.current) {
        this.webhookUrlInputRef.current.focus();
      }
    }

    if (prevProps.user !== this.props.user) {
      this.setState({ user: this.props.user });
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  fetchData = async () => {
    this.setState({
      isFetchingData: true,
    });

    const requestName = 'SETTINGS_PAGE';

    try {
      this.props.requestActions.addRequest({
        name: requestName,
      });
      const [userResponse, configResponse] = await Promise.all([
        api.getUser(),
        api.getConfig(),
      ]);
      const user = _.get(userResponse.responsePayload, 'data.user');
      const config = _.get(configResponse.responsePayload, 'data');
      this.isMounted &&
        this.setState({
          isFetchingData: false,
          user,
          config,
          uiStageValue: config?.flags?.straightThroughProcessing || false,
        });
      this.updateCreditsNav(user);
    } catch (e) {
      this.isMounted &&
        this.setState({
          isFetchingData: false,
        });
    } finally {
      this.props.requestActions.removeRequest({
        name: requestName,
      });
    }
  };

  handleNameEditButtonClick = (e) => {
    e.preventDefault();

    const { user } = this.state;
    this.setState({
      isEditingName: true,
      isUpdatingName: false,
      uiNameValue: _.get(user, 'fullName') || '',
      uiNameError: '',
    });
  };

  handleNameInputChange = (e) => {
    const value = e.target.value;
    this.setState({
      uiNameValue: value,
      uiNameError: '',
    });
  };

  handleNameFormSubmit = async (e) => {
    e.preventDefault();
    const { uiNameValue, isUpdatingName, user } = this.state;

    if (isUpdatingName) {
      // Another request is already in progress
      return;
    }

    if (!uiNameValue) {
      this.setState({
        uiNameError: 'Please enter your name',
      });
      return;
    }

    this.setState({
      isUpdatingName: true,
      uiNameError: '',
    });

    try {
      const response = await api.updateUserSettings({
        payload: {
          full_name: uiNameValue,
        },
      });
      const updatedUser = {
        ...user,
        ..._.get(response.responsePayload, 'data.user'),
      };
      this.isMounted &&
        this.setState({
          user: updatedUser,
          isEditingName: false,
          isUpdatingName: false,
        });
      this.props.appActions.setUser({
        user: updatedUser,
      });
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') || 'Failed to update name';
      this.isMounted &&
        this.setState({
          isUpdatingName: false,
          uiNameError: error,
        });
    }
  };

  handlePasswordEditButtonClick = (e) => {
    e.preventDefault();

    this.setState({
      isEditingPassword: true,
      isUpdatingPassword: false,
      uiOldPasswordValue: '',
      uiNewPasswordValue: '',
      uiRepeatNewPasswordValue: '',
      uiPasswordError: '',
    });
  };

  handleOldPasswordInputChange = ({ value }) => {
    this.setState({
      uiOldPasswordValue: value,
      uiOldPasswordError: '',
      uiPasswordError: '',
    });
  };

  handleNewPasswordInputChange = ({ value }) => {
    this.setState({
      uiNewPasswordValue: value,
      uiNewPasswordError: '',
      uiPasswordError: '',
    });
  };

  handleRepeatNewPasswordInputChange = ({ value }) => {
    this.setState({
      uiRepeatNewPasswordValue: value,
      uiRepeatNewPasswordError: '',
      uiPasswordError: '',
    });
  };

  handlePasswordFormSubmit = async (e) => {
    e.preventDefault();
    const {
      isUpdatingPassword,
      uiOldPasswordValue,
      uiNewPasswordValue,
      uiRepeatNewPasswordValue,
      user: { socialLogin } = {},
    } = this.state;

    if (isUpdatingPassword) {
      // Another request is already in progress
      return;
    }

    const stateErrors = {};
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;

    if (!uiOldPasswordValue && !socialLogin) {
      stateErrors.uiOldPasswordError = 'Please enter your old password';
    }

    if (!uiNewPasswordValue) {
      stateErrors.uiNewPasswordError = 'Please enter your new password';
    }

    if (!uiRepeatNewPasswordValue) {
      stateErrors.uiRepeatNewPasswordError =
        'Please enter your new password again';
    }

    if (
      _.isEmpty(stateErrors) &&
      uiNewPasswordValue !== uiRepeatNewPasswordValue
    ) {
      stateErrors.uiPasswordError = 'New password values do not match';
    }

    if (
      _.isEmpty(stateErrors) &&
      uiOldPasswordValue === uiNewPasswordValue &&
      !socialLogin
    ) {
      stateErrors.uiPasswordError =
        'New password cannot be same as the old password';
    }
    if (_.isEmpty(stateErrors)) {
      if (uiRepeatNewPasswordValue.length < 8) {
        stateErrors.uiPasswordError =
          'Password must be 8 characters long and must include at least a capital, a small letter, a number and a special character.';
      } else if (!passwordRegex.upperCharacter.test(uiRepeatNewPasswordValue)) {
        stateErrors.uiPasswordError =
          'Password must include at least a capital letter.';
      } else if (!passwordRegex.lowerCharacter.test(uiRepeatNewPasswordValue)) {
        stateErrors.uiPasswordError =
          'Password must include at least a small letter.';
      } else if (!passwordRegex.number.test(uiRepeatNewPasswordValue)) {
        stateErrors.uiPasswordError =
          'Password must include at least a number.';
      } else if (
        !passwordRegex.specialCharacter.test(uiRepeatNewPasswordValue)
      ) {
        stateErrors.uiPasswordError =
          'Password must include at least a special character.';
      }
    }

    if (!_.isEmpty(stateErrors)) {
      this.setState(stateErrors);
      return;
    }

    this.setState({
      isUpdatingPassword: true,
      uiPasswordError: '',
    });

    try {
      await api.changeUserPassword({
        oldPassword: uiOldPasswordValue,
        newPassword: uiNewPasswordValue,
        setCookie: false,
      });
      this.isMounted &&
        this.setState({
          isEditingPassword: false,
          isUpdatingPassword: false,
          redirectToLogin: true,
        });
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'error') || 'Failed to update password';
      this.isMounted &&
        this.setState({
          isUpdatingPassword: false,
          uiPasswordError: error,
        });
    }
  };

  handleViewApiBtnClick = async (e) => {
    e.preventDefault();
    const { isUpdatingApiKey } = this.state;

    if (isUpdatingApiKey) {
      // Another request is already in progress
      return;
    }

    this.setState({
      isUpdatingApiKey: true,
    });

    try {
      const response = await api.viewUserDocsumoApiKey();
      const docsumoApiKey = _.get(
        response.responsePayload,
        'data.docsumoApiKey'
      );
      this.isMounted &&
        this.setState({
          isUpdatingApiKey: false,
          config: {
            ...this.state.config,
            docsumoApiKey,
          },
        });
    } catch (e) {
      this.isMounted &&
        this.setState({
          isUpdatingApiKey: false,
        });
    }
  };

  handleBackupModalClose = () => {
    const { appActions } = this.props;

    this.setState({
      startMFA: false,
      user: {
        ...this.state.user,
        mfaEnable: true,
        mfaSetup: true,
      },
    });
    appActions.setToast({
      title: ' MFA has been enabled successfully',
      success: true,
    });
  };

  handleWebhookUrlEditButtonClick = async (e) => {
    const { config } = this.state;
    e.preventDefault();
    this.setState({
      isFetchingWebhook: true,
    });
    try {
      const response = await api.getWebhookData();
      const webhookData = _.get(response.responsePayload, 'data.webhookUrl');
      const { authParam, basicAuth, header } = webhookData;
      this.setState({
        uiWebhookUrlValue: _.get(config, 'webhookUrl') || '',
        uiAuthParamValue: authParam,
        uiBasicAuthValue: basicAuth,
        uiKeyValue: header && header.key,
        uiValueValue: header && header.value,
      });
    } finally {
      this.setState({
        isEditingWebhookUrl: true,
        isUpdatingWebhookUrl: false,
        isFetchingWebhook: false,
        uiWebhookUrlError: '',
      });
    }
  };

  handleWebhookUrlInputChange = (e) => {
    const value = e.target.value;
    this.setState({
      uiWebhookUrlValue: value,
      uiWebhookUrlError: '',
    });
  };
  handleAuthParamInputChange = (e) => {
    const value = e.target.value;
    this.setState({
      uiAuthParamValue: value,
      uiWebhookUrlError: '',
    });
  };
  handleBasicAuthInputChange = (e) => {
    const value = e.target.value;
    this.setState({
      uiBasicAuthValue: value,
      uiWebhookUrlError: '',
    });
  };
  handleKeyInputChange = (e) => {
    const value = e.target.value;
    this.setState({
      uiKeyValue: value,
      uiWebhookUrlError: '',
    });
  };
  handleValueInputChange = (e) => {
    const value = e.target.value;
    this.setState({
      uiValueValue: value,
      uiWebhookUrlError: '',
    });
  };

  handleWebhookFormSubmit = async (e) => {
    e.preventDefault();
    const {
      uiWebhookUrlValue,
      uiAuthParamValue,
      uiBasicAuthValue,
      uiKeyValue,
      uiValueValue,
      isUpdatingWebhookUrl,
    } = this.state;

    if (isUpdatingWebhookUrl) {
      // Another request is already in progress
      return;
    }

    // if (!uiWebhookUrlValue) {
    //     this.setState({
    //         uiWebhookUrlError: 'Please enter Webhook URL',
    //     });
    //     return;
    // }

    this.setState({
      isUpdatingWebhookUrl: true,
      uiWebhookUrlError: '',
    });
    const payload = {
      url: uiWebhookUrlValue,
      auth_param: uiAuthParamValue,
      basic_auth: uiBasicAuthValue,
      key: uiKeyValue,
      value: uiValueValue,
    };
    try {
      const response = await api.updateUserSettingsWebhookUrl({
        payload,
      });
      const webhookUrl = _.get(response.responsePayload, 'data.webhookUrl');
      this.isMounted &&
        this.setState({
          config: {
            ...this.state.config,
            webhookUrl,
          },
          isEditingWebhookUrl: false,
          isUpdatingWebhookUrl: false,
        });
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'error') || 'Failed to update Webhook URL';
      this.isMounted &&
        this.setState({
          isUpdatingWebhookUrl: false,
          uiWebhookUrlError: error,
        });
    }
  };

  handleDataInputChange = (selectedValue) => {
    const { value } = selectedValue;

    this.setState(
      {
        uiDataValue: value,
        uiDataError: '',
      },
      () => {
        this.callDocumentUpdate();
      }
    );
  };
  handleExpireInputChange = (item) => {
    const { value } = item;

    this.setState(
      {
        uiExpireValue: value,
        uiExpireError: '',
      },
      () => {
        this.callExpiryUpdate();
      }
    );
  };

  handleStageInputChange = () => {
    const { uiStageValue } = this.state;
    this.setState(
      (prevState) => ({
        uiStageValue: !prevState.uiStageValue,
        isUpdatingStage: true,
      }),
      () => {
        this.callStraightUpdate(this.state.uiStageValue);
      }
    );
  };

  callDocumentUpdate = async () => {
    const { appActions } = this.props;
    const { uiDataValue } = this.state;

    try {
      const response = await api.updateDocumentDeleteAfter({
        delDocAfter: uiDataValue,
      });

      const delDocAfter = _.get(response.responsePayload, 'data.delDocAfter');
      this.isMounted &&
        this.setState({
          config: {
            ...this.state.config,
            delDocAfter,
          },
        });
      appActions.setToast({
        title: 'Delete document date updated successfully!',
        success: true,
      });
    } catch (e) {
      const error = _.get(e.responsePayload, 'error') || 'Failed to update';
      appActions.setToast({
        title: error,
        error: true,
      });
      this.isMounted &&
        this.setState({
          uiDataError: error,
        });
    }
  };
  callExpiryUpdate = async () => {
    const { appActions } = this.props;
    const { uiExpireValue } = this.state;

    try {
      const response = await api.setTempTokenDuration({
        tempTokenDuration: uiExpireValue,
      });

      const tempTokenDuration = _.get(
        response.responsePayload,
        'data.tempTokenDuration'
      );
      this.isMounted &&
        this.setState({
          config: {
            ...this.state.config,
            tempTokenDuration,
          },
        });

      appActions.setToast({
        title: 'Expiry date updated successfully!',
        success: true,
      });
    } catch (e) {
      const error = _.get(e.responsePayload, 'error') || 'Failed to update';
      appActions.setToast({
        title: error,
        error: true,
      });
      this.isMounted &&
        this.setState({
          uiExpireError: error,
        });
    }
  };
  callStraightUpdate = async (stageValue) => {
    const { appActions } = this.props;
    const { uiStageValue } = this.state;
    try {
      await api.updateStraightThroughProcessingFlags({
        straightThroughProcessing: stageValue,
      });
      const configResponse = await api.getConfig();
      const config = _.get(configResponse.responsePayload, 'data');
      this.isMounted &&
        this.setState({
          config,
        });

      if (stageValue === true) {
        appActions.setToast({
          title: 'Processing initiated successfully!',
          success: true,
        });
      } else {
        appActions.setToast({
          title: 'Straight through processing cancelled!',
          error: true,
        });
      }
    } catch (e) {
      const error = _.get(e.responsePayload, 'error') || 'Failed to update';
      this.isMounted &&
        this.setState({
          uiStageError: error,
        });
    } finally {
      this.setState({
        isUpdatingStage: false,
      });
    }
  };

  renderFormContent = () => {
    const { type } = _.get(this.props, 'match.params');
    const { user } = this.state;

    /* eslint-disable indent */
    switch (type) {
      case SettingRoutes.ACCOUNT_SETTINGS:
        return (
          <div className={styles.fullPageScroll}>
            {this.accountSettingFormContent()}
          </div>
        );
      case SettingRoutes.MEMBERS:
        return <UserManagement />;
      case SettingRoutes.DATABASE:
        return <Database />;
      case SettingRoutes.INTEGRATION:
        return <Integration />;
      case SettingRoutes.SECURITY:
        return (
          <SecuritySettings
            appActions={this.props.appActions}
            requestActions={this.props.requestActions}
            user={user}
          />
        );
    }
    /* eslint-enable indent */
  };

  handleAccountLinkWithSocialSignon = async (tokenResponse = {}) => {
    const { email = '', idToken = '', providerId = '' } = tokenResponse;
    const { user } = this.state;
    const { appActions, config } = this.props;
    const { setToast } = appActions;
    const provider = providerId.split('.')[0];
    const { canSwitchToOldMode = true } = config;

    const payload = {
      idp: provider,
      id_token: idToken,
      social_signin_email: email,
    };

    const mixpanelProperties = {
      'work email': email,
      providerId: provider,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    };

    try {
      await api.linkAccountWithSocial({ payload });

      // store SSOToken for global access
      await appActions.setSSOToken({ tokenResponse });

      // Add mixpanel event
      mixpanel.identify(user.userId);
      mixpanel.track(
        MIXPANEL_EVENTS.social_signon_email_link_complete,
        mixpanelProperties
      );

      setToast({
        title: `Account linked with ${_.capitalize(provider)} successfully.`,
        success: true,
      });

      this.fetchData();
    } catch (error) {
      const { responsePayload = {} } = error;

      if (!_.isEmpty(responsePayload)) {
        this.setState({ socialSigninError: responsePayload.message });
      }

      mixpanel.track(MIXPANEL_EVENTS.social_signon_email_link_failed, {
        ...mixpanelProperties,
        error: responsePayload.message,
      });
    }
  };

  signonBtnClickHandler = async ({ provider }) => {
    let uiError = '';

    this.setState({ uiError, errors: { email: '', password: '' } });

    const { error, tokenResponse } = await signInAuthProvider({
      providerId: provider,
    });

    if (!_.isEmpty(error)) {
      uiError = error.message;
    } else {
      this.handleAccountLinkWithSocialSignon(tokenResponse);
    }

    this.setState({ socialSigninError: uiError });
  };

  handleMFASwitchToggle = async () => {
    const { user } = this.state;
    const { config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const mfaSetup = _.get(user, 'mfaSetup') || false;
    const mfaEnable = _.get(user, 'mfaEnable') || false;

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.account_mfa_click, {
      'work email': user.email || '',
      role: user.role || '',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    if (mfaSetup && mfaEnable) {
      this.setState({ mfaFlowType: MFA_FLOW_TYPES.toggle });
    } else {
      if (!mfaSetup) {
        const { appActions } = this.props;

        appActions.showLoaderOverlay();

        try {
          const response = await api.setupMFAFlow({
            scope: 'one',
          });
          const mfaConfig = _.get(response.responsePayload, 'data');
          this.setState({
            mfaConfig,
            mfaFlowType: MFA_FLOW_TYPES.setup,
          });
        } catch (e) {
          const error =
            _.get(e.responsePayload, 'message') ||
            'An error occurred while fetching MFA setup details';
          appActions.setToast({
            title: error,
            error: true,
          });
        } finally {
          appActions.hideLoaderOverlay();
        }
      }
    }
  };

  handleEnableMFASuccess = () => {
    const { user } = this.state;
    const { config } = this.props;
    const { canSwitchToOldMode = true } = config;

    this.setState({
      mfaFlowType: '',
      user: {
        ...user,
        mfaEnable: true,
        mfaSetup: true,
      },
    });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.account_mfa_toggle, {
      'work email': user.email || '',
      role: user.role || '',
      status: 'enabled',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleDisableMFASuccess = () => {
    const { user } = this.state;
    const { config } = this.props;
    const { canSwitchToOldMode = true } = config;

    this.setState({
      mfaFlowType: '',
      user: {
        ...this.state.user,
        mfaEnable: false,
        mfaSetup: false,
      },
    });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.account_mfa_toggle, {
      'work email': user.email || '',
      role: user.role || '',
      status: 'disabled',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleResetMFA = async (event) => {
    event.preventDefault();
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.reset_mfa_click, {
      'work email': user.email || '',
      role: user.role || '',
      origin: 'Settings - Account',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.setState({
      mfaFlowType: MFA_FLOW_TYPES.reset,
    });
  };

  handleSecurityClick = () => {
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    mixpanel.track(MIXPANEL_EVENTS.security_settings, {
      'work email': user.email || '',
      role: user.role || '',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  accountSettingFormContent = () => {
    const {
      user,
      config,
      isEditingName,
      isUpdatingName,
      uiNameValue,
      uiNameError,
      isEditingPassword,
      isUpdatingPassword,
      uiOldPasswordValue,
      uiNewPasswordValue,
      uiRepeatNewPasswordValue,
      uiOldPasswordError,
      uiNewPasswordError,
      uiRepeatNewPasswordError,
      uiPasswordError,
      isRefreshingApiKey,
      valueData,
      valueStage,
      valueExpire,
      allowEditFields,
      redirectToLogin,
      user: { socialLogin, emailLogin, idp = '' } = {},
      socialSigninError,
      mfaFlowType,
      isUpdatingStage,
      uiStageValue,
      isHupspotMeetingPopupOpen,
    } = this.state;

    const name = _.get(user, 'fullName') || '';
    const email = _.get(user, 'email') || '';
    const companyName = _.get(user, 'companyName') || '';
    const region = _.get(user, 'region') || '';
    const mfaEnable = _.get(user, 'mfaEnable') || false;
    const mfaSetup = _.get(user, 'mfaSetup') || false;
    const orgMfaEnable = _.get(user, 'orgMfaEnable') || false;
    const sso = _.get(user, 'sso') || {};
    const fromGoogleMarketplace = _.get(config, 'fromGoogleMarketplace');
    let regionName = '';
    /* eslint-disable indent */
    switch (region) {
      case 'india':
        regionName = 'Asia Pacific';
        break;
      case 'us':
        regionName = 'USA';
        break;
      case 'eu':
        regionName = 'Europe';
        break;
      default:
        regionName = 'Asia Pacific';
        break;
    }
    /* eslint-enable indent */
    /* const avatarUrl = _.get(user, 'avatarUrls.150');
     */
    let stageCurrentValue =
      uiStageValue || config?.flags?.straightThroughProcessing;

    return (
      <>
        <form className={styles.formField} onSubmit={this.handleNameFormSubmit}>
          <label
            htmlFor='settings-input-name'
            className={styles.formField_label}
          >
            Name
          </label>

          <div className={styles.formField_inputWrapper}>
            {isEditingName ? (
              <Input
                ref={this.nameInputRef}
                id='settings-input-name'
                type='text'
                name='name'
                value={uiNameValue}
                placeholder='Placeholder'
                disabled={isUpdatingName}
                onChange={this.handleNameInputChange}
              />
            ) : (
              <span className={styles.formField_valueText}>{name}</span>
            )}

            {isEditingName && uiNameError ? (
              <ErrorText className={styles.fieldValue_errorAbs}>
                {uiNameError}
              </ErrorText>
            ) : null}
          </div>

          <div className={styles.formField_buttonWrapper}>
            {isEditingName ? (
              <>
                <Button
                  variant={'outlined'}
                  size={'small'}
                  onClick={() => this.setState({ isEditingName: false })}
                >
                  Cancel
                </Button>
                <Button
                  variant={'contained'}
                  isLoading={isUpdatingName}
                  size={'small'}
                  type={'submit'}
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant={'outlined'}
                icon={Edit}
                size={'small'}
                isLoading={isUpdatingName}
                onClick={this.handleNameEditButtonClick}
              >
                Edit
              </Button>
            )}
          </div>
        </form>

        <form className={styles.formField}>
          <label htmlFor='email' className={styles.formField_label}>
            Email
          </label>
          <div className={styles.formField_inputWrapper}>
            <span className={styles.formField_valueText}>{email}</span>
          </div>
        </form>

        <form
          className={styles.formField}
          onSubmit={this.handlePasswordFormSubmit}
        >
          <label
            htmlFor='password'
            className={cx(styles.formField_label, {
              [styles.formField_label__start]: isEditingPassword,
            })}
          >
            Password
          </label>
          <div className={styles.formField_inputWrapper}>
            {isEditingPassword ? (
              <>
                {emailLogin && (
                  <>
                    <label
                      htmlFor='oldpassword'
                      className={styles.formField_inputWrapper__label}
                    >
                      Old Password
                    </label>
                    <Input
                      ref={this.oldPasswordInputRef}
                      id='settings-input-name'
                      name='oldPassword'
                      type='password'
                      value={uiOldPasswordValue}
                      hasError={uiOldPasswordError}
                      autoComplete='new-password'
                      placeholder='*********'
                      disabled={isUpdatingPassword}
                      className={'mb-5'}
                      onChange={(e) =>
                        this.handleOldPasswordInputChange(e.target)
                      }
                    />
                  </>
                )}
                <label
                  htmlFor='newpassword'
                  className={styles.formField_inputWrapper__label}
                >
                  New Password
                </label>
                <Input
                  ref={this.newPasswordInputRef}
                  name='newpassword'
                  type='password'
                  value={uiNewPasswordValue}
                  hasError={uiNewPasswordError}
                  autoComplete='new-password'
                  placeholder='*********'
                  disabled={isUpdatingPassword}
                  className={'mb-5'}
                  onChange={(e) => this.handleNewPasswordInputChange(e.target)}
                />
                <label
                  htmlFor='confirmNewPassword'
                  className={styles.formField_inputWrapper__label}
                >
                  Confirm New Password
                </label>
                <Input
                  ref={this.repeatNewPasswordInputRef}
                  name='newpassword'
                  type='password'
                  value={uiRepeatNewPasswordValue}
                  hasError={uiRepeatNewPasswordError}
                  autoComplete='new-password'
                  placeholder='*********'
                  disabled={isUpdatingPassword}
                  onChange={(e) =>
                    this.handleRepeatNewPasswordInputChange(e.target)
                  }
                />
              </>
            ) : (
              <span className={styles.formField_valueText}>*********</span>
            )}

            {isEditingPassword && uiPasswordError ? (
              <ErrorText className={styles.fieldValue_errorAbs}>
                {uiPasswordError}
              </ErrorText>
            ) : null}
          </div>

          <div
            className={cx(styles.formField_buttonWrapper, {
              [styles.formField_buttonWrapper__bottom]: isEditingPassword,
            })}
          >
            {isEditingPassword ? (
              <>
                <Button
                  variant={'outlined'}
                  size={'small'}
                  onClick={() => this.setState({ isEditingPassword: false })}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={isUpdatingPassword}
                  variant={'contained'}
                  size={'small'}
                  type={'submit'}
                >
                  {!emailLogin ? 'Create' : 'Update'}
                </Button>
              </>
            ) : (
              <Button
                variant={'outlined'}
                icon={!emailLogin ? null : Refresh}
                size={'small'}
                onClick={this.handlePasswordEditButtonClick}
              >
                {!emailLogin ? 'Create' : 'Reset'}
              </Button>
            )}
          </div>
        </form>

        <form className={styles.formField}>
          <label htmlFor='company_name' className={styles.formField_label}>
            Company Name
          </label>
          <div className={styles.formField_inputWrapper}>
            <span className={styles.formField_valueText}>{companyName}</span>
          </div>
        </form>
        <form className={styles.formField}>
          <label htmlFor='region' className={styles.formField_label}>
            Region
          </label>
          <div className={styles.formField_inputWrapper}>
            <span className={styles.formField_valueText}>{regionName}</span>
          </div>
        </form>

        <div className={styles.fieldValue}>
          <div
            className={cx(styles.fieldValue_left, {
              [styles.fieldValue_left__linked]: socialLogin,
            })}
          >
            <label htmlFor='region' className={styles.fieldValue_label}>
              Social Login
            </label>
            {socialSigninError ? (
              <ErrorText className={styles.fieldValue_errorAbs}>
                {socialSigninError}
              </ErrorText>
            ) : (
              <p className={styles.fieldValue_helpText}>
                {socialLogin
                  ? `You can login to Docsumo through ${_.capitalize(idp)}.`
                  : 'Setting this up will make logging in easier with Google or Microsoft.'}
              </p>
            )}
          </div>

          <div className={styles.fieldValue_socialSignonWrapper}>
            {socialLogin ? (
              <Button
                variant={'outlined'}
                icon={Check}
                disabled={true}
                className={styles.fieldValue_socialSignonWrapper__linkedBtn}
                iconClassName={
                  styles.fieldValue_socialSignonWrapper__linkedbtnIcon
                }
                size={'small'}
                onClick={() =>
                  this.signonBtnClickHandler({ provider: 'google' })
                }
              >
                Connected with {`${_.capitalize(idp)}`}
              </Button>
            ) : (
              <>
                <Button
                  variant={'outlined'}
                  icon={<GoogleSignonIcon />}
                  disabled={sso.isEnabled}
                  iconClassName={styles.fieldValue_socialSignonWrapper__btnIcon}
                  size={'small'}
                  onClick={() =>
                    this.signonBtnClickHandler({ provider: 'google' })
                  }
                >
                  Connect with Google
                </Button>
                <Button
                  variant={'outlined'}
                  icon={<MicrosoftSignonIcon />}
                  iconClassName={styles.fieldValue_socialSignonWrapper__btnIcon}
                  disabled={sso.isEnabled}
                  size={'small'}
                  onClick={() =>
                    this.signonBtnClickHandler({ provider: 'microsoft' })
                  }
                >
                  Connect with Microsoft
                </Button>
              </>
            )}
          </div>
        </div>
        <div className={styles.fieldValue}>
          <div className={cx(styles.fieldValue_left)}>
            <label htmlFor='mfa' className={styles.fieldValue_label}>
              Multi-factor Authentication
            </label>
            <p className={styles.fieldValue_helpText}>
              {orgMfaEnable
                ? 'Workspace wide MFA is enabled'
                : mfaEnable
                ? 'Multi-factor authentication is enabled for your account.'
                : 'Multi-factor authentication is disabled for your account.'}
            </p>
          </div>

          <div className={styles.fieldValue_right}>
            {mfaEnable && mfaSetup && (
              <Button
                icon={Refresh}
                size={'small'}
                variant={'outlined'}
                type={'button'}
                onClick={this.handleResetMFA}
              >
                Reset
              </Button>
            )}
            <ToggleControl
              size='small'
              title='Small Placeholder'
              handleStatus={this.handleMFASwitchToggle}
              checked={mfaEnable && mfaSetup}
            />
          </div>
        </div>
        {allowEditFields ? (
          <div className={styles.fieldValue}>
            <div className={cx(styles.fieldValue_left)}>
              <label htmlFor='temp_token' className={styles.fieldValue_label}>
                Expiry Time For Temporary Token
              </label>
              <p className={styles.fieldValue_helpText}>
                This setting will let you choose the expiry time of the
                temporary token.
              </p>
            </div>

            <div className={styles.fieldValue_right}>
              <Dropdown
                data={EXPIRY_DATA}
                value={
                  EXPIRY_DATA.find(
                    (data) => data.value === config.tempTokenDuration
                  )?.value || valueExpire?.value
                }
                optionLabelKey='name'
                optionValueKey='value'
                onChange={this.handleExpireInputChange}
              />
            </div>
          </div>
        ) : (
          ''
        )}
        {allowEditFields ? (
          <div className={styles.fieldValue}>
            <div className={cx(styles.fieldValue_left)}>
              <label htmlFor='delete_doc' className={styles.fieldValue_label}>
                Remove Data After
              </label>
              <p className={styles.fieldValue_helpText}>
                This setting will remove your documents and the captured data
                from Docsumo at the end of the expiry period.
              </p>
            </div>

            <div className={styles.fieldValue_right}>
              <Dropdown
                data={DATAS}
                value={
                  DATAS.find((data) => data.value === config.delDocAfter)
                    ?.value || valueData?.value
                }
                optionLabelKey='name'
                optionValueKey='value'
                onChange={this.handleDataInputChange}
              />
            </div>
          </div>
        ) : (
          ''
        )}
        {allowEditFields ? (
          <div className={styles.fieldValue}>
            <div className={cx(styles.fieldValue_left)}>
              <label
                htmlFor='stage_process'
                className={styles.fieldValue_label}
              >
                Straight Through Processing
              </label>
              <p className={styles.fieldValue_helpText}>
                Automatically approve documents where accuracy is high to
                further reduce the manual effort.
              </p>
            </div>

            <div className={styles.fieldValue_right}>
              <ToggleControl
                isLoading={isUpdatingStage}
                size='small'
                title='Small Placeholder'
                handleStatus={this.handleStageInputChange}
                checked={stageCurrentValue}
              />
            </div>
          </div>
        ) : (
          ''
        )}

        <div className={styles.fieldValue}>
          <div className={cx(styles.fieldValue_left)}>
            {fromGoogleMarketplace ? (
              <label htmlFor='delete_doc' className={styles.fieldValue_label}>
                Credit Usage
              </label>
            ) : (
              <div>
                <span className={cx(styles.fieldValue_label, 'mr-3')}>
                  Monthly Credit Limit
                </span>
                <Button
                  variant={VARIANT.OUTLINED}
                  size={SIZE.SMALL}
                  onClick={this.handleRequestCreditClick}
                >
                  Request Credits
                </Button>
                <HubspotMeetingPopup
                  user={user}
                  isOpen={isHupspotMeetingPopupOpen}
                  handleClose={this.handleContactSalesPopupClose}
                  origin={SALES_ORIGIN_KEYS.userSettings}
                />
              </div>
            )}
          </div>

          <div className={styles.fieldValue_right}>
            {fromGoogleMarketplace ? (
              <a
                href='https://console.cloud.google.com/billing'
                target='_blank'
                rel='noopener noreferrer'
                className={styles.googleMarketPlaceLink}
              >
                <span>Managed by Google</span>
                <OpenNewWindow width={'1.125rem'} height={'1.125rem'} />
              </a>
            ) : (
              <div className={styles.fieldValue_creditProgressBar}>
                <div
                  className={styles.fieldValue_fill}
                  style={{
                    width: `${
                      (user.monthlyDocCurrent / user.monthlyDocLimit) * 100
                    }%`,
                  }}
                />
                <p className={styles.fieldValue_fill__value}>
                  {user.monthlyDocCurrent} / {user.monthlyDocLimit} credits
                  consumed
                </p>
              </div>
            )}
          </div>
        </div>
        {mfaFlowType === MFA_FLOW_TYPES.toggle && (
          <ToggleMFAFlow
            scope='one'
            user={user}
            config={config}
            isMFAEnabled={mfaEnable}
            onExit={() => this.setState({ mfaFlowType: '' })}
            onEnableSuccess={this.handleEnableMFASuccess}
            onDisableSuccess={this.handleDisableMFASuccess}
          />
        )}
        {mfaFlowType === MFA_FLOW_TYPES.setup && (
          <SetupMFAFlow
            scope='one'
            user={user}
            config={config}
            mfaData={this.state.mfaConfig}
            onEnableSuccess={this.handleEnableMFASuccess}
            onExit={() => this.setState({ mfaFlowType: '' })}
          />
        )}
        {mfaFlowType === MFA_FLOW_TYPES.reset && (
          <ResetMFAFlow
            scope='one'
            user={user}
            config={config}
            onEnableSuccess={this.handleEnableMFASuccess}
            onExit={() => this.setState({ mfaFlowType: '' })}
          />
        )}
        {redirectToLogin ? <RedirectLoginModal /> : null}
      </>
    );
  };

  handleRequestCreditClick = () => {
    const { appActions } = this.props;
    const {
      user: { role },
      config: { accountType },
    } = this.props;

    const isFreeUser = accountType === ACCOUNT_TYPES.FREE;

    mixpanelTrackingAllEvents(
      MIXPANEL_EVENTS.creditutilization_requestcredits_accountsettings,
      { origin: 'User Settings' }
    );

    if (isFreeUser) {
      this.setState({ isHupspotMeetingPopupOpen: true });
    } else {
      appActions.showCreditUtilizationModal();
    }
  };

  handleContactSalesPopupClose = () => {
    this.setState({ isHupspotMeetingPopupOpen: false });
  };

  renderSkeletonLoader = () => {
    return <SkeletonLoader />;
  };

  render() {
    const { isFetchingData, user, showUser } = this.state;

    const showForm = !isFetchingData && user;

    return (
      <Fragment>
        <PageMetadata title='Account Settings' />
        <div className={styles.colLeft}>
          <ul>
            <li>
              <NavLink
                exact
                to={ROUTES.ACCOUNT_SETTINGS}
                title='Account Settings'
                className={styles.navItem}
                activeClassName={styles.active}
              >
                <div className={styles.iconWrapper}>
                  <UserCircle />
                </div>
                <p className={styles.title}>Account Settings</p>
              </NavLink>
            </li>
            {showUser ? (
              <li>
                <NavLink
                  exact
                  to={ROUTES.USER_SETTINGS}
                  title='Users'
                  className={styles.navItem}
                  activeClassName={styles.active}
                >
                  <div className={styles.iconWrapper}>
                    <Group />
                  </div>
                  <p className={styles.title}>Users</p>
                </NavLink>
              </li>
            ) : (
              ''
            )}
            {showUser ? (
              <li>
                <NavLink
                  exact
                  to={ROUTES.DATABASE_TABLES}
                  title='Database Tables'
                  className={styles.navItem}
                  activeClassName={styles.active}
                >
                  <div className={styles.iconWrapper}>
                    <TableRows />
                  </div>
                  <p className={styles.title}>Database Tables</p>
                </NavLink>
              </li>
            ) : (
              ''
            )}
            <li>
              <NavLink
                exact
                to={ROUTES.INTEGRATION_SETTINGS}
                title='Integrations'
                className={styles.navItem}
                activeClassName={styles.active}
              >
                <div className={styles.iconWrapper}>
                  <Tools />
                </div>
                <p className={styles.title}>Integrations</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                exact
                to={ROUTES.SECURITY_SETTINGS}
                title='Security'
                className={styles.navItem}
                activeClassName={styles.active}
                onClick={this.handleSecurityClick}
              >
                <div className={styles.iconWrapper}>
                  <HistoricShieldAlt />
                </div>
                <p className={styles.title}>Security</p>
              </NavLink>
            </li>
          </ul>
        </div>
        <div className={styles.colRight}>
          {_.get(this.props, 'match.params.type') === 'account-settings' ? (
            <React.Fragment>
              <div className={styles.colRight_title}>Account Settings</div>
              {showForm
                ? this.renderFormContent()
                : this.renderSkeletonLoader()}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className={styles.colRight__content}>
                {this.renderFormContent()}
              </div>
            </React.Fragment>
          )}
        </div>
      </Fragment>
    );
  }
}

function mapStateToProp(state) {
  const { user, config } = state.app;

  return { user, config };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    requestActions: bindActionCreators(requestActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(SettingsPage);
