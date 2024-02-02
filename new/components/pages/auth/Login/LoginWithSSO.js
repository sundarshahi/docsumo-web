/* eslint-disable simple-import-sort/imports */
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import React, { useEffect, useState } from 'react';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';

import * as api from 'new/api';

import isEmail from 'validator/lib/isEmail';

import ROUTES from 'new/constants/routes';

import { validateLogin } from 'new/utils/validateLogin';

import { actions as appActions } from 'new/redux/app/actions';

import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { signInAuthProvider } from 'new/thirdParty/firebase';

import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';
import InputField from 'new/components/widgets/InputField';
import ErrorMessageBlock from 'new/components/widgets/ErrorMessageBlock/ErrorMessageBlock.js';

import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';

import styles from './Login.scss';
import { useAutofocus } from 'new/hooks/useAutofocus';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';

function LoginWithSSO(props) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [uiError, setUiError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const emailInputRef = useAutofocus();

  useEffect(() => {
    const { history } = props;

    const { state } = _.get(history, 'location');

    if (state && state.uiError) {
      setUiError(state.uiError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    setEmailError('');
  };

  const handleLoginSuccess = async (user, config) => {
    const {
      history,
      appActions,
      location: { state },
    } = props;
    const { setConfig, setUser } = appActions;

    // Set the config in app state
    await setConfig({ config });

    // Set the user in app state
    await setUser({ user });

    setIsLoggingIn(false);

    if (user.userId === user.orgId) {
      const _hsq = (window._hsq = window._hsq || []);
      _hsq.push([
        'identify',
        {
          email: user.email,
        },
      ]);
    }

    if (state && state?.from) {
      const { pathname, search } = state?.from;
      history.push(pathname + search);
    } else {
      history.push(ROUTES.ROOT);
    }
  };

  const handleLogin = async (idToken) => {
    const { appActions, history } = props;

    const mixpanelProperties = {
      'work email': email,
      type: 'single sign-on',
      step: 'login',
    };

    try {
      const response = await api.loginAppUser({
        email,
        id_token: idToken,
      });
      const { token, user } = _.get(response.responsePayload, 'data');

      // API Client already updates the token, but still making an
      // additional action dispatch here to make sure it's not missed
      await appActions.setAuthToken({ token });

      // Add mixpanel event
      mixpanel.identify(user.userId);
      mixpanel.track(MIXPANEL_EVENTS.login_complete, mixpanelProperties);

      try {
        const [userResponse, configResponse] = await Promise.all([
          api.getUser(),
          api.getConfig(),
        ]);
        const user = _.get(userResponse.responsePayload, 'data.user');
        const config = _.get(configResponse.responsePayload, 'data');

        this.setState({
          config,
          user,
          isAttemptingLogin: false,
        });

        chameleonIdentifyUser(user, config);

        const changePassword = _.get(config, 'flags.changePassword');

        if (changePassword) {
          history.push(ROUTES.UPDATE_PASSWORD, { isNewMember: true });
        } else {
          await handleLoginSuccess(user, config);
        }
      } catch (e) {
        // Config request has failed.
        // Reload the page and bootstrap the app again
        window.location = '/';
      }
    } catch (e) {
      const error = _.get(e.responsePayload, 'message') || 'Failed to login';
      setIsLoggingIn(false);
      setUiError(error);
      mixpanel.track(MIXPANEL_EVENTS.login_failed, {
        ...mixpanelProperties,
        error,
      });
    }
  };

  const validateSingleSignonLogin = async (idToken) => {
    const { history } = props;

    try {
      const response = await validateLogin({
        type: 'sso',
        email,
        idToken,
      });
      const data = _.get(response.responsePayload, 'data');

      const {
        mfaEnable,
        mfaSetup,
        qrEncoding,
        mfaMessage = '',
      } = _.get(data, 'flags');

      if (mfaEnable) {
        history.push('/mfa', {
          mfaSetup,
          mfaEnable,
          qrEncoding,
          email,
          mfaMessage,
        });
      } else {
        handleLogin(idToken);
      }
    } catch (e) {
      const uiError =
        _.get(e.responsePayload, 'message') ||
        'Failed to validate SSO ID token.';
      setIsLoggingIn(false);
      setUiError(uiError);
    }
  };

  const authenticateSSOUser = async (ssoProvider) => {
    const { error, tokenResponse } = await signInAuthProvider({
      providerId: ssoProvider.providerId,
      type: 'SSO',
    });
    if (!_.isEmpty(error)) {
      setUiError(error.message);
      return null;
    } else if (!_.isEmpty(tokenResponse)) {
      return tokenResponse.idToken || '';
    } else {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    const { history } = props;
    e.preventDefault();

    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!isEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    let payload = {
      email,
    };

    setIsLoggingIn(true);

    try {
      const response = await api.getSsoProvider({ payload });
      const providerData = _.get(response.responsePayload, 'data');

      if (_.isEmpty(providerData) || _.isEmpty(providerData.ssoProvider)) {
        setUiError('SSO Provider ID not found. Please try again later.');
        return;
      }

      const idToken = await authenticateSSOUser(providerData.ssoProvider);

      if (!idToken) {
        setUiError('ID token not found.');
        setIsLoggingIn(false);
        return;
      }

      await validateSingleSignonLogin(idToken);
    } catch (e) {
      const error = _.get(e.responsePayload, 'error');
      const message = _.get(e.responsePayload, 'message');

      if (error === 'EMAIL_LOGIN') {
        history.push(ROUTES.LOGIN, {
          uiError: message,
        });
        return;
      } else {
        setUiError(message);
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to={ROUTES.ROOT}>
            <img
              className={styles.company_logo}
              src={DOCSUMO_LOGO}
              alt='Docsumo'
            />
          </Link>
        </div>
        <div className={styles.card}>
          <h1 className={styles.heading}>Login using SSO</h1>
          {uiError && (
            <ErrorMessageBlock
              className={styles.errorMessageBlock}
              content={uiError}
            />
          )}
          <div className={styles.form}>
            <form method='post' onSubmit={handleSubmit}>
              <InputField
                name='email'
                placeholder='janedoe@abc.com'
                label='Work Email'
                id='users-input-email'
                onChange={handleEmailChange}
                value={email}
                errorMsg={emailError}
                ref={emailInputRef}
              />
              <div className={styles.btnContainer}>
                <Button
                  className={styles.button}
                  text='Login'
                  appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
                  isLoading={isLoggingIn}
                  disabled={!email}
                  loadingText='Logging in...'
                />
              </div>
            </form>
          </div>

          <div className={styles.footer}>
            <div>
              <Link to={ROUTES.LOGIN}>Login with email and password</Link>
            </div>
            <div>
              <span className={styles.text}>Don't have an account?</span>
              &nbsp;&nbsp;
              <Link to={ROUTES.SIGNUP}>Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function mapStateToProp({ app }) {
  return {
    user: app.user,
    SSOToken: app.SSOToken,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(LoginWithSSO);
