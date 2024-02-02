/* eslint-disable simple-import-sort/imports */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Trash, Wrench, Copy, Check, Cancel } from 'iconoir-react';

import { actions as appActions } from 'new/redux/app/actions';

import _ from 'lodash';
import cx from 'classnames';
import copy from 'clipboard-copy';
import mixpanel from 'mixpanel-browser';

import * as api from 'new/api';

import { USER_TYPES } from 'new/constants';

import { showToast } from 'new/redux/helpers';

import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { signInAuthProvider } from 'new/thirdParty/firebase';

import { validateURL, validateCertificate } from 'new/utils/validation';

import Button from 'new/ui-elements/Button/Button';

import HubspotMeetingPopup from 'new/components/modals/hubspot';
import ConfirmationModal from 'new/components/shared/FiledConfirmationModal';

import SetupMFAFlow from 'new/components/pages/SettingsPage/components/SetupMFAFlow/SetupMFAFlow';
import ToggleMFAFlow from 'new/components/pages/SettingsPage/components/ToggleMFAFlow/ToggleMFAFlow';

import styles from './SecuritySettings.scss';
import ToggleControl from 'new/ui-elements/ToggleControl/ToggleControl';
import Input from 'new/ui-elements/Input/Input';
import Textarea from 'new/ui-elements/Textarea/Textarea';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import Banner from 'new/ui-elements/Banner/Banner';
import SkeletonLoader from './SkeletonLoader/SkeletonLoader';
import { SALES_ORIGIN_KEYS } from 'new/components/contexts/trackingConstants';

// const SESSION_TIMEOUT_RANGE = [
//     { name: '1 Day', value: 1 },
//     { name: '7 Days', value: 7 },
// ];
// const PASSWORD_EXPIRY_DAYS_RANGE = [
//     { name: 'Never Expire', value: 'never' },
//     { name: '7 Days', value: 7 },
//     { name: '30 Days', value: 30 },
//     { name: '60 Days', value: 60 },
//     { name: '90 Days', value: 90 },
// ];

const MFA_FLOW_TYPES = {
  toggle: 'TOGGLE',
  setup: 'SETUP',
};

class SecuritySettings extends Component {
  state = {
    // Input fields
    // sessionTimeout: SESSION_TIMEOUT_RANGE[0],
    isMFAEnabled: false,
    // passwordExpiryDays: PASSWORD_EXPIRY_DAYS_RANGE[0],
    // minPasswordLength: 8,
    // maxPasswordLength: 16,
    audienceURI: '',
    ssoURL: '',
    issuerURI: '',
    idpURL: '',
    idpCertificate: '',
    deleteConfirmationInput: '',

    // Error messages
    errorMessages: {},

    // Modals
    showContactSalesModal: false,
    showGoBackModal: false,
    showEnableSsoConfirmationModal: false,
    showDisableSsoConfirmationModal: false,
    showDeleteSetupConfirmationModal: false,

    // Others
    canConfigureSSO: false,
    isSsoEnabled: false,
    configureSSO: false,
    isTestingSuccess: false,
    providerId: '',
    isSSOSetupDeleted: false,

    // loaders
    isTestingSSO: false,
    isDeletingSSO: false,
    isEnablingSSO: false,
    isDisablingSSO: false,
    isFetchingData: true,

    //user details
    user: {},
    userRole: null,

    initialSSOFieldsData: {}, // used to compare changes in fields after Test or SSO enable/disable

    mfaFlowType: '',
    testSuccessStatusMessage: '',
  };

  // Fetch sso setup details
  fetchSSOSettings = async () => {
    this.setState({ isFetchingData: true });
    try {
      const response = await api.fetchSsoSettings();
      const ssoData = _.get(response.responsePayload, 'data') || {};

      const ssoFieldsData = {
        ssoURL: ssoData.spSsoUrl || '',
        idpURL: ssoData.idpLoginUrl || '',
        audienceURI: ssoData.spEntityId || '',
        issuerURI: ssoData.idpEntityId || '',
        idpCertificate: ssoData.idpPublicCertificate,
      };

      this.setState({
        canConfigureSSO: ssoData.canConfigure || false,
        isTestingSuccess: ssoData.canEnable,
        isSsoEnabled: ssoData.isEnabled,
        initialSSOFieldsData: ssoFieldsData,
        ...ssoFieldsData,
        testSuccessStatusMessage: ssoData.isEnabled
          ? ''
          : 'You can complete your Single Sign-on setup after successfully logging in',
      });
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'Unable to fetch SSO settings. Please try again later.';
      showToast({
        title: error,
        error: true,
      });
    } finally {
      this.setState({ isFetchingData: false });
    }
  };

