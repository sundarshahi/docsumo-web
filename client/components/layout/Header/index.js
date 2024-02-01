/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, matchPath, withRouter } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import {
  // actionTypes as documentActionTypes,
  actions as gloableActions,
} from '@redux/app/actions';
import { actions as documentActions } from '@redux/documents/actions';
import * as reduxHelpers from 'client/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as api from 'client/api';
import { WithDesignContext } from 'client/components/contexts/design';
import { NEW } from 'client/constants';
import { MIXPANEL_ORIGINS } from 'client/constants/mixpanel';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import * as tawk from 'client/thirdParty/tawk';
import { ReactComponent as ArrowDropdownIcon } from 'images/icons/arrow-dropdown.svg';
import { ReactComponent as InfoIcon } from 'images/icons/info.svg';
import { ReactComponent as NotificationIcon } from 'images/icons/notification.svg';
//import { ReactComponent as HelpIcon } from 'images/icons/help.svg';
import { ReactComponent as PowerIcon } from 'images/icons/power.svg';
import { ReactComponent as ReloadWindow } from 'images/icons/reload_window.svg';
import { ReactComponent as SettingsIcon } from 'images/icons/settings.svg';
//import { ReactComponent as ChatBubbleIcon } from 'images/icons/chat-bubble.svg';
import { ReactComponent as UserAvatarIcon } from 'images/icons/user-avatar.svg';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { chameleonUpdateUserData } from 'new/thirdParty/chameleon';
import Switch from 'react-switch';

//import { HelpTooltip } from 'client/components/widgets/tooltip';
//import ttConstants from 'client/constants/helpTooltips';
// import { ReactComponent as StartTourIcon } from 'images/icons/start-tour-icon.svg';
import { SpinningLoaderIcon } from 'components/widgets/progress';

import { TestModeSnackbar } from './components/TestModeSnackbar/TestModeSnackbar';
import ProgressBar from './ProgressBar';
import SearchBox from './SearchBox';

import styles from './index.scss';
class Header extends Component {
  state = {
    isAttemptingLogout: false,
    isSnackbar: false,
    isChanging: false,
  };
  isMounted = false;

