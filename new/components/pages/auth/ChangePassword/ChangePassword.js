import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import * as api from 'new/api';
import { ReactComponent as SuccessIcon } from 'new/assets/images/icons/outline-circle-check.svg';
import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';
import ErrorMessageBlock from 'new/components/widgets/ErrorMessageBlock/ErrorMessageBlock';
import PasswordField from 'new/components/widgets/PasswordField';
import ROUTES from 'new/constants/routes';

import styles from './ChangePassword.scss';

class ChangePassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      password: '',
      confirmPassword: '',
      errorMsg: '',
      passwordChangeSuccess: false,
      isUpdating: false,
      isValidToken: true,
      errors: {},
    };
  }

  passwordInputRef = React.createRef();
  passwordFieldRef = React.createRef();
  confirmPasswordFieldRef = React.createRef();

  componentDidMount() {
    this.isTokenValid();

    if (this.passwordInputRef && this.passwordInputRef.current) {
      this.passwordInputRef.current.focus();
    }
  }

  isTokenValid = async () => {
    const parsedUrl = new URL(window.location.href);
    const token = parsedUrl.searchParams.get('fp_token');
    try {
      await api.validateToken({ token });
      this.setState({
        isValidToken: true,
        token,
      });
    } catch (e) {
      this.setState({
        isValidToken: false,
      });
    }
  };

  handlePasswordInputValue = ({ password }) => {
    this.setState({ password });
  };

  handleConfirmPasswordInputValue = ({ password }) => {
    this.setState({ confirmPassword: password });
  };

  handleFormSubmit = async (e) => {
    e.preventDefault();
    const { token, password, confirmPassword } = this.state;
    let errors = {};

    if (password !== confirmPassword) {
      errors.confirmPassword = 'New password values do not match.';
    }

    this.setState({ errors });

    // Validate the password user input
    const passwordError =
      this.passwordFieldRef && this.passwordFieldRef.current.validate();

    // Validate the confirm password user input
    const confirmPasswordError =
      this.confirmPasswordFieldRef &&
      this.confirmPasswordFieldRef.current.validate();

    if (!_.isEmpty(errors) || passwordError || confirmPasswordError) {
      return;
    }

    this.setState({ isUpdating: true });

    try {
      const { password } = this.state;
      await api.resetUserPassword({ password, token });
      this.setState({ passwordChangeSuccess: true });
    } catch (e) {
      const { error } =
        _.get(e.responsePayload, 'error') || 'Could not change the password.';
      this.showToastNotification({
        title: error,
        rootOverlayClassName: styles.toastErrorClass,
      });
    }
    this.setState({ isUpdating: false });
  };

  showToastNotification = ({ title, ...props }) => {
    showToast({
      ...props,
      title,
      rootOverlayClassName: styles.toastOverlayClass,
      error: true,
      duration: 1000,
      hideCloseButton: true,
    });
  };

  renderSuccessMessage = () => {
    return (
      <div className={styles.successBlock}>
        <SuccessIcon className={styles.icon} />
        <h2 className={styles.heading}>Password Changed!</h2>
        <p className={styles.text}>
          Your password has been changed successfully.
        </p>
        <Link
          to={ROUTES.LOGIN}
          className={styles.linkButton}
          title='Go to Login'
        >
          Login
        </Link>
      </div>
    );
  };

  renderForm = () => {
    const { password, confirmPassword, errorMsg, isUpdating, errors } =
      this.state;

    return (
      <>
        <h1 className={styles.heading}>Choose a new password</h1>
        {/* For server-side error */}
        <ErrorMessageBlock content={errorMsg} />
        <div className={styles.form}>
          <form method='post' onSubmit={this.handleFormSubmit}>
            <PasswordField
              name='password'
              label='Password'
              id='users-input-password'
              ref={this.passwordFieldRef}
              inputRef={this.passwordInputRef}
              handleInputValue={this.handlePasswordInputValue}
            />
            <PasswordField
              name='password'
              label='Confirm Password'
              id='users-input-confirm-password'
              ref={this.confirmPasswordFieldRef}
              error={errors.confirmPassword}
              secondaryPasswordField={true}
              handleInputValue={this.handleConfirmPasswordInputValue}
            />
            <div className={styles.buttonContainer}>
              <Button
                className={styles.button}
                text='Update Password'
                loadingText={'Updating...'}
                appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
                isLoading={isUpdating}
                disabled={!password || !confirmPassword}
              />
            </div>
          </form>
        </div>
      </>
    );
  };

  render() {
    const { passwordChangeSuccess, isValidToken } = this.state;

    if (!isValidToken) {
      this.showToastNotification({
        title: 'Invalid Link.',
        rootOverlayClassName: styles.toastErrorClass,
      });
      return (
        <Redirect
          to={{
            pathname: '/login/',
            state: { from: { ...this.props.location } },
          }}
        />
      );
    }

    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Link to={ROUTES.ROOT}>
              <img src={DOCSUMO_LOGO} alt='Docsumo' />
            </Link>
          </div>
          <div className={styles.card}>
            {passwordChangeSuccess
              ? this.renderSuccessMessage()
              : this.renderForm()}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProp({ app }) {
  return {
    user: app.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(ChangePassword);
