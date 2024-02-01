/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { HeadsetHelp } from 'iconoir-react';
import { Refresh } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { SALES_ORIGIN_KEYS } from 'new/components/contexts/trackingConstants';
import Header from 'new/components/layout/Header';
import PrimarySidebar from 'new/components/layout/PrimarySidebar';
import HubspotMeetingPopup from 'new/components/modals/hubspot';
import { ACCOUNT_TYPES } from 'new/constants';
import ROUTES from 'new/constants/routes';
import {
  CLARITY_CUSTOM_KEYS,
  clarityAddCustomTags,
  clarityCustomIdentifyUser,
} from 'new/thirdParty/clarity';
import { HotjarIdentifyUser } from 'new/thirdParty/hotjar';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Banner from 'new/ui-elements/Banner/Banner';
import Button, { SIZE, VARIANT } from 'new/ui-elements/Button/Button.js';
import PropTypes from 'prop-types';

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

  addHotJarTracking = (user, config) => {
    HotjarIdentifyUser(user, config);
  };
  mixpanelProfileSet = (user, config) => {
    mixpanel.identify(user?.userId);

    mixpanel.people.set({
      $name: user?.fullName,
      $email: user?.email,
      AccountType: config?.accountType,
      CompanyName: user?.companyName,
      OrgId: user?.orgId,
    });
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

      this.addHotJarTracking(user, config);

      this.mixpanelProfileSet(user, config);

      const { canSwitchToOldMode = true } = config;

      mixpanel.track(MIXPANEL_EVENTS.app_landing, {
        'work email': user.email,
        'organization id': user.orgId,
        mode: user.mode,
        version: 'new',
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
          window.location = ROUTES.ROOT;
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
          version: 'new',
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
        version: 'new',
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
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      };

      mixpanel.track(MIXPANEL_EVENTS.demo_call_complete, mixpanelProperties);
    }

    return;
  };

  getBanner = () => {
    const { user } = this.props;
    let { expiryDate, creditExpired, warningType, warningMessage } = user || {};

    let bannerContent = null;

    if (warningMessage && warningType) {
      bannerContent = (
        <Banner
          className={styles.banner__position}
          variant='info'
          color='var(--ds-clr-white)'
        >
          <>
            <p>
              {warningMessage}&nbsp; Book a call with our team to purchase a
              subscription.
            </p>
            <Button
              variant='ghost'
              size='small'
              icon={<HeadsetHelp width={12} height={12} />}
              className={styles.bannerBtn}
              onClick={() => this.handleContactSalesPopupDisplay(true)}
            >
              <span>Contact Sales</span>
            </Button>
          </>
        </Banner>
      );
    } else if (!expiryDate && !creditExpired) {
      bannerContent = (
        <Banner
          className={styles.banner__position}
          variant='info'
          color='var(--ds-clr-white)'
        >
          <>
            <p>
              All Pre-trained APIs, Automated Learning, and more are available
              on full version.
            </p>
            <Button
              variant='ghost'
              size='small'
              icon={<HeadsetHelp width={12} height={12} />}
              className={styles.bannerBtn}
              onClick={() => this.handleContactSalesPopupDisplay(true)}
            >
              <span>Contact Sales</span>
            </Button>
          </>
        </Banner>
      );
    } else if (creditExpired) {
      bannerContent = (
        <Banner
          className={styles.banner__position}
          variant='info'
          color='var(--ds-clr-white)'
        >
          <>
            <p>
              Trial expired, book a call with our team to get a trial extension
            </p>
            <Button
              variant='ghost'
              size='small'
              icon={<HeadsetHelp width={12} height={12} />}
              className={styles.bannerBtn}
              onClick={() => this.handleContactSalesPopupDisplay(true)}
            >
              <span>Contact Sales</span>
            </Button>
          </>
        </Banner>
      );
    } else {
      const currentDate = new Date();
      const expire = new Date(expiryDate);
      let remainingDay = Math.round(
        (expire.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
      );

      bannerContent = (
        <Banner
          variant='info'
          color='var(--ds-clr-white)'
          className={cx(styles.banner, styles.banner__position)}
        >
          <>
            <p>
              Free trial ending in {remainingDay} days! Book a demo to get the
              most of out of your free trial.
            </p>
            <Button
              variant='ghost'
              size='small'
              icon={<HeadsetHelp width={12} height={12} />}
              className={styles.bannerBtn}
              onClick={() => this.handleContactSalesPopupDisplay(true)}
            >
              <span>Contact Sales</span>
            </Button>
          </>
        </Banner>
      );
    }

    return <div>{bannerContent}</div>;
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
      ROUTES.ALL,
      ROUTES.REVIEW,
      ROUTES.SKIPPED,
      ROUTES.PROCESSED,
      ROUTES.ALL_ACTIVITY,
      ROUTES.DOCUMENT,
      ROUTES.USER,
      ROUTES.CREDIT,
      ROUTES.WEBHOOK,
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
          <PrimarySidebar globalMyDocumentCounts={globalMyDocumentCounts} />
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
                    <h1 className='font-normal text-lg'>
                      Something went wrong.
                    </h1>

                    <Button
                      className='mt-4'
                      variant={VARIANT.CONTAINED}
                      size={SIZE.SMALL}
                      icon={Refresh}
                      onClick={this.handleErrorBoundaryReloadBtnClick}
                    >
                      Reload
                    </Button>
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
          origin={SALES_ORIGIN_KEYS.banner}
        />
      </div>
    );
  }
}

function mapStateToProp({ app, documents }) {
  const { config, user, showTooltipIntroModal } = app;

  const isTestMode = !!(user?.mode !== 'prod');

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
