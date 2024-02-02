import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import {
  MFAResetView,
  MFAVerificationView,
} from 'new/components/shared/MultiFactorAuthentication';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import ROUTES from 'new/constants/routes';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

const MFA_AUTH_FLOW_STEPS = {
  verify: 'VERIFY',
  reset: 'RESET',
};

function MFAAuthFlow(props) {
  const {
    mfaData,
    appActions,
    history,
    onResetSuccess,
    location: { state },
  } = props;

  const [codeVerificationStatusMessage, setCodeVerificationStatusMessage] =
    useState({
      message: '',
      type: '',
    });
  const [resetMFAStatusMessage, setResetMFAStatusMessage] = useState({
    message: '',
    type: '',
  });
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResettingMFA, setIsResettingMFA] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [resetRequestSuccessMessage, setResetRequestSuccessMessage] =
    useState('');
  const [authStep, setAuthStep] = useState(MFA_AUTH_FLOW_STEPS.verify);

  const getOriginForMixpanel = () => {
    const {
      location: { pathname = '' },
    } = history;

    const origin = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );

    return origin.value || '';
  };

  const handleResetRequest = async () => {
    setIsRequestingReset(true);

    const payload = {};

    try {
      const response = await api.resetRequestFromAuth({
        payload,
      });
      const { data } = _.get(response, 'responsePayload');

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.request_mfa_reset, {
        'work email': mfaData.email || '',
        origin: getOriginForMixpanel(),
      });

      const message =
        data.message ||
        'Request for resetting multi-factor authentication is successful.';
      setResetRequestSuccessMessage(message);
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'error') ||
        'Unable to reset the MFA. Please try again later.';
      setResetMFAStatusMessage({
        type: 'error',
        text: error,
      });
    } finally {
      setIsRequestingReset(false);
    }
  };

  const handleMFAReset = async (recoveryCode) => {
    setIsResettingMFA(true);

    const payload = {
      recovery_code: recoveryCode,
    };

    try {
      const response = await api.resetMFARecoveryFromAuth({
        payload,
      });
      const mfaData = _.get(response.responsePayload, 'data') || {};
      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.reset_mfa, {
        'work email': mfaData.email || '',
        origin: getOriginForMixpanel(),
      });
      onResetSuccess(mfaData);
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'Unable to reset the MFA. Please try again later.';
      const errorType = _.get(e.responsePayload, 'error') || '';

      // Add mixpanel event for error
      mixpanel.track(MIXPANEL_EVENTS.reset_mfa_error, {
        'work email': mfaData.email,
        origin: getOriginForMixpanel(),
        error,
      });

      if (errorType === 'RATE_LIMIT_EXCEEDED') {
        history.push(ROUTES.LOGIN, {
          uiError: error,
        });
      } else {
        setResetMFAStatusMessage({
          type: 'error',
          text: error,
        });
      }
    } finally {
      setIsResettingMFA(false);
    }
  };

  const handleResetClick = () => {
    setAuthStep(MFA_AUTH_FLOW_STEPS.reset);

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.reset_mfa_click, {
      'work email': mfaData.email || '',
      origin: getOriginForMixpanel(),
    });
  };

  const handleCodeVerification = async (mfaCode) => {
    setIsVerifyingCode(true);

    const payload = {
      mfa_code: mfaCode,
      email: mfaData.email,
    };

    try {
      const response = await api.loginAppUser(payload);
      const { token, user } = _.get(response.responsePayload, 'data');
      // API Client already updates the token, but still making an
      // additional action dispatch here to make sure it's not missed
      await props.appActions.setAuthToken({ token });

      mixpanel.identify(user.userId);

      mixpanel.track(MIXPANEL_EVENTS.authorize_mfa, {
        'work email': user.email || '',
        role: user.role || '',
        origin: getOriginForMixpanel(),
      });

      mixpanel.track(MIXPANEL_EVENTS.login_complete, {
        'work email': user.email || '',
      });

      try {
        const [userResponse, configResponse] = await Promise.all([
          api.getUser(),
          api.getConfig(),
        ]);
        const user = _.get(userResponse.responsePayload, 'data.user');
        const config = _.get(configResponse.responsePayload, 'data');

        chameleonIdentifyUser(user, config);

        const changePassword = _.get(config, 'flags.changePassword');

        if (changePassword) {
          history.push(ROUTES.UPDATE_PASSWORD, { isNewMember: true });
        } else {
          const { setConfig, setUser } = appActions;
          // Set the config in app state
          await setConfig({ config });
          // Set the user in app state
          await setUser({ user });

          if (user.userId === user.orgId) {
            const _hsq = (window._hsq = window._hsq || []);
            _hsq.push([
              'identify',
              {
                email: user.email,
              },
            ]);
          }

          // handle redirection
          if (state && state?.from) {
            const { pathname, search } = state?.from;
            history.push(pathname + search);
          } else {
            history.push(ROUTES.ROOT);
          }
        }
      } catch (e) {
        // Config request has failed.
        // Reload the page and bootstrap the app again
        window.location = '/';
      }
    } catch (e) {
      const { responsePayload: { message } = {} } = e || {};
      const errorType = _.get(e.responsePayload, 'error') || '';
      if (errorType === 'RATE_LIMIT_EXCEEDED') {
        history.push(ROUTES.LOGIN, {
          uiError: message,
        });
      } else {
        setCodeVerificationStatusMessage({
          text: message || 'Failed to login.',
          type: 'error',
        });
      }

      // Add mixpanel event for error
      mixpanel.track(MIXPANEL_EVENTS.authorize_mfa_error, {
        'work email': mfaData.email || '',
        error: message || 'Error encountered for MFA Auth',
        origin: getOriginForMixpanel(),
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const renderAuthFlow = () => {
    switch (authStep) {
      case MFA_AUTH_FLOW_STEPS.verify:
        return (
          <MFAVerificationView
            message={codeVerificationStatusMessage}
            isLoading={isVerifyingCode}
            onSubmit={handleCodeVerification}
            onReset={handleResetClick}
          />
        );
      case MFA_AUTH_FLOW_STEPS.reset:
        return (
          <MFAResetView
            message={resetMFAStatusMessage}
            resetRequestSuccessMessage={resetRequestSuccessMessage}
            isSubmitting={isResettingMFA}
            onSubmit={handleMFAReset}
            isRequestingReset={isRequestingReset}
            onRequestReset={handleResetRequest}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderAuthFlow()}</>;
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(connect(null, mapDispatchToProps)(MFAAuthFlow));
