/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  // actionTypes as documentActionTypes,
  actions as gloableActions,
} from 'new/redux/app/actions';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import * as reduxHelpers from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  ArrowRight,
  BookStack,
  Flask,
  HelpCircle,
  InfoEmpty,
  LogOut,
  Megaphone,
  NavArrowDown,
  NavArrowUp,
  Notes,
  OpenNewWindow,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { SALES_ORIGIN_KEYS } from 'new/components/contexts/trackingConstants';
import CreditUtilizationModal from 'new/components/modals/CreditUtilizationModal';
import HubspotMeetingPopup from 'new/components/modals/hubspot';
import { SpinningLoaderIcon } from 'new/components/widgets/progress';
import { ACCOUNT_TYPES, USER_TYPES } from 'new/constants';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import routes from 'new/constants/routes';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Snackbar from 'new/ui-elements/Snackbar/Snackbar';
import ToggleControl from 'new/ui-elements/ToggleControl/ToggleControl';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';

import CreditUtilizationTooltip from './CreditUtilizationTooltip';
import ProgressBar from './ProgressBar';
import SearchBox from './SearchBox';

import styles from './index.scss';
class Header extends Component {
  state = {
    isAttemptingLogout: false,
    showSnackbar: false,
    isChanging: false,
    showContactSalesPopup: false,
  };
  isMounted = false;

  componentDidMount() {
    this.isMounted = true;
    const { user, accountType } = this.props;

    if (user?.mode === 'test') {
      this.setState({
        showSnackbar: true,
      });
    }
    const redirectFromEmail =
      localStorage.getItem('redirectFromEmail') || false;

    if (redirectFromEmail === 'lowCreditWarning') {
      const isUserAdminOwner =
        user?.role === USER_TYPES.admin || user?.role === USER_TYPES.owner;
      if (accountType === ACCOUNT_TYPES.FREE) {
        this.handleContactSalesPopupOpen();
      } else if (isUserAdminOwner) {
        this.toggleShowCreditUtilizationModal();
      } else {
        this.handleCreditRequestSubmit();
      }
      localStorage.removeItem('redirectFromEmail');
    }
  }

  componentDidUpdate(prevProps) {
    const {
      monthly_doc_limit: prevMonthlyDocLimit = '',
      monthly_doc_current: prevMonthlyDocCurrent = '',
    } = prevProps.credits;
    const {
      monthly_doc_limit: currMonthlyDocLimit = '',
      monthly_doc_current: currMonthlyDocCurrent = '',
    } = this.props.credits;
    const currCreditPercentUsed = Math.round(
      (currMonthlyDocCurrent / currMonthlyDocLimit) * 100
    );

    if (prevMonthlyDocCurrent !== currMonthlyDocCurrent) {
      if (currCreditPercentUsed >= 75) {
        this.getAndUpdateCreditUtilTooltipFlags();
      }
    }
  }

  getAndUpdateCreditUtilTooltipFlags = async () => {
    const { appActions } = this.props;
    try {
      const configResponse = await api.getConfig();

      const { flags } = _.get(configResponse.responsePayload, 'data');
      appActions.updateConfig({
        updates: {
          flags,
        },
      });
    } catch (e) {
      // Do Nothing
    }
  };

  componentWillUnmount() {
    this.isMounted = false;
  }

