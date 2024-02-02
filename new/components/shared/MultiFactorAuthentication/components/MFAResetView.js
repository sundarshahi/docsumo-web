import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import cx from 'classnames';
import _ from 'lodash';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';
import InputField from 'new/components/widgets/InputField';
import ROUTES from 'new/constants/routes';
import { useAutofocus } from 'new/hooks/useAutofocus';

import styles from './MFAView.scss';

function MFAResetView(props) {
  const {
    isModal = false,
    onCloseModal = null,
    className = '',
    isSubmitting = false,
    isRequestingReset = false,
    onSubmit,
    onRequestReset = null,
    message = {},
    resetRequestSuccessMessage = '',
    showRequestReset = true,
    showBackToLogin = true,
  } = props;

  const [recoveryCode, setRecoveryCode] = useState('');

  const recoveryCodeInputRef = useAutofocus();

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(recoveryCode);
  };

  const handleInputChange = (e) => {
    const { value } = e.target;

    setRecoveryCode(value);
  };

  const handlePopupClose = () => {
    if (onCloseModal) {
      onCloseModal();
    }
  };

  const renderResetRequestSuccess = () => {
    return (
      <>
        <p className={styles.text}>{resetRequestSuccessMessage}</p>
        {showBackToLogin && (
          <div className={cx(styles.buttonContainer)}>
            <Link className={cx(styles.buttonLink)} to={ROUTES.LOGIN}>
              Back to Login
            </Link>
          </div>
        )}
      </>
    );
  };

  const renderResetForm = () => {
    return (
      <>
        <p className={styles.text}>
          Enter the recovery code that you have saved when enrolling for
          multi-factor authentication
        </p>
        <div className={styles.form}>
          <form onSubmit={handleSubmit}>
            <InputField
              name='recoveryCode'
              placeholder='ABCD 1234 WXYZ 5678'
              className={styles.inputField}
              value={recoveryCode}
              onChange={handleInputChange}
              ref={recoveryCodeInputRef}
            />
            <div className={cx(styles.buttonContainer)}>
              <Button
                buttonAttributes={{
                  type: 'submit',
                }}
                className={cx(styles.button, styles.button_primary)}
                appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
                text='Reset'
                isLoading={isSubmitting}
                disabled={_.isEmpty(recoveryCode) || isSubmitting}
              />
            </div>
          </form>
        </div>
        {showRequestReset && (
          <div className={styles.align_center}>
            <p className={styles.text}>Facing issues with authentication?</p>
            <Button
              buttonAttributes={{
                type: 'button',
              }}
              text='Request Reset'
              isLoading={isRequestingReset}
              disabled={isRequestingReset}
              onClick={onRequestReset}
              className={styles.button_tertiary}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className={cx(styles.container, className)}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Multi Factor Authentication</h1>
        {isModal ? (
          <CloseIcon onClick={handlePopupClose} className={styles.closeBtn} />
        ) : null}
      </div>
      {!_.isEmpty(message) && message.text && (
        <p className={cx(styles.message, styles[`message_${message.type}`])}>
          {message.text}
        </p>
      )}
      <div className={styles.body}>
        {resetRequestSuccessMessage
          ? renderResetRequestSuccess()
          : renderResetForm()}
      </div>
    </div>
  );
}

export default MFAResetView;
