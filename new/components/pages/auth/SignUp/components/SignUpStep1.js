/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import cx from 'classnames';
import _ from 'lodash';
import { ReactComponent as LinkIcon } from 'new/assets/images/icons/arrow-up-diagonal.svg';
import { ReactComponent as RightIcon } from 'new/assets/images/icons/chevron-right-rounded.svg';
import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error_confidence.svg';
import { ReactComponent as GoogleSignonIcon } from 'new/assets/images/icons/signon_google.svg';
import { ReactComponent as MicrosoftSignonIcon } from 'new/assets/images/icons/signon_microsoft.svg';
import ARBOR_LOGO from 'new/assets/images/logos/arbor.png';
import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';
import HITACHI_LOGO from 'new/assets/images/logos/hitachi.png';
import JONES_LOGO from 'new/assets/images/logos/jones.png';
import NDR_LOGO from 'new/assets/images/logos/ndr.png';
import PAYU_LOGO from 'new/assets/images/logos/payu.png';
import RHO_LOGO from 'new/assets/images/logos/rho.png';
import VALTATECH_LOGO from 'new/assets/images/logos/valtatech-n-1.png';
import WESTLAND_LOGO from 'new/assets/images/logos/westland.png';
import ZIUM_LOGO from 'new/assets/images/logos/zium.png';
import PasswordField from 'new/components/widgets/PasswordField';
import ROUTES from 'new/constants/routes';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { useAutofocus } from 'new/hooks/useAutofocus';
import { signInAuthProvider } from 'new/thirdParty/firebase';
import Button from 'new/ui-elements/Button/Button';
import Input from 'new/ui-elements/Input/Input';

import SignonButton from '../../components/socialSignon/SignonButton';

import styles from '../SignUp.scss';

const ErrorMessage = ({ message }) => (
  <div className={styles.errorMessage}>
    <ErrorIcon />
    <p>{message}</p>
  </div>
);

