import React from 'react';

import cx from 'classnames';
import { Button } from 'client/components/widgets/buttons';
import { ReactComponent as CheckIcon } from 'images/icons/check-rounded.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';

import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'components/shared/Modal';

import styles from './ConfirmationModal.scss';

function ConfirmationModal(props) {
  const {
    className,
    modalHeading = 'Confirm',
    modalContent,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isConfirmLoading = false,
    isCancelLoading = false,
    onCloseModal,
    onConfirm,
    onCancel,
  } = props;

  const handleCancel = () => {
    if (onCancel) onCancel();

    onCloseModal();
  };

  return (
    <Modal
      className={cx(styles.wrapper, className)}
      onExit={onCloseModal}
      rootProps={{
        titleText: modalHeading,
      }}
    >
      <ModalHeader
        title={modalHeading}
        className={styles.header}
        titleClassName={styles.title}
        closeBtnClassName={styles.closeBtn}
        onCloseBtnClick={onCloseModal}
      />
      <ModalContent className={styles.content}>
        <div className={styles.innerContent}>{modalContent}</div>
      </ModalContent>
      <ModalFooter className={styles.footer}>
        <Button
          iconLeft={CloseIcon}
          disabled={isCancelLoading}
          className={cx(styles.ctaBtn, styles.ctaBtn_secondary)}
          onClick={handleCancel}
        >
          {cancelText}
        </Button>
        <Button
          iconLeft={CheckIcon}
          disabled={isConfirmLoading}
          isLoading={isConfirmLoading}
          className={cx(styles.ctaBtn, styles.ctaBtn_primary)}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ConfirmationModal;
