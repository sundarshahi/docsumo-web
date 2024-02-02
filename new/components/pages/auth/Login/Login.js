import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as GoogleSignonIcon } from 'new/assets/images/icons/signon_google.svg';
import { ReactComponent as MicrosoftSignonIcon } from 'new/assets/images/icons/signon_microsoft.svg';
import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';
import DotLoader from 'new/components/widgets/dotLoader';
import ErrorMessageBlock from 'new/components/widgets/ErrorMessageBlock/ErrorMessageBlock.js';
import InputField from 'new/components/widgets/InputField';
import PasswordField from 'new/components/widgets/PasswordField';
import ROUTES from 'new/constants/routes';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import { signInAuthProvider } from 'new/thirdParty/firebase';
import * as googleAnalytics from 'new/thirdParty/googleAnalytics';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { validateLogin } from 'new/utils/validateLogin';
import isEmail from 'validator/lib/isEmail';

import SignonButton from '../components/socialSignon/SignonButton';

import styles from './Login.scss';

const WHITELISTED_REDIRECT_PATHS = [
  'review/',
  'skipped/',
  'processed/',
  'settings/',
  'review-document/',
];

class Login extends Component {
  state = {
    email: '',
    password: '',
    uiError: '',
    isAttemptingLogin: false,
    loading: false,
  };

  emailInputRef = React.createRef();
  passwordInputRef = React.createRef();

  componentDidMount() {
    const { history } = this.props;

    // Auto focus on email during first load
    if (this.emailInputRef && this.emailInputRef.current) {
      this.emailInputRef.current.focus();
    }

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.login_start);

    const { state } = _.get(history, 'location');

