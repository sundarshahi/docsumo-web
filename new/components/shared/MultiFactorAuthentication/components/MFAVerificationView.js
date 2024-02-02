import React, { useState } from 'react';

import cx from 'classnames';
import _ from 'lodash';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';
import InputField from 'new/components/widgets/InputField';
import { useAutofocus } from 'new/hooks/useAutofocus';

import styles from './MFAView.scss';

function MFAVerificationView(props) {
  const {
    isModal = false,
    onCloseModal = null,
    className = '',
    isLoading = false,
    message = {},
    onSubmit,
    onReset,
  } = props;

  const [mfaCode, setMfaCode] = useState('');

  const mfaCodeInputRef = useAutofocus();

  const handleInputChange = (e) => {
    const { value } = e.target;

    if (value.length <= 6) {
      setMfaCode(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mfaCode.length === 6) {
      onSubmit(mfaCode);
    }
  };

  const handlePopupClose = () => {
    if (onCloseModal) {
      onCloseModal();
    }
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
        <p className={styles.text}>
          Open up your authenticator app and enter the 6 digit code below
        </p>
        <div className={styles.form}>
          <form onSubmit={handleSubmit}>
            <InputField
              type='number'
              name='mfaCode'
              label='Enter 6-digit code below'
              placeholder='123456'
              className={styles.inputField}
              value={mfaCode}
              onChange={handleInputChange}
              ref={mfaCodeInputRef}
            />
            {isModal ? (
              <div className={cx(styles.buttonContainer)}>
                <Button
                  className={cx(styles.button, styles.button_primary)}
                  appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
                  isLoading={isLoading}
                  disabled={
                    _.isEmpty(mfaCode) || mfaCode.length !== 6 || isLoading
                  }
                  text='Continue'
                  buttonAttributes={{
                    type: 'submit',
                  }}
                />
              </div>
            ) : (
              <div
                className={cx(
                  styles.buttonContainer,
                  styles.buttonContainer_flex
                )}
              >
                <Button
                  className={cx(styles.button, styles.button_secondary)}
                  text='Reset'
                  appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY_TRANSPARENT}
                  buttonAttributes={{
                    type: 'button',
                  }}
                  onClick={onReset}
                />
                <Button
                  className={cx(styles.button, styles.button_primary)}
                  appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
                  isLoading={isLoading}
                  disabled={
                    _.isEmpty(mfaCode) || mfaCode.length !== 6 || isLoading
                  }
                  text='Continue'
                  buttonAttributes={{
                    type: 'submit',
                  }}
                />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default MFAVerificationView;