  handleStatus = async () => {
    const { appActions, history, location, user, canSwitchToOldMode } =
      this.props;

    this.setState({ isChangingMode: true });

    try {
      this.setState({ isChanging: true });

      const mode = user?.mode === 'test' ? 'prod' : 'test';
      let payload = {
        mode,
      };
      await api.switchAccountMode(payload);

      //Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.switch_mode, {
        'work email': user.email,
        'organization ID': user.orgId,
        mode,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });
      window.location.reload();
    } catch (e) {
      appActions.setToast({
        title: e?.responsePayload?.message || 'Something went wrong!',
        error: true,
      });
    }
  };

  handleWatchIntroBtnClick = () => {
    this.props.appActions.showIntroModal();
  };

  handleLogoutBtnClick = async (e) => {
    e.preventDefault();

    if (this.state.isAttemptingLogout) {
      // Another request is already in progress
      return;
    }

    this.setState({
      isAttemptingLogout: true,
    });

    try {
      await api.logoutUser();
      window.location = '/';
    } catch (e) {
      this.isMounted &&
        this.setState({
          isAttemptingLogout: false,
        });
    }
  };

  closeAnalyticsOnNavigation = () => {
    const store = reduxHelpers.getStore();
    const {
      documents: { analyticsDocument },
    } = store.getState();

    if (analyticsDocument) {
      reduxHelpers.closeAnalytics(analyticsDocument);
    }
  };

  navigateToActivityLogs = () => {
    const {
      user,
      canSwitchToOldMode,
      history,
      history: {
        location: { pathname },
      },
    } = this.props;

    const originType = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );

    mixpanel.track(MIXPANEL_EVENTS.view_all_activity, {
      origin: originType ? originType : '',
      'work email': user.email,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    history.push(routes.ALL_ACTIVITY);
    this.closeAnalyticsOnNavigation();
  };

  handleContactSalesPopupOpen = (origin = 'Contact Sales') => {
    const { user, canSwitchToOldMode = true } = this.props;
    const { meetingTitle } = this.state;

    this.setState({
      showContactSalesPopup: true,
    });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.contact_sales_start, {
      'work email': user.email,
      origin: origin,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleContactSalesPopupClose = () =>
    this.setState({ showContactSalesPopup: false });

  handleHelpToggle = () => {
    const element = document.querySelector(
      '#hubspot-messages-iframe-container.widget-align-right'
    );
    element?.style?.setProperty('display', 'block', 'important');
    window?.HubSpotConversations?.widget?.open();
    this.mixpanelTrack(MIXPANEL_EVENTS.help_section_click);
  };

  toggleShowCreditUtilizationModal = () => {
    const { showCreditUtilizationModal, appActions } = this.props;
    if (showCreditUtilizationModal) {
      appActions.hideCreditUtilizationModal();
    } else {
      appActions.showCreditUtilizationModal();
    }
  };

  handleCreditRequestSubmit = async () => {
    const payload = {
      queryParams: {
        notification_type: 'low_credit',
      },
    };

    try {
      await api.triggerCreditNotification(payload);

      appActions.setToast({
        title: 'Our team will be in touch with you shortly',
        success: true,
      });
      appActions.setLocalConfigFlags({
        showLowCredit85Popup: false,
        showLowCredit75Popup: false,
      });
      appActions.setConfigFlags({
        showLowCredit85Popup: false,
        showLowCredit75Popup: false,
      });
    } catch (e) {
      const errorMsg = e?.responsePayload
        ? e.responsePayload?.message
        : 'An error occurred while requesting for Credits';
      appActions.setToast({
        title: errorMsg,
        error: true,
      });
    } finally {
      // Do Nothing
    }
  };

  mixpanelTrack(evt) {
    const { user, canSwitchToOldMode = true } = this.props;

    mixpanel.track(evt, {
      'work email': user?.email,
      origin: origin,
      version: 'new',
      mode: user?.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  }

  render() {
    const {
      isAttemptingLogout,
      isChangingMode,
      showSnackbar,
      showContactSalesPopup,
      showCreditUtilizationModal,
    } = this.state;
    const {
      user,
      searchable,
      accountType,
      usersList,
      globalDocumentCounts,
      history: {
        location: { pathname },
      },
      canSwitchToOldMode,
      fromGoogleMarketplace,
      credits: { monthly_doc_limit = '', monthly_doc_current = '' },
      showCreditUtilizationTooltip,
    } = this.props;
    const fullName = _.get(user, 'fullName', '');
    const avatarUrl = _.get(user, 'avatarUrls.80');
    const plan = accountType || 'Free Plan';
    const currentUser =
      usersList && usersList.length
        ? usersList.find((item) => item.default)
        : null;
    const showAccountSwitch = ['admin', 'owner'].includes(user?.role);
    const showSearchBox = !(
      (!globalDocumentCounts || !globalDocumentCounts.all) &&
      currentUser &&
      (!currentUser.authorizedDocTypes ||
        !currentUser.authorizedDocTypes.length)
    );

    const handleRequestCreditClick = () => {
      const { appActions } = this.props;
      const {
        user: { role },
        accountType,
      } = this.props;

      const isFreeUser = accountType === ACCOUNT_TYPES.FREE;

      mixpanelTrackingAllEvents(
        MIXPANEL_EVENTS.creditutilization_requestcredits_userdropdown,
        { origin: 'User Dropdown' }
      );

      if (isFreeUser) {
        this.setState({ showContactSalesPopup: true });
      } else {
        appActions.showCreditUtilizationModal();
      }
    };

    const checkTestStatus = () => {
      /**
       * LOGIC:
       * this is to checked the toggle status of the test mode switch
       * we need to check when the mode is test or not and whether in both cases it is changing or not
       * if the mode is test and it is changing then switch will be off else the same test mode i.e. switch will be on
       * if the mode is not test and it is chnaging then the switch will be on else the same non test mode i.e. switch will be off
       */
      return this.props.user?.mode === 'test'
        ? this.state.isChanging
          ? false
          : true
        : this.state.isChanging
        ? true
        : false;
    };
    return (
      <header className={styles.root}>
        <div className={styles.topContainer}>
          <div className={styles.lhs}>
            {showSearchBox && (
              <SearchBox
                searchable={searchable}
                user={user}
                canSwitchToOldMode={canSwitchToOldMode}
              />
            )}
          </div>
          <div className={styles.rhs}>
            {/* {plan === 'Free Plan' && (
              <div>
                <Tooltip label='Contact Sales'>
                  <IconButton
                    variant='text'
                    icon={<HeadsetHelp />}
                    size='small'
                    className='mr-2'
                    onClick={() => this.handleContactSalesPopupOpen()}
                  />
                </Tooltip>
              </div>
            )} */}
            <div>
              {/* eslint-disable-next-line quotes */}
              <Tooltip label={"What's New"}>
                <IconButton
                  onClick={() =>
                    this.mixpanelTrack(MIXPANEL_EVENTS.whatsnew_click)
                  }
                  variant='text'
                  icon={<Megaphone />}
                  size='small'
                  className={cx('beamerButton', 'mr-2')}
                />
              </Tooltip>
            </div>
            <div>
              <Tooltip label='Help'>
                <IconButton
                  variant='text'
                  icon={<HelpCircle />}
                  size='small'
                  className='mr-2'
                  onClick={() => this.handleHelpToggle()}
                />
              </Tooltip>
            </div>
            <div>
              <Tooltip label='Knowledge Base'>
                <IconButton
                  variant='text'
                  icon={<BookStack />}
                  size='small'
                  className='mr-2'
                  onClick={(e) =>
                    window.open('https://support.docsumo.com/docs', '_blank')
                  }
                />
              </Tooltip>
            </div>
            <CreditUtilizationTooltip
              toggleShowCreditUtilizationModal={
                this.toggleShowCreditUtilizationModal
              }
            >
              <div
                className={cx(styles.user, {
                  [styles['user--opened']]: showCreditUtilizationTooltip,
                })}
              >
                <div
                  className={cx(styles.userBox, 'd-flex', 'align-items-center')}
                >
                  <div className={styles.avatar}>
                    {avatarUrl ? (
                      <img alt={fullName} src={avatarUrl} />
                    ) : (
                      <span className={styles.avatar__icon}>
                        <p>{Array.from(fullName)[0]?.toUpperCase()}</p>
                      </span>
                    )}
                  </div>
                  <div className={styles.details}>
                    <p className={cx(styles.name, 'ellipsis')}>
                      {_.capitalize(fullName)}
                    </p>
                    <p className={styles.plan}>{plan}</p>
                  </div>
                  <NavArrowDown
                    className={cx(
                      styles.dropdownArrowIcon,
                      styles['dropdownArrowIcon--down']
                    )}
                  />
                  <NavArrowUp
                    className={cx(
                      styles.dropdownArrowIcon,
                      styles['dropdownArrowIcon--up']
                    )}
                  />

                  <ul className={styles.dropdown}>
                    <li>
                      {fromGoogleMarketplace ? (
                        <a
                          href='https://console.cloud.google.com/billing'
                          target='_blank'
                          rel='noopener noreferrer'
                          className={styles.googleMarketPlaceLink}
                        >
                          <span>Managed by Google</span>
                          <OpenNewWindow
                            width={'1.125rem'}
                            height={'1.125rem'}
                          />
                        </a>
                      ) : (
                        <div
                          className={cx('d-flex', 'justify-content-between')}
                        >
                          <div>
                            <p>Request Credits</p>
                            <p className='mt-1'>
                              {`${
                                monthly_doc_current || user.monthlyDocCurrent
                              } / ${
                                monthly_doc_limit || user.monthlyDocLimit
                              } credits`}
                            </p>
                          </div>
                          <IconButton
                            variant='text'
                            icon={<ArrowRight height={20} width={20} />}
                            size='small'
                            onClick={handleRequestCreditClick}
                          />
                        </div>
                      )}
                    </li>
                    {showAccountSwitch ? (
                      <li>
                        <div className={styles.toggleContainer}>
                          <div
                            className={cx(
                              'd-flex',
                              'align-items-center',
                              'justify-content-center'
                            )}
                          >
                            <Flask height={20} width={20} />
                            <span className={styles.toggleText}>Test Mode</span>
                          </div>
                          <ToggleControl
                            handleStatus={this.handleStatus}
                            checked={checkTestStatus()}
                            className={styles.toggleBtn}
                            isLoading={isChangingMode}
                            disabled={isChangingMode}
                          />
                        </div>
                      </li>
                    ) : null}
                    <li>
                      <button
                        className={cx('unstyled-btn')}
                        onClick={this.navigateToActivityLogs}
                      >
                        <Notes className={styles.icon} />
                        <p className={styles.title}>Activity Logs</p>
                      </button>
                    </li>
                    <li>
                      <button
                        className={cx('unstyled-btn')}
                        onClick={this.handleLogoutBtnClick}
                      >
                        {isAttemptingLogout ? (
                          <SpinningLoaderIcon className={styles.icon} />
                        ) : (
                          <LogOut className={styles.icon} />
                        )}
                        <p className={styles.title}>Logout</p>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </CreditUtilizationTooltip>
            <CreditUtilizationModal
              toggleShowCreditUtilizationModal={
                this.toggleShowCreditUtilizationModal
              }
            />
          </div>
        </div>
        {showSnackbar && (
          <Snackbar
            className={styles.snackbar}
            title={
              <div className={styles.snackbar_container}>
                <div className={styles.snackbar__left}>
                  <InfoEmpty />
                  <span>You are in test mode</span>
                </div>
                <div className={styles.snackbar__right}>
                  <a
                    href={SUPPORT_LINK.TEST_PROD_MODE_DOC}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.link}
                  >
                    Learn more
                  </a>
                </div>
              </div>
            }
            theme='dark'
            duration={5000}
            hideDismissButton={true}
            handleClose={() => this.setState({ showSnackbar: false })}
          />
        )}
        <ProgressBar progress={30} />
        <HubspotMeetingPopup
          user={user}
          isOpen={showContactSalesPopup}
          handleClose={this.handleContactSalesPopupClose}
          origin={SALES_ORIGIN_KEYS.userDropdown}
        />
      </header>
    );
  }
}

function mapStateToProp(state) {
  const { searchQuery, docFetchingStatus, globalDocumentCounts } =
    state.documents;

  const { config = {}, user, showCreditUtilizationModal } = state.app;

  const {
    usersPage: { users },
  } = state.users;

  const {
    documentsById,
    allDocumentsPage: { documentIds },
  } = state.documents;

  const documents = documentIds.map((documentId) => {
    return documentsById[documentId];
  });

  const {
    accountType,
    canSwitchToOldMode = true,
    fromGoogleMarketplace = false,
    credits = {},
    flags: { showLowCredit75Popup = false, showLowCredit85Popup = false },
  } = config;

  const showCreditUtilizationTooltip =
    showLowCredit75Popup || showLowCredit85Popup;

  return {
    searchQuery,
    docFetchingStatus,
    accountType,
    canSwitchToOldMode,
    user,
    documents,
    usersList: users,
    globalDocumentCounts,
    fromGoogleMarketplace,
    credits,
    showCreditUtilizationTooltip,
    showCreditUtilizationModal,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    gloableActions: bindActionCreators(gloableActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(withRouter(Header));