function SignUpStep1(props) {
  const {
    fullName,
    email,
    password,
    passwordInputRef,
    onInputChange,
    onPhoneInputChange,
    onPasswordInputChange,
    onNext,
    isRequesting,
    appActions,
    phone,
    validateCompanyEmail,
  } = props;

  const [signonError, setSignonError] = useState({});
  const [errors, setErrors] = useState({});

  const fullNameRef = useAutofocus();

  useEffect(() => {
    setErrors(props.errors);
    setSignonError(props.signonError);
  }, [props.errors, props.signonError]);

  const signonBtnClickHandler = async ({ provider }) => {
    const { updateToNextStepFromSocialSignon, clearFirstStepFieldValues } =
      props;

    setSignonError({});
    setErrors({});
    clearFirstStepFieldValues();
    passwordInputRef.current.clearFieldValue({
      validation: false,
      password: '',
      socialSignon: true,
    });

    const { error, tokenResponse } = await signInAuthProvider({
      providerId: provider,
    });

    if (!_.isEmpty(error)) {
      setSignonError(error);
    } else if (!_.isEmpty(tokenResponse)) {
      // store SSOToken for global access
      await appActions.setSSOToken({ tokenResponse });

      updateToNextStepFromSocialSignon(tokenResponse.email || '');
    }
  };

  const handleInputChange = (e) => {
    setSignonError({});
    onInputChange(e);
  };

  const handlePasswordInputChange = (e) => {
    setSignonError({});
    onPasswordInputChange(e);
  };

  const areAllKeysNull = (objects) =>
    _.every(objects, (obj) => _.every(_.values(obj), _.isNull));

  return (
    <>
      <div className={styles.sidebar}>
        <div className={styles.sidebar_logoContainer}>
          <Link to={ROUTES.ROOT}>
            <img src={DOCSUMO_LOGO} alt='Docsumo' />
          </Link>
        </div>
        <div className={styles.sidebar_content}>
          <div className={styles.sidebar_card}>
            <div>
              <img src={ARBOR_LOGO} alt='Arbor' />
              <img src={NDR_LOGO} alt='National Debt Relief' />
              <img src={RHO_LOGO} alt='EXL' />
            </div>
            <div>
              <img src={VALTATECH_LOGO} alt='Valtatech' />
              <img src={JONES_LOGO} alt='Jones' />
              <img src={ZIUM_LOGO} alt='Zium' />
            </div>
            <div>
              <img src={HITACHI_LOGO} alt='Hitachi' />
              <img src={WESTLAND_LOGO} alt='Westland Real Estate Group' />
              <img src={PAYU_LOGO} alt='PayU' />
            </div>
          </div>
          <p className={cx(styles.sidebar_text, styles.sidebar_text__primary)}>
            Trusted by the world’s most
            <br />
            data-driven businesses
          </p>
        </div>
      </div>
      <div className={cx(styles.content, styles.content_step1)}>
        <div className={styles.content_body}>
          <h1
            className={cx(
              styles.content_heading,
              styles.content_heading__primary
            )}
          >
            Sign up for Docsumo
          </h1>
          <p className={styles.content_subText}>
            Create 14 days free trial account
          </p>
          <div className={styles.content_socialSignonContent}>
            <span className={styles.heading}>Sign up with your work email</span>
            <div
              className={cx(styles.btnGroups, {
                [styles.marginBottom]: !_.isEmpty(signonError),
              })}
            >
              <SignonButton
                icon={<GoogleSignonIcon />}
                label={'Continue with Google'}
                provider={'google'}
                handleClickEvent={signonBtnClickHandler}
              />
              <SignonButton
                icon={<MicrosoftSignonIcon />}
                label={'Continue with Microsoft'}
                provider={'microsoft'}
                handleClickEvent={signonBtnClickHandler}
              />
            </div>
            {signonError && signonError.message && (
              <ErrorMessage message={signonError.message} />
            )}
            <div
              className={cx(styles.separatorLine, {
                [styles.marginTop]: !_.isEmpty(signonError),
              })}
            >
              <h3>OR</h3>
            </div>
          </div>
          <div className={styles.form}>
            <form onSubmit={onNext} id='signup-form-step-1'>
              <div className={styles.form_field}>
                <label className={styles.label}>Full Name</label>
                <Input
                  name='fullName'
                  placeholder='Enter full name'
                  value={fullName}
                  label='Full name'
                  id='users-input-full-name'
                  autoComplete='off'
                  onChange={onInputChange}
                  hasError={Boolean(errors && errors.fullName)}
                  className={styles.input}
                  errorText={errors && errors.fullName}
                  ref={fullNameRef}
                />
              </div>
              <div className={styles.form_field}>
                <label className={styles.label}>Work Email</label>
                <Input
                  name='email'
                  placeholder='Enter company email address'
                  value={email}
                  label='Work email'
                  autoComplete='new-password'
                  id='users-input-email'
                  onChange={onInputChange}
                  hasError={Boolean(errors && errors.email)}
                  className={styles.input}
                  errorText={errors && errors.email}
                  onBlur={validateCompanyEmail}
                />
              </div>
              <div className={styles.form_field}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={styles.label}>Phone Number</label>
                <Input
                  type='phone'
                  name='phone'
                  placeholder='Enter your phone number'
                  value={phone}
                  label='Phone number'
                  autoComplete='new-password'
                  id='users-input-phone'
                  onChange={onPhoneInputChange}
                  hasError={Boolean(errors && errors.phone)}
                  className={styles.input}
                  errorText={errors && errors.phone}
                />
              </div>
              <PasswordField
                name='password'
                label='Password'
                placeholder='Set your password'
                id='users-input-password'
                autoComplete='new-password'
                handleInputValue={handlePasswordInputChange}
                value={password}
                className={cx(styles.input, styles.input_password)}
                showErrorIcon={true}
                ref={passwordInputRef}
              />
              <div className={styles.content_btnContainer}>
                <Button
                  isLoading={isRequesting}
                  className={styles.button}
                  variant={'contained'}
                  type='submit'
                  colorScheme='primary'
                  disabled={!areAllKeysNull(errors)}
                >
                  <span className={styles.buttonText}>Next</span>
                  <RightIcon />
                </Button>
              </div>
              <p className={styles.content_infoText}>
                <span>By Clicking on "Next" you agree to the&nbsp;</span>
                <span>
                  <a
                    href={SUPPORT_LINK.TERMS}
                    title='Terms of Service'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Terms of Service
                  </a>
                </span>
                <br />
                &nbsp;and&nbsp;
                <span>
                  <a
                    href={SUPPORT_LINK.PRIVACY_POLICY}
                    title='Privacy Policy'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Privacy Policy
                  </a>
                </span>
                .
              </p>
            </form>
          </div>
        </div>
        <div className={styles.content_footer}>
          <span>Already have an account?</span>
          &nbsp;&nbsp;
          <Link to='/login/' className={styles.link}>
            <span>Login</span>
            <LinkIcon />
          </Link>
        </div>
      </div>
    </>
  );
}

export default SignUpStep1;
