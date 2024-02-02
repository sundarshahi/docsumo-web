/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { showToast } from 'new/redux/helpers';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { MFAVerificationView } from 'new/components/shared/MultiFactorAuthentication';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import AriaModal from 'react-aria-modal';

function ToggleMFAFlow(props) {
  const {
    rootProps,
    onExit,
    isMFAEnabled,
    onEnableSuccess,
    onDisableSuccess,
    scope,
    user = {},
    history,
    config,
  } = props;

  const [codeVerificationStatusMessage, setCodeVerificationStatusMessage] =
    useState({
      message: '',
      type: '',
    });
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const finalRootProps = {
    focusDialog: true,
    underlayClickExits: true,
    verticallyCenter: true,
    focusTrapPaused: false,
    onExit,
    ...rootProps,
  };

  const getOriginForMixpanel = () => {
    const {
      location: { pathname = '' },
    } = history;

    const origin = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );

    return origin?.value || '';
  };

  const handleEnableMFA = async (mfaCode) => {
    const payload = {
      mfa_code: mfaCode,
    };
    const { canSwitchToOldMode = true } = config;

    try {
      const response = await api.enableMFA({
        payload,
        scope,
      });
      const statusCode = _.get(response.responsePayload, 'statusCode');
      if (statusCode === 200) {
        // Add mixpanel event
        mixpanel.track(MIXPANEL_EVENTS.authorize_mfa, {
          'work email': user.email || '',
          role: user.role || '',
          origin: getOriginForMixpanel(),
          version: 'new',
          canSwitchUIVersion: canSwitchToOldMode,
        });
        onEnableSuccess();
        showToast({
          title: 'MFA enabled successfully.',
          success: true,
        });
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'Unable to enable MFA. Please try again later.';

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.authorize_mfa_error, {
        'work email': user.email || '',
        role: user.role || '',
        origin: getOriginForMixpanel(),
        error,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });

      setCodeVerificationStatusMessage({
        type: 'error',
        text: error,
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleDisableMFA = async (mfaCode) => {
    const { canSwitchToOldMode = true } = config;

    const payload = {
      mfa_code: mfaCode,
    };
    try {
      const response = await api.disableMFA({
        payload,
        scope,
      });
      const statusCode = _.get(response.responsePayload, 'statusCode');
      if (statusCode === 200) {
        // Add mixpanel event
        mixpanel.track(MIXPANEL_EVENTS.authorize_mfa, {
          'work email': user.email || '',
          role: user.role || '',
          origin: getOriginForMixpanel(),
          version: 'new',
          canSwitchUIVersion: canSwitchToOldMode,
        });
        onDisableSuccess();
        showToast({
          title: 'MFA disabled successfully.',
          success: true,
        });
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'Unable to disable MFA. Please try again later.';

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.authorize_mfa_error, {
        'work email': user.email || '',
        role: user.role || '',
        origin: getOriginForMixpanel(),
        error,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });

      setCodeVerificationStatusMessage({
        type: 'error',
        text: error,
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleToggleMFA = (mfaCode) => {
    setIsVerifyingCode(true);

    if (isMFAEnabled) {
      handleDisableMFA(mfaCode);
    } else {
      handleEnableMFA(mfaCode);
    }
  };

  return (
    <AriaModal titleText={'disable mfa'} {...finalRootProps}>
      <MFAVerificationView
        isModal={true}
        onCloseModal={onExit}
        isLoading={isVerifyingCode}
        onSubmit={handleToggleMFA}
        message={codeVerificationStatusMessage}
      />
    </AriaModal>
  );
}

export default withRouter(ToggleMFAFlow);
