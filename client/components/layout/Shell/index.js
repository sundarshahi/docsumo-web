/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { actions as appActions } from 'client/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import HubspotMeetingPopup from 'client/components/modals/hubspot';
import { ACCOUNT_TYPES } from 'client/constants';
import { ReactComponent as CalendarIcon } from 'client/images/icons/calendar-white.svg';
import {
  CLARITY_CUSTOM_KEYS,
  clarityAddCustomTags,
  clarityCustomIdentifyUser,
} from 'client/thirdParty/clarity';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import PropTypes from 'prop-types';

import Header from 'components/layout/Header/';
import PrimarySidebar from 'components/layout/PrimarySidebar';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';

import AnalyticOverlay from '../../overlays/AnalyticOverlay/index';

import { TestModeBanner } from './components/TestModeBanner/TestModeBanner';

import styles from './index.scss';

class Shell extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  state = {
    error: null,
    errorInfo: null,
    errorPath: null,
    reloading: false,
    showBanner: false,
    showContactSalesPopup: false,
  };

  addClarityTracking = (user, config) => {
    // Add clarity events
    clarityCustomIdentifyUser(user.userId); // For custom user ID
    clarityAddCustomTags(CLARITY_CUSTOM_KEYS.orgId, user.orgId);
    clarityAddCustomTags(CLARITY_CUSTOM_KEYS.company, user.companyName);
    clarityAddCustomTags(CLARITY_CUSTOM_KEYS.planType, config.accountType);
  };

  componentDidMount() {
    const { user, config, appActions } = this.props;

    if (user) {
      const { warningMessage, warningType } = user || {};
      const showCalendly = _.get(config, 'flags.showCalendlyPopup');
      this.setState({
        showBanner: !!warningMessage && !!warningType,
        showContactSalesPopup: showCalendly,
      });
      const introPopupSeen = _.get(config, 'flags.introPopupSeen');

      if (introPopupSeen === false) {
        appActions.showIntroModal();
      }

      this.addClarityTracking(user, config);

      const { canSwitchToOldMode = true } = config;

      mixpanel.track(MIXPANEL_EVENTS.app_landing, {
        'work email': user.email,
        'organization id': user.orgId,
        mode: user.mode,
        version: 'old',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }
  }

  componentDidCatch(error, errorInfo) {
    const { location } = this.props;
    const errorPath = `${_.get(location, 'pathname')}${_.get(
      location,
      'search'
    )}`;
    this.setState({
      error,
      errorInfo,
      errorPath,
    });
  }

  componentDidUpdate() {
    if (this.state.error) {
      const { location } = this.props;
      const path = `${_.get(location, 'pathname')}${_.get(location, 'search')}`;
      if (path !== this.state.errorPath) {
        // Path has changed
        // User has navigated to a different page
        // Remove the error state
        this.setState({
          error: null,
          errorInfo: null,
          errorPath: null,
        });
      }
    }
  }

  handleErrorBoundaryReloadBtnClick = () => {
    this.setState(
      {
        reloading: true,
      },
      () => {
        setTimeout(() => {
          window.location = '/';
        }, 100);
      }
    );
  };
  handleCloseBtnClick = () => {
    this.setState({
      showBanner: false,
    });
  };

  handleContactSalesPopupDisplay = (showPopup) => {
    const { user, appActions, config } = this.props;
    const { setLocalConfigFlags, setConfigFlags } = appActions;
    const { canSwitchToOldMode = true } = config;

    this.setState({ showContactSalesPopup: showPopup });

    if (!showPopup) {
      const showCalendly = _.get(config, 'flags.showCalendlyPopup');

      // If calendly popup is opened/seen right after signup
      if (showCalendly) {
        const mixpanelProperties = {
          'full name': user.fullName,
          'work email': user.email,
          'company name': user.companyName,
          'job role': user.jobRole,
          phone: user.phoneNumber || '',
          region: user.region,
          version: 'old',
          canSwitchUIVersion: canSwitchToOldMode,
        };

        mixpanel.track(MIXPANEL_EVENTS.demo_call_cancel, mixpanelProperties);
      }

      setLocalConfigFlags({
        showCalendlyPopup: false,
      });
      setConfigFlags({
        showCalendlyPopup: false,
      });
    } else {
      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.contact_sales_start, {
        'work email': user.email,
        origin: 'banner',
        version: 'old',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }
  };

  handleContactSalesComplete = () => {
    const { config, user } = this.props;
    const { canSwitchToOldMode = true } = config;

    const showCalendly = _.get(config, 'flags.showCalendlyPopup');

    // If calendly popup is opened/seen right after signup
    if (showCalendly) {
      const mixpanelProperties = {
        'full name': user.fullName,
        'work email': user.email,
        'company name': user.companyName,
        'job role': user.jobRole,
        phone: user.phoneNumber,
        region: user.region,
        version: 'old',
        canSwitchUIVersion: canSwitchToOldMode,
      };

      mixpanel.track(MIXPANEL_EVENTS.demo_call_complete, mixpanelProperties);
    }

    return;
  };

  getBanner = () => {
    const { user } = this.props;
    const { expiryDate, creditExpired, warningType, warningMessage } =
      user || {};

    let bannerContent = null;

    if (warningMessage && warningType) {
      bannerContent = (
        <>
          <p>
            {warningMessage}&nbsp; Book a call with our team to purchase a
            subscription.
          </p>
          <button
            type='button'
            className={styles.bannerBtn}
            onClick={() => this.handleContactSalesPopupDisplay(true)}
          >
            <CalendarIcon />
            <span>Schedule a call</span>
          </button>
        </>
      );
    } else if (!expiryDate && !creditExpired) {
      bannerContent = (
        <>
          <p>
            All Pre-trained APIs, Automated Learning, and more are available on
            full version.
          </p>
          <button
            type='button'
            className={styles.bannerBtn}
            onClick={() => this.handleContactSalesPopupDisplay(true)}
          >
            <CalendarIcon />
            <span>Schedule a call</span>
          </button>
        </>
      );
    } else if (creditExpired) {
      bannerContent = (
        <>
          <p>
            Trial expired, book a call with our team to get a trial extension
          </p>
          <button
            type='button'
            className={styles.bannerBtn}
            onClick={() => this.handleContactSalesPopupDisplay(true)}
          >
            <CalendarIcon />
            <span>Schedule a call</span>
          </button>
        </>
      );
    } else {
      const currentDate = new Date();
      const expire = new Date(expiryDate);
      let remainingDay = Math.round(
        (expire.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
      );

      bannerContent = (
        <>
          <p>
            {remainingDay} days trial left! For training custom model on your
            documents &amp; see the full potential of Docsumo for your company
          </p>
          <button
            type='button'
            className={styles.bannerBtn}
            onClick={() => this.handleContactSalesPopupDisplay(true)}
          >
            <CalendarIcon />
            <span>Schedule Demo</span>
          </button>
        </>
      );
    }

    return (
      <div
        className={cx(styles.banner, {
          [styles.bannerExpire]: creditExpired || warningType === 'error',
        })}
      >
        {bannerContent}
      </div>
    );
  };

  render() {
    const {
      user,
      globalMyDocumentCounts,
      history,
      appActions,
      location,
      config,
      isTestMode,
    } = this.props;
    const { error, reloading, showBanner, showContactSalesPopup } = this.state;

    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const tokenKey = parsedUrl.searchParams.get('token');

    if (!user || _.isEmpty(user)) {
      // No user. Take to login page
      if (tokenKey) {
        window.open('https://docsumo.com/link-expired', '_top');
        return;
      }
      return (
        <Redirect
          to={{
            pathname: '/login/',
            state: { from: { ...this.props.location } },
          }}
        />
      );
    }

    const searchableRoutes = [
      '/all',
      '/review/',
      '/skipped/',
      '/processed/',
      '/allactivity',
      '/documentactivity/',
      '/useractivity/',
      '/creditactivity/',
      '/webhookactivity/',
    ];

    const banner =
      config && config.accountType === ACCOUNT_TYPES.FREE
        ? this.getBanner()
        : null;

    const isNewUser = _.get(config, 'flags.showCalendlyPopup');

    return (
      <div className={styles.container}>
        {banner}
        {isTestMode ? <TestModeBanner /> : null}
        <div
          className={cx(
            styles.content,
            config && config.accountType === ACCOUNT_TYPES.FREE
              ? styles.contentWithBanner
              : ''
          )}
        >
          <PrimarySidebar
            user={user}
            globalMyDocumentCounts={globalMyDocumentCounts}
            history={history}
            config={config}
          />
          <div className={styles.colRight}>
            <Header
              user={user}
              appActions={appActions}
              searchable={searchableRoutes.includes(location.pathname)}
              history={history}
            />
            <AnalyticOverlay />
            <main
              role='main'
              className={cx(styles.mainWrapper, {
                [styles.mainBanner]: showBanner,
              })}
            >
              <div className={styles.mainContainer}>
                {error ? (
                  <div className={styles.errorBoundary}>
                    <h1 className={styles.error}>Something went wrong</h1>

                    <Button
                      appearance={BUTTON_APPEARANCES.WHITE_SHADOWED}
                      isLoading={reloading}
                      className={styles.btn}
                      text='Reload'
                      loadingText='Reloading...'
                      onClick={this.handleErrorBoundaryReloadBtnClick}
                    />
                  </div>
                ) : (
                  this.props.children
                )}
              </div>
            </main>
          </div>
        </div>
        <HubspotMeetingPopup
          isNewUser={isNewUser}
          user={user}
          isOpen={showContactSalesPopup}
          handleClose={() => this.handleContactSalesPopupDisplay(false)}
        />
      </div>
    );
  }
}

function mapStateToProp({ app, documents }) {
  const { config, user, showTooltipIntroModal, isTestMode } = app;
  return {
    user: user,
    config: config,
    tooltipflow:
      config &&
      config.flags &&
      config.flags.showTooltipFlow &&
      !showTooltipIntroModal,
    globalDocumentCounts: documents.globalDocumentCounts,
    globalMyDocumentCounts: documents.globalMyDocumentCounts,
    isTestMode,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(connect(mapStateToProp, mapDispatchToProps)(Shell));
