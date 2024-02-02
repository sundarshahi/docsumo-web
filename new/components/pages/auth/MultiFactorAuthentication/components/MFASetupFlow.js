import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import {
  MFARecoveryCodeDisplayView,
  MFASetupView,
} from 'new/components/shared/MultiFactorAuthentication';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import ROUTES from 'new/constants/routes';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

const MFA_SETUP_FLOW_STEPS = {
  setup: 'SETUP',
  backup: 'BACKUP',
};

function MFASetupFlow(props) {
  const {
    mfaData,
    appActions,
    history,
    location: { state },
  } = props;

  const [codeVerificationStatusMessage, setCodeVerificationStatusMessage] =
    useState({
      message: '',
      type: '',
    });
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [setupStep, setSetupStep] = useState(MFA_SETUP_FLOW_STEPS.setup);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [isNewMember, setIsNewMember] = useState(false);

  useEffect(() => {
    const { mfaMessage } = mfaData;

    if (mfaMessage) {
      setCodeVerificationStatusMessage({
        text: mfaMessage,
        type: 'info',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOriginForMixpanel = () => {
    const {
      location: { pathname = '' },
    } = history;

    const origin = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );

    return origin.value || '';
  };

  const handleRedirection = (path, configs = {}) => {
    if (state && state?.from) {
      const { pathname, search } = state?.from;
      history.push(pathname + search);
    } else {
      history.push(path, { ...configs });
    }
  };

  const handleBackupContinue = () => {
    if (isNewMember) {
      handleNewMemberFlow();
    } else {
      handleRedirection(ROUTES.ROOT);
    }
  };

  const skipMFABackupCodeStep = () => {
    handleRedirection(ROUTES.ROOT);
  };

  const handleNewMemberFlow = () => {
    handleRedirection(ROUTES.UPDATE_PASSWORD, { isNewMember });
  };

  const handleLogin = async (mfaCode, email) => {
    try {
      const response = await api.loginAppUser({
        mfa_code: mfaCode,
        email,
      });
      const { token, user } = _.get(response.responsePayload, 'data');

      // API Client already updates the token, but still making an
      // additional action dispatch here to make sure it's not missed
      await appActions.setAuthToken({ token });

      // Add mixpanel event
      mixpanel.identify(user.userId);
      mixpanel.track(MIXPANEL_EVENTS.login_complete, {
        'work email': email,
      });

      const [userResponse, configResponse] = await Promise.all([
        api.getUser(),
        api.getConfig(),
      ]);
      const userData = _.get(userResponse.responsePayload, 'data.user');
      const config = _.get(configResponse.responsePayload, 'data');

      chameleonIdentifyUser(userData, config);

      const changePassword = _.get(config, 'flags.changePassword');

      if (changePassword) {
        setIsNewMember(true);
      } else {
        const { setConfig, setUser } = appActions;
        // Set the config in app state
        await setConfig({ config });

        // Set the user in app state
        await setUser({ user: userData });

        if (user.userId === user.orgId) {
          const _hsq = (window._hsq = window._hsq || []);
          _hsq.push([
            'identify',
            {
              email: user.email,
            },
          ]);
        }
      }
    } catch (e) {
      const { responsePayload: { message } = {} } = e || {};
      setCodeVerificationStatusMessage({
        text: message || 'Failed to login.',
        type: 'error',
      });
    }
  };

  const handleCodeVerification = async (mfaCode) => {
    setIsVerifyingCode(true);

    const payload = {
      mfa_code: mfaCode,
    };

    try {
      const response = await api.enableSingleMFA({ payload });
      const { recoveryCode = '', showRecoveryCode } = _.get(
        response.responsePayload,
        'data'
      );

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.setup_mfa, {
        'work email': mfaData.email || '',
        origin: getOriginForMixpanel(),
      });

      setRecoveryCode(recoveryCode);

      await handleLogin(mfaCode, mfaData.email);

      if (!showRecoveryCode) {
        skipMFABackupCodeStep();
      } else {
        setSetupStep(MFA_SETUP_FLOW_STEPS.backup);
      }
    } catch (e) {
      const message = _.get(e.responsePayload, 'message') || '';
      const errorType = _.get(e.responsePayload, 'error') || '';

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.setup_mfa_error, {
        'work email': mfaData.email || '',
        error: message,
        origin: getOriginForMixpanel(),
      });

      if (errorType === 'RATE_LIMIT_EXCEEDED') {
        history.push(ROUTES.LOGIN, {
          uiError: message,
        });
      } else {
        setCodeVerificationStatusMessage({
          text: message || 'Failed to verify MFA code.',
          type: 'error',
        });
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const renderSetupFlow = () => {
    switch (setupStep) {
      case MFA_SETUP_FLOW_STEPS.setup:
        return (
          <MFASetupView
            mfaData={mfaData}
            message={codeVerificationStatusMessage}
            isLoading={isVerifyingCode}
            onSubmit={handleCodeVerification}
          />
        );
      case MFA_SETUP_FLOW_STEPS.backup:
        return (
          <MFARecoveryCodeDisplayView
            recoveryCode={recoveryCode}
            onSubmit={handleBackupContinue}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderSetupFlow()}</>;
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(connect(null, mapDispatchToProps)(MFASetupFlow));
