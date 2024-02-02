import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { showToast } from 'new/redux/helpers';
import { actions as requestActions } from 'new/redux/requests/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import copy from 'clipboard-copy';
import { Copy, Edit, EyeClose, EyeEmpty } from 'iconoir-react';
import _, { capitalize } from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import {
  PageMetadata,
  /* PageFooter, */
} from 'new/components/layout/page';
import ConfirmationModal from 'new/components/shared/FiledConfirmationModal';
import { ErrorText } from 'new/components/widgets/typography';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { getMemberPermissions } from 'new/helpers/permissions';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Banner from 'new/ui-elements/Banner/Banner';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import ToggleControl from 'new/ui-elements/ToggleControl/ToggleControl';

import Dropdown from './components/Dropdown/Dropdown';
import SkeletonLoader from './components/SkeletonLoader/SkeletonLoader';
const integrationLabels = { apiKey: 'Api Key', webhookUrl: 'Webhook URL' };

import { USER_TYPES } from 'new/constants';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './index.scss';
//import data from './data.json';
class Integration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetchingData: false,
      user: null,
      config: null,
      isUpdatingApiKey: false,
      allowEditFields: true,
      webhookSelectedDocList: [],
      webhookSelectedUserDocList: [],
      emailSelectedUserDocList: [],
      emailSelectedDocList: [],
      showUser: true,
      apiKey: '',
    };
  }
  webhookUrlInputRef = React.createRef();

  async componentDidMount() {
    const { showUser } = this.state;
    if (showUser) {
      const data = await api.getNotificationPreference();
      const notificationData = data.responsePayload.data;
      this.updateData(notificationData);
    }
    this.fetchApiKey();
  }

  async UNSAFE_componentWillMount() {
    this.fetchData();
    const { user, config } = this.props;
    //const { webhook, email } = data;
    const permissions = getMemberPermissions() || {};
    this.setState({
      ...permissions,
      user,
      config,
    });
  }

  updateData = (data) => {
    const { webhook, email } = data;
    const { options: webhookDocOptions } = (webhook && webhook[0]) || {};
    const { options: webhookUserOptions } = (webhook && webhook[1]) || {};
    const { options: webhookMiscellaneousOptions } =
      (webhook && webhook[2]) || {};
    const { options: emailDocOptions } = email && email[0];
    const { options: emailUserOptions } = webhook && email[1];
    if (
      webhookDocOptions &&
      webhookDocOptions.length === 1 &&
      webhookDocOptions[0] &&
      webhookDocOptions[0].dropdown === true
    ) {
      let webhookSelectedDocList = webhookDocOptions[0].options.map((item) => {
        if (item.value === true) {
          return item.id;
        } else {
          return '';
        }
      });

      webhookSelectedDocList = webhookSelectedDocList.filter(
        (item) => item !== ''
      );
      this.setState({
        webhookSelectedDocList,
        webhookDocStatusTypeList: webhookDocOptions[0]?.options,
      });
    }
    if (webhookUserOptions) {
      let webhookSelectedUserDocList = webhookUserOptions.map(
        ({ options = [], id = '' }) => (options[0].value ? id : '')
      );

      webhookSelectedUserDocList = webhookSelectedUserDocList.filter(
        (item) => item !== ''
      );
      this.setState({
        webhookSelectedUserDocList,
        webhookUserStatusTypeList: webhookUserOptions,
      });
    }
    if (webhookMiscellaneousOptions) {
      let webhookSelectedMiscellaneousList = webhookMiscellaneousOptions.map(
        ({ options = [], id = '' }) => (options[0].value ? id : '')
      );
      webhookSelectedMiscellaneousList =
        webhookSelectedMiscellaneousList.filter((item) => item !== '');
      this.setState({
        webhookSelectedMiscellaneousList,
        webhookMiscellaneousList: webhookMiscellaneousOptions,
      });
    }
    if (
      emailDocOptions &&
      emailDocOptions.length === 1 &&
      emailDocOptions[0] &&
      emailDocOptions[0].dropdown === true
    ) {
      let emailSelectedDocList = emailDocOptions[0].options.map((item) => {
        if (item.value === true) {
          return item.id;
        } else {
          return '';
        }
      });

      emailSelectedDocList = emailSelectedDocList.filter((item) => item !== '');
      this.setState({
        emailSelectedDocList,
        emailDocStatusTypeList: emailDocOptions[0].options,
      });
    }
    if (emailUserOptions) {
      let emailSelectedUserDocList = emailUserOptions.map((item) => {
        for (let i = 0; i < item.options.length; i++) {
          if (item.options[0].value === true) {
            return item.id;
          } else {
            return '';
          }
        }
      });
      emailSelectedUserDocList = emailSelectedUserDocList.filter(
        (item) => item !== ''
      );
      this.setState({
        emailSelectedUserDocList,
        emailUserStatusTypeList: emailUserOptions,
      });
    }
  };

  handleWebhookDocSelectionList = async ({ target }) => {
    const { checked: optionChecked, value } = target;
    const { webhookSelectedDocList = [] } = this.state;
    const { appActions, user, config } = this.props;
    const included = webhookSelectedDocList.includes(value);
    let payload = {
      event: 'doc_status_change',
      id: value,
      value: optionChecked,
      trigger: 'webhook',
    };
    try {
      await api.updateNotificationPreference({ payload });
      if (optionChecked && !included) {
        this.setState({
          webhookSelectedDocList: [...webhookSelectedDocList, value],
        });
      } else if (!optionChecked && included) {
        const result = webhookSelectedDocList.filter((e) => e !== value);
        this.setState({
          webhookSelectedDocList: [...result],
        });
      }

      const { canSwitchToOldMode = true } = config;
      mixpanel.track(MIXPANEL_EVENTS.webhook_notification_update, {
        'work email': user.email,
        'organization ID': user.orgId,
        type: 'document',
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      appActions.setToast({
        title: 'Failed to update trigger',
        error: true,
      });
    }
  };
  handleWebhookUserDocSelectionList = async ({ target }) => {
    const { checked: optionChecked, value } = target;
    const { webhookSelectedUserDocList = [] } = this.state;
    const { appActions, user, config } = this.props;
    const included = webhookSelectedUserDocList.includes(value);
    let payload = {
      event: value,
      id: 'all',
      value: optionChecked,
      trigger: 'webhook',
    };
    try {
      await api.updateNotificationPreference({ payload });
      if (optionChecked && !included) {
        this.setState({
          webhookSelectedUserDocList: [...webhookSelectedUserDocList, value],
        });
      } else if (!optionChecked && included) {
        const result = webhookSelectedUserDocList.filter((e) => e !== value);
        this.setState({
          webhookSelectedUserDocList: result,
        });
      }

      const { canSwitchToOldMode = true } = config;
      mixpanel.track(MIXPANEL_EVENTS.webhook_notification_update, {
        'work email': user.email,
        'organization ID': user.orgId,
        type: 'user',
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      appActions.setToast({
        title: 'Failed to update trigger',
        error: true,
      });
    }
  };
  handleWebhookMiscellaneousSelectionList = async ({ target }) => {
    const { checked: optionChecked, value } = target;
    const { webhookSelectedMiscellaneousList = [] } = this.state;
    const { appActions, user, config } = this.props;
    const included = webhookSelectedMiscellaneousList.includes(value);
    let payload = {
      event: value,
      id: 'all',
      value: optionChecked,
      trigger: 'webhook',
    };
    try {
      await api.updateNotificationPreference({ payload });
      if (optionChecked && !included) {
        this.setState({
          webhookSelectedMiscellaneousList: [
            ...webhookSelectedMiscellaneousList,
            value,
          ],
        });
      } else if (!optionChecked && included) {
        const result = webhookSelectedMiscellaneousList.filter(
          (e) => e !== value
        );
        this.setState({
          webhookSelectedMiscellaneousList: result,
        });
      }

      const { canSwitchToOldMode = true } = config;
      mixpanel.track(MIXPANEL_EVENTS.webhook_notification_update, {
        'work email': user.email,
        'organization ID': user.orgId,
        type: 'others',
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      appActions.setToast({
        title: 'Failed to update trigger',
        error: true,
      });
    }
  };
  handleEmailDocSelectionList = async ({ checked: optionChecked, value }) => {
    const { emailSelectedDocList = [] } = this.state;
    const { appActions } = this.props;
    const included = emailSelectedDocList.includes(value);
    let payload = {
      event: 'doc_status_change',
      id: value,
      value: optionChecked,
      trigger: 'email',
    };
    try {
      await api.updateNotificationPreference({ payload });
      if (optionChecked && !included) {
        this.setState({
          emailSelectedDocList: [...emailSelectedDocList, value],
        });
      } else if (!optionChecked && included) {
        const result = emailSelectedDocList.filter((e) => e !== value);
        this.setState({
          emailSelectedDocList: [...result],
        });
      }
      // const notificationData = response.responsePayload.data;
      // this.updateData(notificationData);
    } catch (e) {
      appActions.setToast({
        title: 'Failed to update trigger',
        error: true,
      });
    }
  };
  handleEmailUserDocSelectionList = async ({
    checked: optionChecked,
    value,
  }) => {
    const { emailSelectedUserDocList = [] } = this.state;
    const { appActions } = this.props;
    const included = emailSelectedUserDocList.includes(value);
    let payload = {
      event: value,
      id: 'all',
      value: optionChecked,
      trigger: 'email',
    };
    try {
      await api.updateNotificationPreference({ payload });
      if (optionChecked && !included) {
        this.setState({
          emailSelectedUserDocList: [...emailSelectedUserDocList, value],
        });
      } else if (!optionChecked && included) {
        const result = emailSelectedUserDocList.filter((e) => e !== value);
        this.setState({
          emailSelectedUserDocList: [...result],
        });
      }
    } catch (e) {
      appActions.setToast({
        title: 'Failed to update trigger',
        error: true,
      });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const { isEditingWebhookUrl } = this.state;

    const { isEditingWebhookUrl: prevIsEditingWebhookUrl } = prevState;

    if (
      isEditingWebhookUrl &&
      isEditingWebhookUrl !== prevIsEditingWebhookUrl
    ) {
      // Focus webhook url input
      if (this.webhookUrlInputRef && this.webhookUrlInputRef.current) {
        this.webhookUrlInputRef.current.focus();
      }
    }
  }

  componentWillUnmount() {}

  fetchData = async () => {
    this.setState({
      isFetchingData: true,
    });

    const requestName = 'INTEGRATION';

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
      this.setState({
        isFetchingData: false,
        user,
        config,
      });
    } catch (e) {
      this.setState({
        isFetchingData: false,
      });
    } finally {
      this.props.requestActions.removeRequest({
        name: requestName,
      });
    }
  };

  fetchApiKey = async () => {
    const { appActions, user, config } = this.props;

    this.setState({ isUpdatingApiKey: true });

    try {
      const response = await api.viewUserDocsumoApiKey();
      const apiKey = _.get(response.responsePayload, 'data.docsumoApiKey');
      this.setState({
        isUpdatingApiKey: false,
        apiKey,
      });

      const { canSwitchToOldMode = true } = config;
      mixpanel.track(MIXPANEL_EVENTS.view_api_key, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      // No need to handle
    } finally {
      this.setState({
        isUpdatingApiKey: false,
      });
    }
  };

  handleToggleApiView = (e) => {
    e.preventDefault();
    this.setState((prev) => ({ showApiKey: !prev.showApiKey }));
  };

  handleRefreshClick = (e) => {
    e.preventDefault();
    this.setState({
      checkConfirm: true,
    });
  };
  checkBtn = (checkConfirm = false) => {
    this.setState({ checkConfirm });
  };

  handleApiKeyRefreshButtonClick = async (e) => {
    e.preventDefault();

    const { isRefreshingApiKey } = this.state;
    const { appActions, user, config } = this.props;

    if (isRefreshingApiKey) {
      // Another request is already in progress
      return;
    }

    this.setState({
      isRefreshingApiKey: true,
    });

    try {
      const response = await api.refreshUserDocsumoApiKey();
      const apiKey = _.get(response.responsePayload, 'data.docsumoApiKey');
      this.setState({
        isRefreshingApiKey: false,

        apiKey,
      });

      const { canSwitchToOldMode = true } = config;
      mixpanel.track(MIXPANEL_EVENTS.refresh_api_key, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      if (
        e.responsePayload?.statusCode === 403 &&
        e.responsePayload?.error === 'UNAUTHORIZED_ACCESS'
      ) {
        appActions.setToast({
          title:
            e.responsePayload?.message ||
            'User with member role cannot view API Key',
          error: true,
        });
      }
      this.setState({
        isRefreshingApiKey: false,
      });
    } finally {
      this.checkBtn();
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
    const { user, config } = this.props;

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
      this.setState({
        config: {
          ...this.state.config,
          webhookUrl,
        },
        isEditingWebhookUrl: false,
        isUpdatingWebhookUrl: false,
      });

      const { canSwitchToOldMode = true } = config;
      mixpanel.track(MIXPANEL_EVENTS.edit_webhook_url, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') || 'Failed to update Webhook URL';
      this.setState({
        isUpdatingWebhookUrl: false,
        uiWebhookUrlError: error,
      });
    }
  };

  handleToggle = async () => {
    const { config } = this.state;
    const { sendTokenInReviewUrl } = config;
    const {
      appActions,
      user,
      config: { canSwitchToOldMode = true },
    } = this.props;
    let enableToggle = !sendTokenInReviewUrl;
    const payload = {
      send_token_in_review_url: enableToggle,
    };

    try {
      await api.sendTokenOnReviewUrl({ payload });

      mixpanel.track(MIXPANEL_EVENTS.send_token, {
        enableToggle,
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      const error =
        e?.responsePayload?.message || 'Failed to enable token review url';
      appActions.setToast({
        title: error,
        error: true,
      });
      enableToggle = false;
    } finally {
      this.setState(({ config }) => ({
        config: { ...config, sendTokenInReviewUrl: enableToggle },
      }));
    }
  };

  handleCopyToClipboard = ({ typeText = 'Text', text }) => {
    copy(text);
    showToast({
      title: `${capitalize(typeText)} copied to clipboard`,
      success: true,
    });
  };

  formContent = () => {
    const {
      config,
      isUpdatingApiKey,
      isEditingWebhookUrl,
      isUpdatingWebhookUrl,
      isFetchingWebhook,
      uiWebhookUrlValue,
      uiAuthParamValue,
      uiBasicAuthValue,
      uiKeyValue,
      uiValueValue,
      uiWebhookUrlError,
      allowEditFields,
      checkConfirm,
      isRefreshingApiKey,
      webhookSelectedDocList,
      webhookSelectedUserDocList,
      //emailSelectedDocList,
      //emailSelectedUserDocList,
      webhookDocStatusTypeList,
      webhookUserStatusTypeList,
      //emailUserStatusTypeList,
      //emailDocStatusTypeList,
      webhookMiscellaneousList,
      webhookSelectedMiscellaneousList,
      showUser,
      showApiKey,
      apiKey,
    } = this.state;
    const { user } = this.props;

    const { sendTokenInReviewUrl } = config;

    return (
      <>
        <div className={styles.root}>
          <Banner variant='info' className={styles.banner}>
            API Key and WebHook URL is different for test and production mode
          </Banner>
          <form className={styles.formField}>
            <div className={styles.formField_labelWrapper}>
              <label htmlFor='email' className={styles.formField_label}>
                {user.mode === 'prod' ? '' : 'Test'}&nbsp;API Key
              </label>
              <div
                className={cx(
                  styles.formField_value,
                  styles.formField_apiKeyValue
                )}
              >
                <Input
                  value={showApiKey ? apiKey : '*'.repeat(60)}
                  disabled={true}
                  className={styles.formField_input}
                />
                <p className={styles.formField_hintText}>
                  <a
                    href={SUPPORT_LINK.API_DOC_LINK}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    API documentation
                  </a>
                </p>
              </div>
              <div className={styles.labelBtnGroup}>
                <Tooltip
                  label={'Click to Copy API Key'}
                  showTooltip={user.role !== USER_TYPES.member}
                >
                  <IconButton
                    variant={'outlined'}
                    icon={<Copy />}
                    disabled={!apiKey.length}
                    // onClick={this.handleCopyApiKey}
                    onClick={() =>
                      this.handleCopyToClipboard({
                        typeText: integrationLabels.apiKey,
                        text: apiKey,
                      })
                    }
                    size={'small'}
                  />
                </Tooltip>

                <Tooltip
                  label={
                    showApiKey
                      ? 'Click to  hide API Key'
                      : 'Click to  view API Key'
                  }
                  showTooltip={user.role !== USER_TYPES.member}
                >
                  <IconButton
                    variant={'outlined'}
                    icon={showApiKey ? <EyeClose /> : <EyeEmpty />}
                    isLoading={isUpdatingApiKey}
                    size={'small'}
                    disabled={!apiKey.length}
                    onClick={(e) => this.handleToggleApiView(e)}
                  />
                </Tooltip>
              </div>
            </div>
            <div className={styles.buttonWrapper}>
              <Button
                variant={'outlined'}
                onClick={(e) => this.handleRefreshClick(e)}
                size={'small'}
              >
                Regenerate
              </Button>
            </div>
          </form>

          <form
            className={styles.formField}
            onSubmit={this.handleWebhookFormSubmit}
          >
            <div className={styles.formField_labelWrapper}>
              <label
                htmlFor='settings-input-webhook-url'
                className={styles.formField_label}
              >
                {user.mode === 'prod' ? '' : 'Test'}&nbsp;Webhook URL
              </label>
              <div className={styles.formField_value}>
                {isEditingWebhookUrl ? (
                  <>
                    <input
                      ref={this.webhookUrlInputRef}
                      id='settings-input-webhook-url'
                      type='text'
                      name='webhook-url'
                      placeholder={'Enter URL'}
                      value={uiWebhookUrlValue}
                      className={styles.formField_input}
                      disabled={isUpdatingWebhookUrl}
                      onChange={this.handleWebhookUrlInputChange}
                    />
                    <p className={styles.formField_hintText}>
                      JSON of data extracted after document is reviewed (i.e
                      click add to processed on review screen) will be sent as
                      POST request to above URL.
                    </p>
                    <p className={styles.formField_webhookUrl}>
                      Authentication Parameter
                    </p>
                    <input
                      id='settings-input-webhook-url'
                      type='text'
                      placeholder={'Enter Text'}
                      name='auth-param'
                      value={uiAuthParamValue}
                      className={styles.formField_input}
                      disabled={isUpdatingWebhookUrl}
                      onChange={this.handleAuthParamInputChange}
                    />
                    <p className={styles.formField_hintText}>
                      Add parameters for identification and security check.
                    </p>
                    <p className={styles.formField_webhookUrl}>Basic Auth</p>
                    <input
                      id='settings-input-webhook-url'
                      type='text'
                      placeholder={'Enter Text'}
                      name='basic-auth'
                      value={uiBasicAuthValue}
                      className={styles.formField_input}
                      disabled={isUpdatingWebhookUrl}
                      onChange={this.handleBasicAuthInputChange}
                    />
                    <p className={styles.formField_hintText}>
                      Add basic authetication to use the resources.
                    </p>
                    <p className={styles.formField_webhookUrl}>Header</p>
                    <div className={styles.formField_multiinput}>
                      <input
                        id='settings-input-webhook-url'
                        type='text'
                        placeholder={'Enter Text'}
                        name='key'
                        value={uiKeyValue}
                        className={cx(
                          styles.formField_input,
                          styles.formField_input__smallInput
                        )}
                        disabled={isUpdatingWebhookUrl}
                        onChange={this.handleKeyInputChange}
                      />
                      <input
                        id='settings-input-webhook-url'
                        type='text'
                        placeholder={'Enter Text'}
                        name='value'
                        value={uiValueValue}
                        className={cx(
                          styles.formField_input,
                          styles.formField_input__largeInput
                        )}
                        disabled={isUpdatingWebhookUrl}
                        onChange={this.handleValueInputChange}
                      />
                    </div>
                    <p className={styles.formField_hintText}>
                      Add key value pair in header for communication between
                      client and server.
                    </p>
                  </>
                ) : (
                  <>
                    <input
                      type='text'
                      name='webhook-url'
                      value={config.webhookUrl || ''}
                      readOnly
                      disabled
                      className={styles.formField_input}
                    />
                    <p className={styles.formField_hintText}>
                      JSON of data extracted after document is reviewed (i.e
                      click add to processed on review screen) will be sent as
                      POST request to above URL.
                    </p>
                  </>
                )}

                {isEditingWebhookUrl && uiWebhookUrlError ? (
                  <ErrorText className={styles.formField_errorAbs}>
                    {uiWebhookUrlError}
                  </ErrorText>
                ) : null}
              </div>
              <div className={styles.labelBtnGroup}>
                <Tooltip label={'Click to Copy Webhook Url'}>
                  <IconButton
                    variant={'outlined'}
                    icon={<Copy />}
                    disabled={isUpdatingWebhookUrl}
                    onClick={() =>
                      this.handleCopyToClipboard({
                        typeText: integrationLabels.webhookUrl,
                        text: config.webhookUrl,
                      })
                    }
                    size={'small'}
                  />
                </Tooltip>
              </div>
            </div>
            {allowEditFields ? (
              <div className={styles.buttonWrapper}>
                {isEditingWebhookUrl ? (
                  <Button
                    isLoading={isUpdatingWebhookUrl}
                    variant={'contained'}
                    style={{ marginRight: '0px' }}
                    onClick={this.handleWebhookFormSubmit}
                    size={'small'}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    isLoading={isFetchingWebhook}
                    icon={Edit}
                    variant={'outlined'}
                    onClick={this.handleWebhookUrlEditButtonClick}
                    size={'small'}
                  >
                    Edit
                  </Button>
                )}
              </div>
            ) : (
              ''
            )}
          </form>
        </div>

        {showUser ? (
          <div className={styles.notification}>
            <div className={styles.notification_header}>
              <p className={styles.notification_title}>Webhook Notifications</p>
            </div>
            <div className={styles.notification_section}>
              <div className={styles.notification_left}>
                <div className={styles.status}>Document Status Change</div>
                <div className={styles.helpText}>
                  Triggered when document status is changed.
                </div>
              </div>

              <div className={styles.notification_statusSelection}>
                <Dropdown
                  option={webhookDocStatusTypeList || []}
                  type={'webhookDocStatus'}
                  selectedList={webhookSelectedDocList}
                  handleSelectionList={this.handleWebhookDocSelectionList}
                />
              </div>
            </div>
            <div className={styles.notification_section}>
              <div className={styles.notification_left}>
                <div className={styles.status}>User Status Change</div>
                <div className={styles.helpText}>
                  Triggered when user status is changed.
                </div>
              </div>
              <div className={styles.notification_statusSelection}>
                <Dropdown
                  option={webhookUserStatusTypeList || []}
                  type={'webhookUserStatus'}
                  selectedList={webhookSelectedUserDocList}
                  handleSelectionList={this.handleWebhookUserDocSelectionList}
                />
              </div>
            </div>
            <div className={styles.notification_section}>
              <div className={styles.notification_left}>
                <div className={styles.status}>Other Miscellaneous Status</div>
                <div className={styles.helpText}>
                  Triggered when miscellaneous event occurs.
                </div>
              </div>
              <div className={styles.notification_statusSelection}>
                <Dropdown
                  option={webhookMiscellaneousList || []}
                  type={'webhookMiscellaneousStatus'}
                  selectedList={webhookSelectedMiscellaneousList}
                  handleSelectionList={
                    this.handleWebhookMiscellaneousSelectionList
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        <div className={styles.notification}>
          <div className={styles.notification_header}>
            <p className={styles.notification_title}>
              Additional Webhook Settings
            </p>
          </div>
          <div className={styles.notification_section}>
            <div className={styles.notification_left}>
              <div className={styles.status}>Send token in Review URL</div>
              <div className={styles.helpText}>
                Enabling this will allow users to access the data from review
                URL without being logged into the account.
              </div>
            </div>
            <div>
              <ToggleControl
                size='small'
                checked={sendTokenInReviewUrl}
                handleStatus={this.handleToggle}
              />
            </div>
          </div>
        </div>
        {checkConfirm ? (
          <ConfirmationModal
            title={'Refresh API key'}
            bodyText={'Are you sure you want to refresh the API key?'}
            proceedActionText='Refresh'
            cancelActionText='Cancel'
            onProceedActionBtnClick={this.handleApiKeyRefreshButtonClick}
            onCancelActionBtnClick={() => this.checkBtn(false)}
            onCloseBtnClick={() => this.checkBtn(false)}
            processingBtn={isRefreshingApiKey}
          />
        ) : (
          ''
        )}
      </>
    );
  };

  renderSkeletonLoader = () => {
    return <SkeletonLoader />;
  };

  render() {
    const { isFetchingData } = this.state;

    return (
      <Fragment>
        <PageMetadata title='Integrations' />
        <div className={styles.title}> Integrations </div>
        <div className={styles.fullPageScroll}>
          {isFetchingData ? this.renderSkeletonLoader() : this.formContent()}
        </div>
      </Fragment>
    );
  }
}
function mapStateToProp(state) {
  const { user, config, onboardingTutorialOrigin } = state.app;
  return {
    user,
    config,
    onboardingTutorialOrigin,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    requestActions: bindActionCreators(requestActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(Integration)
);
