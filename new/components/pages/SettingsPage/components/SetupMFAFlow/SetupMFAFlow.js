/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { showToast } from 'new/redux/helpers';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import {
  MFARecoveryCodeDisplayView,
  MFASetupView,
} from 'new/components/shared/MultiFactorAuthentication';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import AriaModal from 'react-aria-modal';

const MFA_SETUP_FLOW_STEPS = {
  setup: 'SETUP',
  backup: 'BACKUP',
};

function SetupMFAFlow(props) {
  const {
    rootProps,
    onExit,
    mfaData,
    onEnableSuccess,
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
  const [setupStep, setSetupStep] = useState(MFA_SETUP_FLOW_STEPS.setup);
  const [recoveryCode, setRecoveryCode] = useState('');

  const finalRootProps = {
    focusDialog: true,
    underlayClickExits: true,
    verticallyCenter: true,
    focusTrapPaused: false,
    onExit,
    ...rootProps,
  };

  const handleClose = () => {
    if (setupStep === MFA_SETUP_FLOW_STEPS.backup) {
      onEnableSuccess();
    }
    onExit();
  };

  const getOriginForMixpanel = () => {
    const {
      location: { pathname = '' },
    } = history;

    const origin = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );

    return origin.value || '';
  };

  const handleCodeVerification = async (mfaCode) => {
    const { canSwitchToOldMode = true } = config;

    setIsVerifyingCode(true);
    const payload = {
      mfa_code: mfaCode,
    };
    try {
      const response = await api.enableMFA({
        payload,
        scope,
      });
      const { recoveryCode = '', showRecoveryCode } = _.get(
        response.responsePayload,
        'data'
      );
      setRecoveryCode(recoveryCode);

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.setup_mfa, {
        'work email': user.email || '',
        role: user.role || '',
        origin: getOriginForMixpanel(),
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });

      if (!showRecoveryCode) {
        onEnableSuccess();
        showToast({
          title: 'MFA enabled successfully.',
          success: true,
        });
      } else {
        setSetupStep(MFA_SETUP_FLOW_STEPS.backup);
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'Unable to enable MFA. Please try again later.';

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.setup_mfa_error, {
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

  const handleRecoveryCodeClose = () => {
    showToast({
      title: 'MFA enabled successfully.',
      success: true,
    });
    onEnableSuccess();
  };

  const renderSetupFlow = () => {
    switch (setupStep) {
      case MFA_SETUP_FLOW_STEPS.setup:
        return (
          <MFASetupView
            isModal={true}
            mfaData={mfaData}
            message={codeVerificationStatusMessage}
            isLoading={isVerifyingCode}
            onSubmit={handleCodeVerification}
            onCloseModal={onExit}
          />
        );
      case MFA_SETUP_FLOW_STEPS.backup:
        return (
          <MFARecoveryCodeDisplayView
            isModal={true}
            recoveryCode={recoveryCode}
            onSubmit={handleRecoveryCodeClose}
            onCloseModal={handleRecoveryCodeClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AriaModal
      titleText={'disable mfa'}
      {...finalRootProps}
      onExit={handleClose}
    >
      {renderSetupFlow()}
    </AriaModal>
  );
}

export default withRouter(SetupMFAFlow);