  fetchCurrentUserDetails = async () => {
    try {
      const response = await api.getUser();
      const user = _.get(response.responsePayload, 'data.user') || {};
      this.setState({ user });
      return user;
    } catch (e) {
      const error = _.get(e.responsePayload, 'error') || 'Failed to login';
      // eslint-disable-next-line no-console
      console.error(error);
      return {};
    }
  };

  initializeData = async () => {
    this.setState({ isFetchingData: true });

    const user = await this.fetchCurrentUserDetails();
    const isMFAEnabled = _.get(user, 'orgMfaEnable') || false;
    const userRole = _.get(user, 'role') || false;

    this.setState({ userRole });

    this.setState({
      user,
      isMFAEnabled,
    });

    await this.fetchSSOSettings();
    this.props.requestActions.removeRequest({
      name: 'SSO_SETTINGS',
    });
  };

  componentDidMount() {
    this.props.requestActions.addRequest({
      name: 'SSO_SETTINGS',
    });
    this.initializeData();
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    const { errorMessages } = this.state;

    this.setState({
      [name]: value,
      errorMessages: { ...errorMessages, [name]: '' },
    });
  };

  handleConfigureSSOChange = () => {
    const { configureSSO } = this.state;

    this.setState({ configureSSO: !configureSSO });
  };

  handleCopy = (value) => {
    if (!value || !value.trim()) {
      return;
    }

    copy(value);
    showToast({
      title: 'Copied to clipboard',
      success: true,
      duration: 3000,
    });
  };

  validateSSOFields = () => {
    const {
      audienceURI,
      ssoURL,
      issuerURI,
      idpURL,
      idpCertificate,
      errorMessages,
    } = this.state;

    let errors = {};

    const audienceURIValidation = validateURL(audienceURI);
    if (!audienceURIValidation.isValid) {
      errors.audienceURI = audienceURIValidation.message;
    }

    const ssoURLValidation = validateURL(ssoURL);
    if (!ssoURLValidation.isValid) {
      errors.ssoURL = ssoURLValidation.message;
    }

    const issuerURIValidation = validateURL(issuerURI);
    if (!issuerURIValidation.isValid) {
      errors.issuerURI = issuerURIValidation.message;
    }

    const idpURLValidation = validateURL(idpURL);
    if (!idpURLValidation.isValid) {
      errors.idpURL = idpURLValidation.message;
    }

    const idpCertificateValidation = validateCertificate(idpCertificate);
    if (!idpCertificateValidation.isValid) {
      errors.idpCertificate = idpCertificateValidation.message;
    }

    this.setState({ errorMessages: { ...errorMessages, ...errors } });

    if (_.isEmpty(errors)) {
      return true;
    } else {
      return false;
    }
  };

  authenticateSSOUser = async (ssoProvider) => {
    const { user } = this.state;
    const { config } = this.props;
    const { canSwitchToOldMode = true } = config;

    if (!ssoProvider) {
      showToast({
        title: 'SSO provider is unavailable',
        error: true,
      });

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.test_sso_error, {
        'work email': user.email || '',
        role: user.role || '',
        error: 'SSO provider is unavailable',
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });

      return null;
    }

    const { error, tokenResponse } = await signInAuthProvider({
      providerId: ssoProvider,
      type: 'SSO',
    });

    if (!_.isEmpty(error)) {
      showToast({
        title: error.message || 'Error encountered when authorizing user',
        error: true,
      });

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.test_sso_error, {
        'work email': user.email || '',
        role: user.role || '',
        error: error.message || 'Error encountered when authorizing user',
      });