  componentDidMount() {
    this.isMounted = true;
    const { user } = this.props;
    const { mode } = user;
    this.setState(
      {
        isTestMode: mode !== 'prod',
      },
      () => {
        if (this.state.isTestMode) {
          this.setState({
            isSnackbar: true,
          });
          setTimeout(() => {
            this.setState({
              isSnackbar: false,
            });
          }, 5000);
        }
      }
    );

    if (user?.mode === 'test') {
      this.setState({
        isSnackbar: true,
      });
      setTimeout(() => {
        this.setState({
          isSnackbar: false,
        });
      }, 5000);
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  changeTestProdMode = async () => {
    const { appActions, user, canSwitchToOldMode } = this.props;

    try {
      this.setState({ isChanging: true });

      const mode = user?.mode === 'test' ? 'prod' : 'test';
      let payload = {
        mode,
      };
      await api.switchAccountMode(payload);

      //Add mixpanel envent
      mixpanel.track(MIXPANEL_EVENTS.switch_mode, {
        'work email': user.email,
        'organization ID': user.orgId,
        mode,
        version: 'old',
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

  handleChatBtnClick = (e) => {
    e.preventDefault();
    tawk.show();
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

  toggleDesign = async () => {
    const {
      user,
      canSwitchToOldMode,
      history: {
        location: { pathname },
      },
    } = this.props;
    const { mode } = user;

    try {
      await api.switchUser({ mode: NEW });
      this.props.changeDesign(NEW);

      const originType =
        Object.values(MIXPANEL_ORIGINS).find((i) => {
          const match =
            matchPath(pathname, {
              path: i.path,
              isExact: true,
            }) || {};
          return match.isExact;
        }) || {};
      mixpanel.track(MIXPANEL_EVENTS.switch_to_new_version, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'old',
        mode: mode,
        origin: originType.value || 'Old UI',
        canSwitchUIVersion: canSwitchToOldMode,
      });

      chameleonUpdateUserData(
        user.userId,
        {
          ui_mode: NEW,
          toggled_ui_view: true,
        },
        true
      );
    } catch (err) {
      this.props.gloableActions.setToast({
        title:
          err?.responsePayload?.message ||
          'Unable to switch design from old to new',
        error: true,
      });
    }
  };

  render() {
    const { isAttemptingLogout, isSnackbar } = this.state;
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
    } = this.props;
    const fullName = _.get(user, 'fullName', '');
    const avatarUrl = _.get(user, 'avatarUrls.80');
    const plan = accountType || 'Free Plan';
    // Add mixpanel events
    const originType = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );
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
            <div className={styles.notification}>
              <NavLink
                to={'/allactivity'}
                onClick={() => {
                  mixpanel.track(MIXPANEL_EVENTS.view_all_activity, {
                    origin: originType ? originType : '',
                    'work email': user.email,
                    version: 'old',
                    canSwitchUIVersion: canSwitchToOldMode,
                  });
                  this.closeAnalyticsOnNavigation();
                }}
              >
                <div className={styles.icon}>
                  <NotificationIcon />
                </div>
                <div className={styles.tooltip}>
                  All Activity
                  <div className={styles.arrow} />
                </div>
              </NavLink>
            </div>
            <div className={styles.user}>
              <div className={styles.avatar}>
                {avatarUrl ? (
                  <img alt={fullName} src={avatarUrl} />
                ) : (
                  <UserAvatarIcon />
                )}
              </div>
              <div className={styles.details}>
                <p className={cx(styles.name, 'ellipsis')}>{fullName}</p>
                <p className={styles.plan}>{plan}</p>
              </div>
              <ArrowDropdownIcon className={styles.dropdownArrowIcon} />

              <ul className={styles.dropdown}>
                {showAccountSwitch ? (
                  <li className={styles.toggleTestModeItem}>
                    <div>
                      <Switch
                        onColor={'#4D61FC'}
                        offColor={'#e8eaed'}
                        height={22}
                        width={36}
                        checkedIcon={null}
                        uncheckedIcon={null}
                        draggable={false}
                        onChange={this.changeTestProdMode}
                        handleDiameter={20}
                        checked={checkTestStatus()}
                        boxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
                        activeBoxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
                      />
                      <p className={cx(styles.title, styles.switchTitle)}>
                        Test Mode
                      </p>
                    </div>
                  </li>
                ) : null}

                <li>
                  <Link
                    to={'/settings/account-settings/'}
                    title='Settings'
                    onClick={() => this.closeAnalyticsOnNavigation()}
                  >
                    <SettingsIcon className={styles.icon} />
                    <p className={styles.title}>Settings</p>
                  </Link>
                </li>
                <li>
                  <button
                    className={cx('unstyled-btn', styles.newVersionContainer)}
                    onClick={this.toggleDesign}
                    title='Switch to new version'
                  >
                    <ReloadWindow className={styles.icon} />
                    <p className={styles.title}>Switch to new version</p>
                  </button>
                </li>
                <li>
                  <button
                    className={cx('unstyled-btn')}
                    onClick={this.handleWatchIntroBtnClick}
                    title='Watch Intro'
                  >
                    <InfoIcon className={styles.icon} />
                    <p className={styles.title}>Watch Intro</p>
                  </button>
                </li>
                <li>
                  <button
                    className={cx('unstyled-btn')}
                    onClick={this.handleLogoutBtnClick}
                    title='Logout'
                  >
                    {isAttemptingLogout ? (
                      <SpinningLoaderIcon className={styles.icon} />
                    ) : (
                      <PowerIcon className={styles.icon} />
                    )}
                    <p className={styles.title}>Logout</p>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {isSnackbar ? <TestModeSnackbar /> : null}

        <ProgressBar progress={30} />
      </header>
    );
  }
}

function mapStateToProp(state) {
  const { searchQuery, docFetchingStatus, globalDocumentCounts } =
    state.documents;

  const { config = {}, user } = state.app;

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

  const { accountType, canSwitchToOldMode = true } = config;

  return {
    searchQuery,
    docFetchingStatus,
    accountType,
    user,
    documents,
    usersList: users,
    globalDocumentCounts,
    canSwitchToOldMode,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    gloableActions: bindActionCreators(gloableActions, dispatch),
  };
}

export default connect(
  mapStateToProp,
  mapDispatchToProps
)(withRouter(WithDesignContext(Header)));
