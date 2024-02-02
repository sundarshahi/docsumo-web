import React, { useState } from 'react';

import cx from 'classnames';
import copy from 'clipboard-copy';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
import { ReactComponent as CopyIcon } from 'new/assets/images/icons/copy-backup.svg';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';
import InputField from 'new/components/widgets/InputField';

import styles from './MFAView.scss';

function MFARecoveryCodeDisplayView(props) {
  const {
    isModal = false,
    onCloseModal = null,
    className = '',
    onSubmit,
    recoveryCode = 'MQ4D CMRT GAYD KY3G MRSD IOLD',
  } = props;

  const [isCopying, setIsCopying] = useState(false);
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  const handleSubmit = () => {
    onSubmit();
  };

  const handleCopy = () => {
    setIsCopying(true);
    copy(recoveryCode);

    setTimeout(() => {
      setIsCopying(false);
      setIsCopySuccess(true);
    }, 300);
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
      {isCopySuccess && (
        <p className={cx(styles.message, styles.message_success)}>
          Recovery code copied to clipboard!
        </p>
      )}
      <div className={styles.body}>
        <p className={styles.text}>
          You will need this recovery code if you want to sign in without your
          device
        </p>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <InputField
              name='recoveryCode'
              placeholder='123456'
              className={styles.inputField}
              readOnly={true}
              value={recoveryCode}
            />
            <Button
              className={cx(styles.iconButton)}
              appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
              isLoading={isCopying}
              disabled={isCopying}
              iconCenter={CopyIcon}
              isCenter={true}
              buttonAttributes={{
                type: 'button',
              }}
              onClick={handleCopy}
            />
          </div>
          <div className={cx(styles.buttonContainer)}>
            <Button
              className={cx(styles.button, styles.button_primary)}
              appearance={BUTTON_APPEARANCES.PRIMARY_COMPANY}
              text='Continue'
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MFARecoveryCodeDisplayView;
