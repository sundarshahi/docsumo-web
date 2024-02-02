/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { showToast } from 'new/redux/helpers';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import {
  MFARecoveryCodeDisplayView,
  MFAResetView,
  MFASetupView,
} from 'new/components/shared/MultiFactorAuthentication';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import AriaModal from 'react-aria-modal';

const MFA_RESET_FLOW_STEPS = {
  reset: 'RESET',
  setup: 'SETUP',
  backup: 'BACKUP',
};

function ResetMFAFlow(props) {
  const {
    rootProps,
    onExit,
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
  const [isVerifyingMFACode, setIsVerifyingMFACode] = useState(false);
  const [isVerifyingRecoveryCode, setIsVerifyingRecoveryCode] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [resetRequestSuccessMessage, setResetRequestSuccessMessage] =
    useState('');
  const [resetStep, setResetStep] = useState(MFA_RESET_FLOW_STEPS.reset);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [mfaData, setMfaData] = useState('');

  const finalRootProps = {
    focusDialog: true,
    underlayClickExits: true,
    verticallyCenter: true,
    focusTrapPaused: false,
    onExit,
    ...rootProps,
  };

  const handleRecoveryCodeVerification = async (recoveryCode) => {
    const { location } = history;
    const { pathname = '' } = location;
    const { canSwitchToOldMode = true } = config;
    const origin = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );

    setIsVerifyingRecoveryCode(true);
    let payload = {
      recovery_code: recoveryCode,
    };
    try {
      const response = await api.resetMFARecovery({
        payload,
      });
      const mfaData = _.get(response.responsePayload, 'data') || {};
      setMfaData(mfaData);
      setResetStep(MFA_RESET_FLOW_STEPS.setup);
      setCodeVerificationStatusMessage({
        type: '',
        text: '',
      });

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.reset_mfa, {
        'work email': user.email || '',
        role: user.role || '',
        origin: origin.value || '',
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'Unable to verify recovery code. Please try again later.';
      setCodeVerificationStatusMessage({
        type: 'error',
        text: error,
      });

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.reset_mfa_error, {
        'work email': user.email || '',
        role: user.role || '',
        origin: origin.value || '',
        error: error,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } finally {
      setIsVerifyingRecoveryCode(false);
    }
  };

  const handleMFACodeVerification = async (mfaCode) => {
    const { location } = history;
    const { canSwitchToOldMode = true } = config;
    const { pathname = '' } = location;
    const origin = Object.values(MIXPANEL_ORIGINS).find(
      (i) => i.path === pathname
    );

    setIsVerifyingMFACode(true);
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
        origin: origin.value || '',
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
        setResetStep(MFA_RESET_FLOW_STEPS.backup);
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        'Unable to enable MFA. Please try again later.';

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.setup_mfa_error, {
        'work email': user.email || '',
        role: user.role || '',
        origin: origin.value || '',
        error,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });

      setCodeVerificationStatusMessage({
        type: 'error',
        text: error,
      });
    } finally {
      setIsVerifyingMFACode(false);
    }
  };

  const handleRecoveryCodeClose = () => {
    showToast({
      title: 'MFA enabled successfully.',
      success: true,
    });
    onEnableSuccess();
  };

  const handleResetRequest = async () => {
    const { canSwitchToOldMode = true } = config;
    setIsRequestingReset(true);
    setCodeVerificationStatusMessage({
      type: '',
      text: '',
    });

    const payload = {};

    try {
      const response = await api.resetRequest({
        payload,
      });
      const { data } = _.get(response, 'responsePayload');

      const { location } = history;
      const { pathname = '' } = location;
      const origin = Object.values(MIXPANEL_ORIGINS).find(
        (i) => i.path === pathname
      );

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.request_mfa_reset, {
        'work email': user.email || '',
        role: user.role || '',
        origin: origin.value || '',
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });

      const message =
        data.message ||
        'Request for resetting multi-factor authentication is successful.';
      setResetRequestSuccessMessage(message);
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'error') ||
        'Unable to reset the MFA. Please try again later.';
      setCodeVerificationStatusMessage({
        type: 'error',
        text: error,
      });
    } finally {
      setIsRequestingReset(false);
    }
  };

  const renderResetFlow = () => {
    switch (resetStep) {
      case MFA_RESET_FLOW_STEPS.reset:
        return (
          <MFAResetView
            isModal={true}
            isSubmitting={isVerifyingRecoveryCode}
            onSubmit={handleRecoveryCodeVerification}
            onCloseModal={onExit}
            message={codeVerificationStatusMessage}
            isRequestingReset={isRequestingReset}
            onRequestReset={handleResetRequest}
            resetRequestSuccessMessage={resetRequestSuccessMessage}
            showBackToLogin={false}
          />
        );
      case MFA_RESET_FLOW_STEPS.setup:
        return (
          <MFASetupView
            isModal={true}
            mfaData={mfaData}
            message={codeVerificationStatusMessage}
            isLoading={isVerifyingMFACode}
            onSubmit={handleMFACodeVerification}
            onCloseModal={onExit}
          />
        );
      case MFA_RESET_FLOW_STEPS.backup:
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
    <AriaModal titleText={'disable mfa'} {...finalRootProps}>
      {renderResetFlow()}
    </AriaModal>
  );
}

export default withRouter(ResetMFAFlow);
