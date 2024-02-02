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
import QRCode from 'react-qr-code';

import styles from './MFAView.scss';

function MFASetupView(props) {
  const {
    isModal = false,
    mfaData = {},
    className = '',
    isLoading = false,
    onSubmit,
    message = {},
    onCloseModal = null,
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

  if (_.isEmpty(mfaData)) return null;

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
          Download and install an authenticator app on your mobile device.
        </p>
        <p className={styles.text}>Scan the QR code below:</p>
        <div className={styles.qrImageBlock}>
          <QRCode
            size={150}
            value={mfaData.qrEncoding}
            viewBox={'0 0 256 256'}
          />
        </div>
        <p className={styles.text}>Text Code : {mfaData.textEncoding}</p>
        <div className={styles.form}>
          <form onSubmit={handleSubmit}>
            <InputField
              type='number'
              name='mfaCode'
              label='Enter 6-digit code below from the authenticator app'
              placeholder='123456'
              className={styles.inputField}
              value={mfaCode}
              onChange={handleInputChange}
              ref={mfaCodeInputRef}
            />
            <div className={styles.buttonContainer}>
              <Button
                className={styles.button}
                appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
                isLoading={isLoading}
                disabled={
                  _.isEmpty(mfaCode) || mfaCode.length !== 6 || isLoading
                }
                text='Continue'
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MFASetupView;
