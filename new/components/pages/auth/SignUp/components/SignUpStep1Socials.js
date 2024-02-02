/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { NavArrowLeft } from 'iconoir-react';
import { ReactComponent as RightIcon } from 'new/assets/images/icons/chevron-right-rounded.svg';
import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';
import { ReactComponent as SignUpImage } from 'new/assets/images/signup-step-1-socials.svg';
import ROUTES from 'new/constants/routes';
import Badge from 'new/ui-elements/Badge';
import Button from 'new/ui-elements/Button/Button';
import Input from 'new/ui-elements/Input/Input';

import styles from '../SignUp.scss';

function SignUpStep1Socials(props) {
  const { onPhoneInputChange, onNext, onBack, phone } = props;

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors(props.errors);
  }, [props.errors]);

  return (
    <>
      <div className={styles.sidebar}>
        <div className={styles.sidebar_logoContainer}>
          <Link to={ROUTES.ROOT}>
            <img src={DOCSUMO_LOGO} alt='Docsumo' />
          </Link>
        </div>
        <div className={styles.sidebar_content}>
          <SignUpImage />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.secondaryBtnContainer}>
          <button
            type='button'
            onClick={onBack}
            className={styles.secondaryBtn}
          >
            <NavArrowLeft />
            <span>Back</span>
          </button>
        </div>
        <div className={styles.content_body}>
          <Badge className={styles.content_stepper} title={'Step 1/3'} />
          <h1 className={styles.content_subheading}>Enter your phone number</h1>
          <div className={styles.form}>
            <form onSubmit={onNext} id='signup-form-step-1-socials'>
              <div className={styles.form_field}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={styles.label}>Phone</label>

                <Input
                  type='phone'
                  name='phone'
                  placeholder='Enter your phone number'
                  value={phone}
                  label='Phone number'
                  id='users-input-phone'
                  autoComplete='new-password'
                  onChange={onPhoneInputChange}
                  hasError={Boolean(errors && errors.phone)}
                  className={styles.input}
                  errorText={errors && errors.phone}
                />
              </div>

              <div className={styles.content_btnContainer}>
                <Button
                  variant={'contained'}
                  className={styles.button}
                  type='submit'
                >
                  <span className={styles.buttonText}>Next</span>
                  <RightIcon />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpStep1Socials;