      return null;
    } else if (!_.isEmpty(tokenResponse)) {
      return tokenResponse.idToken || '';
    } else {
      return null;
    }
  };

  validateSSOIdToken = async (idToken) => {
    const { user } = this.state;
    const { config } = this.props;
    const { canSwitchToOldMode = true } = config;

    try {
      const response = await api.validateSsoIdToken({
        payload: {
          id_token: idToken,
        },
      });
      const status = _.get(response.responsePayload, 'status') || '';

      if (status === 'success') {
        return true;
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') || 'SSO authentication failed';
      showToast({
        title: error,
        error: true,
        duration: 3000,
      });

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.test_sso_error, {
        'work email': user.email || '',
        role: user.role || '',
        error: error,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });

      this.setState({ isTestingSSO: false });
      return false;
    }
  };

  testSSOSetup = async () => {
    const {
      issuerURI,
      idpURL,
      idpCertificate,
      audienceURI,
      ssoURL,
      initialSSOFieldsData,
      isSsoEnabled,
      user,
    } = this.state;
    const { config } = this.props;
    const { canSwitchToOldMode = true } = config;

    this.setState({ isTestingSSO: true });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.test_sso, {
      'work email': user.email || '',
      role: user.role || '',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      const response = await api.testSsoSetup({
        payload: {
          idp_entity_id: issuerURI,
          idp_login_url: idpURL,
          idp_public_certificate: idpCertificate,
        },
      });
      const ssoData = _.get(response.responsePayload, 'data') || {};

      const idToken = await this.authenticateSSOUser(ssoData.providerId || '');

      if (!idToken) {
        this.setState({ isTestingSSO: false });
        showToast({
          title: 'ID token not found',
          error: true,
          duration: 3000,
        });
        return;
      }

      const isSSOUserValid = await this.validateSSOIdToken(idToken);

      if (isSSOUserValid) {
        this.setState({
          isTestingSuccess: true,
          isTestingSSO: false,
          initialSSOFieldsData: {
            ...initialSSOFieldsData,
            issuerURI,
            audienceURI,
            idpCertificate,
            idpURL,
            ssoURL,
          },
          testSuccessStatusMessage: `Test completed successfully! ${
            isSsoEnabled ? '' : 'Please click on Enable SSO below.'
          }`,
        });
        showToast({
          title: 'Test for Single Sign-on completed successfully',
          success: true,
          duration: 3000,
        });
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'Test for Single Sign-on unsuccessful';
      showToast({
        title: error,
        error: true,
        duration: 3000,
      });

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.test_sso_error, {
        'work email': user.email || '',
        role: user.role || '',
        error: error,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });

      this.setState({
        isTestingSSO: false,
        testSuccessStatusMessage:
          'Test unsuccessful. Please check the configuration or contact customer support.',
      });
    }
  };

  handleTest = async () => {
    const isValid = this.validateSSOFields();

    if (!isValid) return;

    await this.testSSOSetup();
  };

  handleEnableSSO = async () => {
    const { user } = this.state;
    const { config } = this.props;
    const { canSwitchToOldMode = true } = config;

    this.setState({ isEnablingSSO: true });

    try {
      const response = await api.enableOrDisableSso({
        payload: {
          is_enabled: true,
        },
      });
      const status = _.get(response.responsePayload, 'status') || '';

      if (status === 'success') {
        showToast({
          title: 'Single Sign-on enabled successfully',
          success: true,
          duration: 3000,
        });
        this.setState({
          isSsoEnabled: true,
          showEnableSsoConfirmationModal: false,
        });

        // Add mixpanel event
        mixpanel.track(MIXPANEL_EVENTS.enable_sso, {
          'work email': user.email || '',
          role: user.role || '',
          version: 'new',
          canSwitchUIVersion: canSwitchToOldMode,
        });

        try {
          await api.logoutUser();
          window.location = '/login/sso';
        } catch (e) {
          const error =
            _.get(e.responsePayload, 'message') || 'Unable to logout';
          showToast({
            title: error,
            error: true,
          });
        }
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') || 'Unable to enable SSO';
      showToast({
        title: error,
        error: true,
        duration: 3000,
      });
    } finally {
      this.setState({
        isEnablingSSO: false,
      });
    }
  };

  handleDisableSSO = async () => {
    const { user } = this.state;
    const { appActions, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    this.setState({ isDisablingSSO: true });

    try {
      const response = await api.enableOrDisableSso({
        payload: {
          is_enabled: false,
        },
      });
      const status = _.get(response.responsePayload, 'status') || '';

      if (status === 'success') {
        showToast({
          title: 'Single Sign-on disabled successfully',
          success: true,
          duration: 3000,
        });
        this.setState({
          isSsoEnabled: false,
          showDisableSsoConfirmationModal: false,
        });

        // Add mixpanel event
        mixpanel.track(MIXPANEL_EVENTS.disable_sso, {
          'work email': user.email || '',
          role: user.role || '',
          version: 'new',
          canSwitchUIVersion: canSwitchToOldMode,
        });

        const ssoData = { ...user.sso, isEnabled: false };
        // Update in redux store
        appActions.setUser({
          user: {
            ...user,
            sso: { ...ssoData },
          },
        });
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') || 'Unable to disable SSO';
      showToast({
        title: error,
        error: true,
        duration: 3000,
      });
    } finally {
      this.setState({
        isDisablingSSO: false,
      });
    }
  };

  handleGoBackClick = () => {
    const {
      audienceURI,
      issuerURI,
      idpCertificate,
      idpURL,
      ssoURL,
      initialSSOFieldsData,
    } = this.state;

    const updatedSSOFieldsData = {
      audienceURI,
      issuerURI,
      idpCertificate,
      idpURL,
      ssoURL,
    };

    if (!_.isEqual(updatedSSOFieldsData, initialSSOFieldsData)) {
      this.setState({ showGoBackModal: true });
    } else {
      this.handleGoBack();
    }
  };

  handleGoBack = () => {
    this.setState({
      configureSSO: false,
      showGoBackModal: false,
      ...this.state.initialSSOFieldsData,
      errorMessages: {},
    });
  };

  handleDeleteSetup = async () => {
    const { deleteConfirmationInput, errorMessages } = this.state;
    if (
      !deleteConfirmationInput ||
      !deleteConfirmationInput.trim() ||
      deleteConfirmationInput !== 'DELETE SETUP'
    ) {
      this.setState({
        errorMessages: {
          ...errorMessages,
          deleteConfirmationInput: 'Please enter DELETE SETUP in uppercase.',
        },
      });
      return;
    }

    this.setState({ isDeletingSSO: true });

    try {
      const response = await api.deleteSsoSetup();
      const status = _.get(response.responsePayload, 'status') || '';

      if (status === 'success') {
        this.setState({
          isSsoEnabled: false,
          showDeleteSetupConfirmationModal: false,
          issuerURI: '',
          idpURL: '',
          idpCertificate: '',
          configureSSO: false,
          isSSOSetupDeleted: true,
          initialSSOFieldsData: {},
        });
        showToast({
          title: 'Single Sign-on setup deleted successfully',
          success: true,
          duration: 3000,
        });
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'Unable to delete SSO setup. Please try again later.';
      showToast({
        title: error,
        error: true,
        duration: 3000,
      });
    } finally {
      this.setState({ isDeletingSSO: false });
    }
  };

  handleMfaChange = async () => {
    const { user } = this.state;
    const { appActions, config } = this.props;
    const mfaSetup = _.get(user, 'mfaSetup') || false;
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.org_wide_mfa_click, {
      'work email': user.email || '',
      role: user.role || '',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    if (!mfaSetup) {
      appActions.showLoaderOverlay();
      try {
        const response = await api.setupMFAFlow({
          scope: 'all',
        });
        const mfaConfig = _.get(response.responsePayload, 'data');
        this.setState({ mfaConfig, mfaFlowType: MFA_FLOW_TYPES.setup });
      } catch (e) {
        const error =
          _.get(e.responsePayload, 'message') ||
          'An error occurred while fetching MFA setup details';
        showToast({
          title: error,
          error: true,
        });
      } finally {
        appActions.hideLoaderOverlay();
      }
    } else {
      this.setState({ mfaFlowType: MFA_FLOW_TYPES.toggle });
    }
  };

  handleEnableMFASuccess = () => {
    const { appActions, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const user = {
      ...this.state.user,
      orgMfaEnable: true,
      mfaEnable: true,
      mfaSetup: true,
    };

    this.setState({
      mfaFlowType: '',
      isMFAEnabled: true,
      user,
    });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.org_wide_mfa_toggle, {
      'work email': user.email || '',
      role: user.role || '',
      status: 'enabled',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    // Update in redux store
    appActions.setUser({ user });
  };

  handleDisableMFASuccess = () => {
    const { appActions, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const user = {
      ...this.state.user,
      orgMfaEnable: false,
    };

    this.setState({
      mfaFlowType: '',
      isMFAEnabled: false,
      user,
    });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.org_wide_mfa_toggle, {
      'work email': user.email || '',
      role: user.role || '',
      status: 'disabled',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    // Update in redux store
    appActions.setUser({ user });
  };

  handleBackupModalClose = () => {
    const { appActions } = this.props;

    this.setState({
      isMFAEnabled: false,
      user: {
        ...this.state.user,
        orgMfaEnable: true,
      },
    });
    appActions.setToast({
      title: ' MFA has been enabled successfully',
      success: true,
    });
  };

  handleContactSalesClick = async () => {
    const { user } = this.state;
    const { config } = this.props;
    const { canSwitchToOldMode = true } = config;

    this.setState({
      showContactSalesModal: true,
    });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.request_sso_access, {
      'work email': user.email || '',
      role: user.role || '',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      await api.requestSsoSetup();
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'An error occurred while logging SSO request';
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  isEnableSSOButtonDisabled = () => {
    const {
      audienceURI,
      issuerURI,
      idpCertificate,
      idpURL,
      ssoURL,
      isTestingSuccess,
      initialSSOFieldsData,
    } = this.state;

    const updatedSSOFieldsData = {
      audienceURI,
      issuerURI,
      idpCertificate,
      idpURL,
      ssoURL,
    };

    return _.isEqual(updatedSSOFieldsData, initialSSOFieldsData) &&
      isTestingSuccess
      ? false
      : true;
  };

  getContentForEnableSSO = () => {
    const { user } = this.state;

    const isMFAEnabled = user.orgMfaEnable || user.mfaEnable;

    const content = isMFAEnabled
      ? 'Enabling SSO will log all users out and make it mandatory for everyone to sign in using SSO. Also, Multifactor Authentication will be disabled. Do you want to continue?'
      : 'Enabling SSO will log all users out and make it mandatory for everyone to sign in using SSO. Do you want to continue?';

    return content;
  };

  formContent = () => {
    const {
      isMFAEnabled,
      audienceURI,
      ssoURL,
      issuerURI,
      idpURL,
      idpCertificate,
      deleteConfirmationInput,
      errorMessages,
      showContactSalesModal,
      showGoBackModal,
      showEnableSsoConfirmationModal,
      showDisableSsoConfirmationModal,
      showDeleteSetupConfirmationModal,
      canConfigureSSO,
      isSsoEnabled,
      configureSSO,
      isTestingSuccess,
      isEnablingSSO,
      isDisablingSSO,
      isDeletingSSO,
      isTestingSSO,
      isSSOSetupDeleted,
      isFetchingData,
      mfaFlowType,
      user,
      userRole,
    } = this.state;
    const { config } = this.props;
    if (isFetchingData) return null;

    const isTestingDisabled =
      !audienceURI || !ssoURL || !issuerURI || !idpURL || !idpCertificate;

    const isEnableSSOButtonDisabled = this.isEnableSSOButtonDisabled();

    const canUpdateFields = user.role === USER_TYPES.owner ? true : false;
    const { ssoLogin } = user;

    return (
      <div>
        {userRole !== 'owner' ? (
          <Banner
            variant='info'
            color='var(--ds-clr-white)'
            className='justify-content-start'
            hideCloseButton={{ cancelable: true }}
          >
            Only owner has the permission to make changes
          </Banner>
        ) : (
          <></>
        )}

        {isFetchingData ? null : (
          <div className={styles.container}>
            <form className={styles.formFieldContainer}>
              <div className={styles.formFieldContainer_content}>
                <label
                  htmlFor='label'
                  className={styles.formFieldContainer_label}
                >
                  Multi-factor Authentication
                </label>
                <span className={styles.formFieldContainer_mfaSpan}>
                  Enforce multi-factor authentication for all users
                </span>
              </div>

              <ToggleControl
                size='small'
                title='Small Placeholder'
                checked={isMFAEnabled}
                handleStatus={this.handleMfaChange}
                disabled={!canUpdateFields}
              />
            </form>

            {!canConfigureSSO ? (
              <form className={styles.formFieldContainer}>
                <div className={styles.formFieldContainer_content}>
                  <label
                    htmlFor='label'
                    className={styles.formFieldContainer_label}
                  >
                    Single Sign On
                  </label>

                  <span className={styles.formFieldContainer_mfaSpan}>
                    Contact sales to enable Single Sign-on for your organisation
                  </span>
                </div>
                <Tooltip
                  placement='bottom'
                  label='Contact our sales team to enable Single Sign On.'
                >
                  <Button
                    disabled={!canUpdateFields}
                    label='REQUEST ACCESS'
                    content='Contact our sales team to enable Single Sign On'
                    onClick={this.handleContactSalesClick}
                    size='small'
                  >
                    <p>Request Access</p>
                  </Button>
                </Tooltip>
              </form>
            ) : (
              <>
                <form>
                  <div className={styles.formFieldContainer}>
                    <div className={styles.formFieldContainer_content}>
                      <label
                        htmlFor='label'
                        className={styles.formFieldContainer_label}
                      >
                        Single Sign On
                      </label>
                      <span className={styles.formFieldContainer_mfaSpan}>
                        Setting this up will make it mandatory for all users to
                        login through SSO
                      </span>
                    </div>
                    <div className={styles.buttonContainer}>
                      <Button
                        title='configure'
                        disabled={configureSSO || !canUpdateFields}
                        icon={Wrench}
                        variant='outlined'
                        size='small'
                        className={styles.buttonContainer_configureButton}
                        onClick={this.handleConfigureSSOChange}
                      >
                        Configure
                      </Button>
                      <Button
                        title='Delete'
                        icon={Trash}
                        className={
                          !isTestingSuccess ||
                          isSSOSetupDeleted ||
                          !canUpdateFields
                            ? styles.buttonContainer_trashButtonOnDisabled
                            : styles.buttonContainer_trashButton
                        }
                        variant='outlined'
                        size='small'
                        disabled={
                          !isTestingSuccess ||
                          isSSOSetupDeleted ||
                          !canUpdateFields
                        }
                        onClick={() =>
                          this.setState({
                            showDeleteSetupConfirmationModal: true,
                          })
                        }
                      >
                        Delete Setup
                      </Button>
                    </div>
                  </div>
                </form>

                {configureSSO ? (
                  <>
                    <div className={styles.expandedBlock}>
                      <form className={styles.formFieldContainer}>
                        <div className={styles.formFieldContainer_content}>
                          <label
                            htmlFor='audience_uri'
                            className={styles.formFieldContainer_label}
                          >
                            Audience URI (SP Entity ID)
                          </label>
                        </div>
                        <div className='configBgFormContainer'>
                          <div
                            className={
                              styles.configBgFormContainer_configureFormContainer
                            }
                          >
                            <Input
                              name='audienceURI'
                              type='text'
                              placeholder='Placeholderu/1/project/devops-experiment-353911/authentication...'
                              value={audienceURI}
                              readOnly={true}
                              className={styles.inputField_lg}
                              hasError={
                                errorMessages && errorMessages.audienceURI
                              }
                              errorText={'Please enter a valid URL'}
                            />

                            <Button
                              title='Copy'
                              // icon={EditPencil}
                              className={
                                styles.formFieldContainer_copyIconButton
                              }
                              variant='outlined'
                              size='small'
                              onClick={() => this.handleCopy(audienceURI)}
                            >
                              <Copy />
                            </Button>
                          </div>
                        </div>
                      </form>

                      <form className={styles.formFieldContainer}>
                        <div className={styles.formFieldContainer_content}>
                          <label
                            htmlFor='audience_uri'
                            className={styles.formFieldContainer_label}
                          >
                            SP Single Sign-on URL
                          </label>
                        </div>
                        <div className={styles.configBgFormContainer}>
                          <div
                            className={
                              styles.configBgFormContainer_configureFormContainer
                            }
                          >
                            <Input
                              name='ssoURL'
                              type='text'
                              placeholder='Text'
                              className={styles.inputField_lg}
                              value={ssoURL}
                              readOnly={true}
                              hasError={errorMessages && errorMessages.ssoURL}
                              errorText={' Please enter a valid URL'}
                            />

                            <Button
                              title='Copy'
                              className={
                                styles.formFieldContainer_copyIconButton
                              }
                              variant='outlined'
                              size='small'
                              onClick={() => this.handleCopy(ssoURL)}
                            >
                              <Copy />
                            </Button>
                          </div>
                        </div>
                      </form>
                      <form className={styles.formFieldContainer}>
                        <div className={styles.formFieldContainer_content}>
                          <label
                            htmlFor='audience_uri'
                            className={styles.formFieldContainer_label}
                          >
                            Issuer URI (IdP Entity ID)
                          </label>
                        </div>
                        <div
                          className={
                            styles.formFieldContainer_lgFieldsContainer
                          }
                        >
                          <Input
                            type='text'
                            name='issuerURI'
                            value={issuerURI}
                            className={
                              styles.formFieldContainer_inputFieldLgExpandWidth
                            }
                            placeholder='Enter your IdP Entity ID'
                            onChange={this.handleChange}
                            hasError={errorMessages && errorMessages.issuerURI}
                            errorText={errorMessages?.issuerURI}
                          />
                        </div>
                      </form>
                      <form className={styles.formFieldContainer}>
                        <div className={styles.formFieldContainer_content}>
                          <label
                            htmlFor='IdPLoginURL'
                            className={styles.formFieldContainer_label}
                          >
                            IdP Login URL
                          </label>
                        </div>

                        <div
                          className={
                            styles.formFieldContainer_lgFieldsContainer
                          }
                        >
                          <Input
                            type='text'
                            name='idpURL'
                            value={idpURL}
                            className={
                              styles.formFieldContainer_inputFieldLgExpandWidth
                            }
                            placeholder='Enter your Login URL'
                            onChange={this.handleChange}
                            hasError={errorMessages && errorMessages.idpURL}
                            errorText={errorMessages?.idpURL}
                          />
                        </div>
                      </form>

                      <form className={styles.formFieldContainer}>
                        <div className={styles.formFieldContainer_content}>
                          <label
                            htmlFor='IdpCertificate'
                            className={styles.formFieldContainer_label}
                          >
                            IdP Public Certificate
                          </label>
                          <span className={styles.formFieldContainer_mfaSpan}>
                            Must start with "-----BEGIN CERTIFICATE-----", and
                            end with "-----END CERTIFICATE-----".
                          </span>
                        </div>
                        <div
                          className={
                            styles.formFieldContainer_lgFieldsContainer
                          }
                        >
                          <Textarea
                            type='textarea'
                            name='idpCertificate'
                            value={idpCertificate}
                            className={
                              styles.formFieldContainer_inputFieldLgTextArea
                            }
                            placeholder='Paste your IdP login certificate'
                            onChange={this.handleChange}
                            hasError={
                              errorMessages && errorMessages.idpCertificate
                            }
                            errorText={errorMessages?.idpCertificate}
                          />
                        </div>
                      </form>
                      <form className={styles.formFieldContainer}>
                        <div className={styles.formFieldContainer_content}>
                          <label
                            htmlFor='TestSSOsetup'
                            className={styles.formFieldContainer_label}
                          >
                            Test your Single Sign-on setup
                          </label>
                          <span className={styles.formFieldContainer_mfaSpan}>
                            You can complete your Single Sign-on setup after
                            successfully logging in
                          </span>
                        </div>
                        <div className={styles.configureFormContainer}>
                          <Button
                            title='Test'
                            className={styles.formFieldContainer_copyIconButton}
                            variant='outlined'
                            size='small'
                            disabled={isTestingDisabled}
                            isLoading={isTestingSSO}
                            onClick={this.handleTest}
                          >
                            Test
                          </Button>
                        </div>
                      </form>
                      <div
                        className={cx(
                          styles.buttonGroup,
                          styles.buttonGroup_footer
                        )}
                      >
                        {isSsoEnabled ? (
                          <Button
                            disabled={!isTestingSuccess}
                            variant='contained'
                            size='small'
                            className={styles.buttonGroup_ssoButton}
                            onClick={() =>
                              this.setState({
                                showDisableSsoConfirmationModal: true,
                              })
                            }
                          >
                            Disable SSO
                          </Button>
                        ) : (
                          <Button
                            disabled={isEnableSSOButtonDisabled}
                            variant='contained'
                            size='small'
                            className={styles.buttonGroup_ssoButton}
                            onClick={() =>
                              this.setState({
                                showEnableSsoConfirmationModal: true,
                              })
                            }
                          >
                            Enable SSO
                          </Button>
                        )}
                        <Button
                          title='goBack'
                          variant='outlined'
                          size='small'
                          className={styles.buttonGroup_goBackButton}
                          onClick={this.handleGoBackClick}
                        >
                          Go Back
                        </Button>
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </div>
        )}
        {/* Contact sales popup */}
        <HubspotMeetingPopup
          title='Request access SSO'
          isOpen={showContactSalesModal}
          user={user}
          handleClose={() => this.setState({ showContactSalesModal: false })}
          origin={SALES_ORIGIN_KEYS.requestSsoAccess}
        />
        {/* Go Back confirmation popup */}
        {showGoBackModal ? (
          <ConfirmationModal
            title={'Go back'}
            bodyText={
              'Are you sure you want to go back? All unsaved changes will be lost.'
            }
            processIcon={Check}
            cancelIcon={Cancel}
            proceedActionText='Confirm'
            cancelActionText='Cancel'
            onProceedActionBtnClick={this.handleGoBack}
            onCancelActionBtnClick={() =>
              this.setState({ showGoBackModal: false })
            }
            onCloseBtnClick={() => this.setState({ showGoBackModal: false })}
          />
        ) : null}
        {/* Enable SSO confirmation modal */}

        {showEnableSsoConfirmationModal ? (
          <ConfirmationModal
            title={'Enable SSO'}
            processIcon={Check}
            cancelIcon={Cancel}
            proceedActionText='Enable SSO'
            cancelActionText='Cancel'
            onProceedActionBtnClick={this.handleEnableSSO}
            onCancelActionBtnClick={() =>
              this.setState({
                showEnableSsoConfirmationModal: false,
              })
            }
            onCloseBtnClick={() =>
              this.setState({ showEnableSsoConfirmationModal: false })
            }
            processingBtn={isEnablingSSO}
          />
        ) : null}
        {/* Disable SSO confirmation modal */}
        {showDisableSsoConfirmationModal ? (
          <ConfirmationModal
            title={'Disable SSO'}
            processIcon={Check}
            cancelIcon={Cancel}
            proceedActionText='Disable SSO'
            bodyText={
              'All the users will be required to login with email and password after disabling SSO. Do you want to continue?'
            }
            cancelActionText='Cancel'
            onProceedActionBtnClick={this.handleDisableSSO}
            onCancelActionBtnClick={() =>
              this.setState({
                showDisableSsoConfirmationModal: false,
              })
            }
            onCloseBtnClick={() =>
              this.setState({ showDisableSsoConfirmationModal: false })
            }
            processingBtn={isDisablingSSO}
          />
        ) : null}
        {/* Delete Setup confirmation modal */}
        {showDeleteSetupConfirmationModal ? (
          <ConfirmationModal
            title='Delete setup'
            bodyText={
              <>
                <p>
                  All data associated with this connection will be deleted.
                  Users will no longer be able to authenticate using this
                  connection.
                </p>
                <div className={styles.modalInputGroup}>
                  <p className={styles.modalInputGroup_deleteLabel}>
                    Type “DELETE SETUP” to confirm.
                  </p>
                  <Input
                    type='input'
                    name='deleteConfirmationInput'
                    value={deleteConfirmationInput}
                    placeholder='Type here'
                    className={styles.modalInputGroup_inputlabel}
                    onChange={this.handleChange}
                    hasError={
                      errorMessages && errorMessages.deleteConfirmationInput
                    }
                    errorText={'Invalid Text'}
                  />
                </div>
              </>
            }
            processIcon={Trash}
            cancelIcon={Cancel}
            cancelActionText='Cancel'
            proceedActionText='Delete'
            onCancelActionBtnClick={() =>
              this.setState({
                showDeleteSetupConfirmationModal: false,
              })
            }
            onProceedActionBtnClick={this.handleDeleteSetup}
            onCloseBtnClick={() =>
              this.setState({ showDeleteSetupConfirmationModal: false })
            }
            processingBtn={isDeletingSSO}
          />
        ) : null}
        {/* MFA reset flow */}
        {mfaFlowType === MFA_FLOW_TYPES.setup && (
          <SetupMFAFlow
            scope='all'
            user={user}
            config={config}
            mfaData={this.state.mfaConfig}
            onEnableSuccess={this.handleEnableMFASuccess}
            onExit={() => this.setState({ mfaFlowType: '' })}
          />
        )}
        {/* MFA toggle flow */}
        {mfaFlowType === MFA_FLOW_TYPES.toggle && (
          <ToggleMFAFlow
            scope='all'
            user={user}
            config={config}
            isMFAEnabled={isMFAEnabled}
            onExit={() => this.setState({ mfaFlowType: '' })}
            onEnableSuccess={this.handleEnableMFASuccess}
            onDisableSuccess={this.handleDisableMFASuccess}
          />
        )}
      </div>
    );
  };

  renderSkeletonLoader = () => {
    return <SkeletonLoader />;
  };

  render() {
    const { isFetchingData } = this.state;
    return (
      <Fragment>
        <div className={styles.title}> Security </div>
        <div className={styles.fullPageScroll}>
          {isFetchingData ? this.renderSkeletonLoader() : this.formContent()}
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
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(SecuritySettings);
