import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import * as api from 'new/api';
import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';
import InputField from 'new/components/widgets/InputField';
import ROUTES from 'new/constants/routes';
import { SUPPORT_LINK } from 'new/constants/urllink';
import isEmail from 'validator/lib/isEmail';

import styles from './ResetPassword.scss';

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      emailError: '',
      isSubmiting: false,
      resetPasswordSuccess: false,
    };

    this.passwordInputRef = React.createRef(null);
  }

  componentDidMount() {
    if (this.passwordInputRef && this.passwordInputRef.current) {
      this.passwordInputRef.current.focus();
    }
    const {
      location: { search },
    } = this.props;
    const searchParams = new URLSearchParams(search);
    const email = searchParams.get('email');
    this.setState({ email });
  }

  handleInputChange = (event) => {
    const { errors } = this.state;
    const { name, value } = event.target;

    this.setState({ [name]: value, [`${name}Error`]: '' });

    if (errors && errors[name]) {
      this.setState({ errors: { ...errors, [name]: '' } });
    }
  };

  handleFormSubmit = async (e) => {
    e.preventDefault();

    const { email } = this.state;
    const errors = {};

    if (!email) {
      errors.email = 'Please enter your email address';
    }

    if (!isEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!_.isEmpty(errors)) {
      this.setState({
        ...this.state,
        errors,
      });
      return;
    }

    this.setState({ isSubmiting: true });

    try {
      const response = await api.forgetUserPassword({ email });
      const { status } = response.responsePayload;
      if (status === 200) {
        this.setState({ resetPasswordSuccess: true });
      }
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'error') || 'Failed to reset the password.';
      this.showToastNotification({
        title: error,
        rootOverlayClassName: styles.toastErrorClass,
      });
    }
    this.setState({ isSubmiting: false });
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

  renderResetPasswordSuccess = () => {
    return (
      <>
        <h1 className={styles.heading}>Check your email for a reset link</h1>
        <p className={styles.text}>
          If you don’t find the email in your inbox, check your spam folder.
        </p>
        <div className={styles.message_content}>
          <p className={styles.text}>
            <ul>
              <li>
                Only users already registered with Docsumo can apply for a new
                password.
              </li>
              <li>
                Contact us at{' '}
                <a
                  href={SUPPORT_LINK.ROOT}
                  target='_blank'
                  rel='noopener noreferrer'
                  title='Knowledge Base'
                  className={styles.link}
                >
                  support@docsumo.com
                </a>{' '}
                if you didn’t receive the password reset link.
              </li>
            </ul>
          </p>
          <Link
            to={ROUTES.LOGIN}
            className={styles.linkButton}
            title='Return to Login'
          >
            Return to Login
          </Link>
        </div>
      </>
    );
  };

  renderForm = () => {
    const { email, isSubmiting, errors } = this.state;

    return (
      <>
        <h1 className={styles.heading}>Reset your password</h1>
        <p className={styles.text}>
          Fear not. We’ll email you the instructions to reset your password.
        </p>
        <div className={styles.form}>
          <form method='post' onSubmit={this.handleFormSubmit}>
            <div>
              <InputField
                name='email'
                placeholder='janedoe@abc.com'
                id='users-input-email'
                label='Work email'
                value={email}
                errorMsg={errors && errors.email}
                onChange={this.handleInputChange}
                ref={this.passwordInputRef}
              />
            </div>
            <div className={styles.buttonGroup}>
              <Button
                className={styles.button}
                text='Submit'
                loadingText={'Submiting...'}
                appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
                isLoading={isSubmiting}
                disabled={!email}
              />
              <Link
                to={ROUTES.LOGIN}
                title='Return to Login'
                className={styles.link}
              >
                Return to Login
              </Link>
            </div>
          </form>
        </div>
      </>
    );
  };

  render() {
    const { resetPasswordSuccess } = this.state;
    const { user } = this.props;

    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Link to={ROUTES.ROOT}>
              <img src={DOCSUMO_LOGO} alt='Docsumo' />
            </Link>
          </div>
          <div className={styles.card}>
            {resetPasswordSuccess
              ? this.renderResetPasswordSuccess()
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

export default connect(mapStateToProp, mapDispatchToProps)(ResetPassword);
