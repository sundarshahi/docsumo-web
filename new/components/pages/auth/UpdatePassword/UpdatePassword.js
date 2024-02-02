import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import * as api from 'new/api';
import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';
import { PageMetadata } from 'new/components/layout/page';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';
import ErrorMessageBlock from 'new/components/widgets/ErrorMessageBlock/ErrorMessageBlock';
import PasswordField from 'new/components/widgets/PasswordField';
import ROUTES from 'new/constants/routes';
import {
  chameleonIdentifyUser,
  NEW_USER_FLAGS,
} from 'new/thirdParty/chameleon';
import * as googleAnalytics from 'new/thirdParty/googleAnalytics';

import styles from './UpdatePassword.scss';

class UpdatePassword extends Component {
  state = {
    tempPassword: '',
    password: '',
    confirmPassword: '',
    errors: {},
    errorMsg: '',
    isUpdating: false,
  };

  tempPasswordInputFieldRef = React.createRef();
  tempPasswordInputRef = React.createRef();
  passwordInputRef = React.createRef();
  confirmPasswordInputRef = React.createRef();

  componentDidMount() {
    if (
      this.tempPasswordInputFieldRef &&
      this.tempPasswordInputFieldRef.current
    ) {
      this.tempPasswordInputFieldRef.current.focus();
    }
  }

  handleTempPasswordInputValue = ({ password }) => {
    this.setState({ tempPassword: password });
  };

  handlePasswordInputValue = ({ password }) => {
    this.setState({ password });
  };

  handleConfirmPasswordInputValue = ({ password }) => {
    this.setState({ confirmPassword: password });
  };

  handleUpdatePasswordSuccess = async () => {
    const {
      appActions: { setLocalConfigFlags, setConfigFlags, setConfig, setUser },
      history,
      location: { state },
    } = this.props;

    try {
      const [userResponse, configResponse] = await Promise.all([
        api.getUser(),
        api.getConfig(),
      ]);
      const user = _.get(userResponse.responsePayload, 'data.user');
      const config = _.get(configResponse.responsePayload, 'data');

      // Identify user in chameleon
      const currentDate = new Date();
      await chameleonIdentifyUser(
        user,
        config,
        {
          signed_up_at: currentDate.toISOString(),
          is_new_user: true,
          ...NEW_USER_FLAGS,
        },
        true
      );

      // Set the config in app state
      await setConfig({ config });

      // Set the user in app state
      await setUser({ user });

      await setLocalConfigFlags({ changePassword: false });

      setConfigFlags({ changePassword: false });

      //Redirection happening here
      if (state && state?.from) {
        const { pathname, search } = state?.from;
        history.push(pathname + search, { isNewMember: false });
      } else {
        history.push(ROUTES.ROOT, { isNewMember: false });
      }
    } catch (e) {
      // Redirecting to login page when there's no active login user.
      history.push(ROUTES.LOGIN);
    }
  };

  validateForm = () => {
    const { password, confirmPassword } = this.state;

    const tempPassword =
      this.tempPasswordInputRef &&
      this.tempPasswordInputRef.current.state.password;

    let errors = {};

    if (password !== confirmPassword) {
      errors.confirmPassword = 'New password values do not match.';
    }

    if (tempPassword === password) {
      errors.password = 'New password cannot be same as the old password';
    }

    this.setState({ errors });

    // Validate the temporary password user input
    const tempPasswordError =
      this.tempPasswordInputRef && this.tempPasswordInputRef.current.validate();

    // Validate the password user input
    const passwordError =
      this.passwordInputRef && this.passwordInputRef.current.validate();

    // Validate the confirm password user input
    const confirmPasswordError =
      this.confirmPasswordInputRef &&
      this.confirmPasswordInputRef.current.validate();

    if (
      !_.isEmpty(errors) ||
      tempPasswordError ||
      passwordError ||
      confirmPasswordError
    ) {
      return false;
    } else {
      return true;
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { password, isUpdating } = this.state;

    googleAnalytics.trackEvent('update temporary password');

    if (isUpdating) return;

    const isValid = this.validateForm();

    if (!isValid) return;

    this.setState({ isUpdating: true });

    const tempPassword =
      this.tempPasswordInputRef &&
      this.tempPasswordInputRef.current.state.password;

    try {
      await api.changeUserPassword({
        oldPassword: tempPassword,
        newPassword: password,
      });

      await this.handleUpdatePasswordSuccess();

      this.setState({
        isUpdating: false,
      });
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'error') || 'Failed to update password';
      this.setState({
        isUpdating: false,
        errorMsg: error,
      });
    }
  };

  render() {
    const { password, confirmPassword, errors, errorMsg, isUpdating } =
      this.state;
    const {
      location: { state },
    } = this.props;

    if (!state || !state.isNewMember) {
      return <Redirect to={ROUTES.ROOT} />;
    }

    return (
      <>
        <PageMetadata title='Update Password' />
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.header}>
              <Link to={ROUTES.ROOT}>
                <img src={DOCSUMO_LOGO} alt='Docsumo' />
              </Link>
            </div>
            <div className={styles.card}>
              <h1 className={styles.heading}>Update Password</h1>
              <p className={styles.text}>
                Welcome to Docsumo, update your password to complete
                registration.
              </p>
              <ErrorMessageBlock content={errorMsg} />
              <div className={styles.form}>
                <form>
                  <PasswordField
                    name='password'
                    label='Temporary Password'
                    id='users-input-temp-password'
                    validation={false}
                    ref={this.tempPasswordInputRef}
                    inputRef={this.tempPasswordInputFieldRef}
                    handleInputValue={this.handleTempPasswordInputValue}
                  />
                  <PasswordField
                    name='password'
                    label='Password'
                    id='users-input-password'
                    ref={this.passwordInputRef}
                    error={errors.password}
                    handleInputValue={this.handlePasswordInputValue}
                  />
                  <PasswordField
                    name='password'
                    label='Confirm Password'
                    id='users-input-confirm-password'
                    ref={this.confirmPasswordInputRef}
                    error={errors.confirmPassword}
                    secondaryPasswordField={true}
                    handleInputValue={this.handleConfirmPasswordInputValue}
                  />
                  <div className={styles.buttonContainer}>
                    <Button
                      className={styles.button}
                      text='Update Password'
                      appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
                      onClick={this.handleSubmit}
                      isLoading={isUpdating}
                      loaderClassName={styles.btnLoader}
                      disabled={!password || !confirmPassword || isUpdating}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(UpdatePassword);