    if (state && state.uiError) {
      this.setState({
        uiError: state.uiError,
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { user, history } = this.props;

    if (prevProps.user !== user && !_.isEmpty(user)) {
      // Getting a valid user value means either the user is already
      // signed in, or a new auth attempt has just succeeded
      let redirectUrl = '/';
      try {
        const sourceLocation = this.props.location.state.from;
        if (sourceLocation) {
          const { pathname, search } = sourceLocation;
          // eslint-disable-next-line no-unused-vars
          for (const ignoredString of WHITELISTED_REDIRECT_PATHS) {
            if (pathname.indexOf(ignoredString) !== -1) {
              redirectUrl = `${pathname}${search}`;
              break;
            }
          }
        }
      } catch (e) {
        // Do nothing
      }
      history.push(redirectUrl);
    }
  }

  trackPageGaEvent = (action, properties = {}) => {
    googleAnalytics.trackEvent(action, {
      category: 'login',
      ...properties,
    });
  };

  handleInputChange = (event) => {
    const { errors } = this.state;
    let { name, value } = event.target;
    value = name !== 'email' ? _.trimStart(value) : _.trim(value);
    this.setState({
      [name]: value,
    });
    if (errors && errors[name]) {
      this.setState({ errors: { ...errors, [name]: '' } });
    }
  };

  handlePasswordInputValue = ({ password }) => {
    this.setState({ password });
  };

  handleLoginSuccess = async () => {
    const { user, config } = this.state;
    const {
      history,
      location: { state },
    } = this.props;
    const { setConfig, setUser, setTooltipOrigin } = this.props.appActions;
    // Set the config in app state
    await setConfig({ config });

    // Set the user in app state
    await setUser({ user });

    if (config && config.flags && config.flags.showTooltipFlow) {
      setTooltipOrigin('Login');
    }
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

  handleLogin = async (type = '') => {
    let error = '';
    const { email, password } = this.state;
    const isSocialLogin = !!(type === 'social');
    let payload = {
      email,
      password,
    };

    let mixpanelProperties = {
      'work email': email,
      type: 'email',
      step: 'login',
    };

    if (isSocialLogin) {
      const { SSOToken: { email = '', idToken = '', providerId = '' } = {} } =
        this.props;
      payload = {
        ...payload,
        email,
        id_token: idToken,
      };
      mixpanelProperties = {
        ...mixpanelProperties,
        'work email': email,
        providerId,
        type: 'social',
      };
    }

    try {
      const response = await api.loginAppUser(payload);
      const { token, user } = _.get(response.responsePayload, 'data');

      // API Client already updates the token, but still making an
      // additional action dispatch here to make sure it's not missed
      await this.props.appActions.setAuthToken({ token });

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

        const changePassword = _.get(config, 'flags.changePassword');

        if (changePassword) {
          history.push(ROUTES.UPDATE_PASSWORD, { isNewMember: true });
        } else {
          chameleonIdentifyUser(user, config);
          await this.handleLoginSuccess();
        }
      } catch (e) {
        // Config request has failed.
        // Reload the page and bootstrap the app again
        window.location = '/';
      }
    } catch (e) {
      //error
      error = _.get(e.responsePayload, 'error') || 'Failed to login';

      mixpanel.track(MIXPANEL_EVENTS.login_failed, {
        ...mixpanelProperties,
        error,
      });
    } finally {
      this.setState({
        isAttemptingLogin: false,
        uiError: error,
        loading: false,
      });
    }
  };

  handleFormSubmit = async (e) => {
    e.preventDefault();

    this.setState({ uiError: '' });

    const { email, isAttemptingLogin } = this.state;
    const { history } = this.props;

    if (isAttemptingLogin) {
      // Another request is already in progress
      return;
    }

    const errors = {};

    if (!email) {
      errors.email = 'Please enter your email address';
    }

    if (!isEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    const { password } =
      this.passwordInputRef && this.passwordInputRef.current.state;

    // Validate the password user input
    const passwordError =
      this.passwordInputRef && this.passwordInputRef.current.validate();

    if (!_.isEmpty(errors) || passwordError) {
      this.setState({
        ...this.state,
        errors,
        uiError: '',
      });
      this.trackPageGaEvent('login error', {
        label: `client - ${[errors.email, errors.password]
          .filter((val) => !!val)
          .join(', ')}`,
      });
      return;
    }

    this.setState({
      isAttemptingLogin: true,
      uiError: '',
    });

    try {
      const response = await validateLogin({
        type: 'email',
        email,
        password,
      });
      const { statusCode, responsePayload } = response;
      if (statusCode !== 200) {
        throw responsePayload;
      }
      const {
        data: { flags = {} },
      } = responsePayload;
      const {
        mfaEnable,
        mfaSetup,
        qrEncoding,
        textEncoding,
        mfaMessage = '',
      } = flags;
      if (mfaEnable) {
        history.push('/mfa', {
          mfaSetup,
          mfaEnable,
          qrEncoding,
          textEncoding,
          mfaMessage,
          email,
        });
      } else {
        this.handleLogin();
      }
    } catch (e) {
      const errorType = _.get(e, 'error') || '';
      const errorMessage = _.get(e, 'message') || 'Failed to validate';

      if (errorType === 'SSO_LOGIN') {
        history.push(ROUTES.LOGIN_WITH_SSO, {
          uiError: errorMessage,
        });
      } else {
        this.setState({
          isAttemptingLogin: false,
          uiError: errorMessage,
        });
      }
    }
  };

  handleSignupBtnClick = () => {
    localStorage.removeItem('signUpData');
    this.trackPageGaEvent('click - signup button');
    mixpanel.track(MIXPANEL_EVENTS.signup_start, { source: 'login' });
  };

  validateSocialLogin = async () => {
    const { SSOToken: { email = '', idToken = '' } = {}, history } = this.props;

    this.setState({ loading: true });

    try {
      const response = await validateLogin({
        type: 'social',
        email,
        idToken,
      });
      const responsePayload = response.responsePayload;
      if (responsePayload && responsePayload.statusCode !== 200) {
        throw responsePayload;
      }
      const {
        mfaEnable,
        mfaSetup,
        qrEncoding,
        textEncoding,
        mfaMessage = '',
      } = _.get(responsePayload.data, 'flags');
      if (mfaEnable) {
        history.push('/mfa', {
          mfaSetup,
          mfaEnable,
          qrEncoding,
          textEncoding,
          mfaMessage,
          email,
        });
      } else {
        this.handleLogin('social');
      }
    } catch (e) {
      const errorType = _.get(e, 'error') || '';
      const errorMessage =
        _.get(e, 'message') || 'Failed to validate social login.';

      if (errorType === 'SSO_LOGIN') {
        history.push(ROUTES.LOGIN_WITH_SSO, {
          uiError: errorMessage,
        });
      } else {
        this.setState({
          loading: false,
          uiError: errorMessage,
        });
      }
    }
  };

  signonBtnClickHandler = async ({ provider }) => {
    let uiError = '';

    this.setState({
      uiError,
      email: '',
      password: '',
      errors: { email: '', password: '' },
    });

    this.passwordInputRef.current.clearFieldValue({
      validation: false,
      password: '',
      socialSignon: true,
    });

    const { error, tokenResponse } = await signInAuthProvider({
      providerId: provider,
    });

    if (!_.isEmpty(error)) {
      this.setState({ uiError: error.message });
    } else if (!_.isEmpty(tokenResponse)) {
      // store SSOToken for global access
      await this.props.appActions.setSSOToken({ tokenResponse });

      // validate social login credentials
      await this.validateSocialLogin();
    }
  };

  handleRedirection = () => {
    const { location } = this.props;

    let redirectUrl = ROUTES.ROOT;

    if (!_.isEmpty(location?.state) && !_.isEmpty(location.state.from)) {
      const { pathname, search } = location?.state?.from;

      redirectUrl = pathname + search;
    }

    return <Redirect to={redirectUrl} />;
  };

  render() {
    const { email, isAttemptingLogin, errors, uiError, loading } = this.state;
    const { user } = this.props;

    const {
      location: { search },
    } = this.props;
    const urlSearchParams = new URLSearchParams(search);
    urlSearchParams.append('email', email);

    const forgotPasswordUrl = `${
      ROUTES.RESET_PASSWORD
    }?${urlSearchParams.toString()}`;

    if (user && !_.isEmpty(user)) {
      // Getting a valid user value means either the user is already
      // signed in, or a new signup attempt has just succeeded
      return this.handleRedirection();
    }

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
            {loading && (
              <DotLoader containerClassName={styles.loaderContainer} />
            )}
            <h1 className={styles.heading}>Login to your Docsumo account</h1>
            {uiError && (
              <ErrorMessageBlock
                className={styles.errorMessageBlock}
                content={uiError}
              />
            )}
            <div className={cx(styles.socialSignonBtnGroups)}>
              <SignonButton
                icon={<GoogleSignonIcon />}
                label={'Sign in with Google'}
                provider={'google'}
                handleClickEvent={this.signonBtnClickHandler}
              />
              <SignonButton
                icon={<MicrosoftSignonIcon />}
                label={'Sign in with Microsoft'}
                provider={'microsoft'}
                handleClickEvent={this.signonBtnClickHandler}
              />
            </div>
            <div className={styles.separatorLine}>
              <h3>OR</h3>
            </div>
            <div className={styles.form}>
              <form method='post' onSubmit={this.handleFormSubmit}>
                <InputField
                  name='email'
                  placeholder='janedoe@abc.com'
                  value={email}
                  label='Work Email'
                  id='users-input-email'
                  ref={this.emailInputRef}
                  disabled={isAttemptingLogin}
                  errorMsg={errors && errors.email}
                  onChange={this.handleInputChange}
                />
                <div className={styles.formGroup}>
                  <PasswordField
                    name='password'
                    placeholder='Enter password here...'
                    id='users-input-password'
                    label='Password'
                    validation={false}
                    className={styles.password}
                    ref={this.passwordInputRef}
                    disabled={isAttemptingLogin}
                    error={errors && errors.password}
                    handleInputValue={this.handlePasswordInputValue}
                  />
                </div>
                <div className={styles.secondaryLink}>
                  <Link to={forgotPasswordUrl} title='Forgot Password?'>
                    Forgot Password?
                  </Link>
                </div>
                <div className={styles.btnContainer}>
                  <Button
                    className={styles.button}
                    text={'Login'}
                    appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
                    loadingText={'Logging in...'}
                    isLoading={isAttemptingLogin}
                  />
                </div>
              </form>
            </div>
            <div className={styles.footer}>
              <div>
                <Link to={ROUTES.LOGIN_WITH_SSO}>Login with SSO</Link>
              </div>
              <div>
                <span className={styles.text}>Don't have an account?</span>
                &nbsp;&nbsp;
                <Link to={ROUTES.SIGNUP} onClick={this.handleSignupBtnClick}>
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
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

export default connect(mapStateToProp, mapDispatchToProps)(Login);
