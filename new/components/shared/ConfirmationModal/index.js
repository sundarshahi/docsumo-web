import React from 'react';

import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'new/components/shared/Modal';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'new/components/widgets/buttons';

import styles from './index.scss';

const ConfirmationModal = (props) => {
  const {
    title,
    bodyText,
    proceedActionText,
    cancelActionText,
    onProceedActionBtnClick,
    onCancelActionBtnClick,
    onCloseBtnClick,
  } = props;

  return (
    <Modal
      className={styles.root}
      rootProps={{
        titleText: title,
      }}
    >
      <ModalHeader
        title={title}
        titleClassName={'ellipsis'}
        onCloseBtnClick={onCloseBtnClick || onCancelActionBtnClick}
      />

      <ModalContent>
        <p>{bodyText}</p>
      </ModalContent>

      <ModalFooter className={styles.footer}>
        <Button text={cancelActionText} onClick={onCancelActionBtnClick} />
        {proceedActionText && (
          <Button
            text={proceedActionText}
            appearance={BUTTON_APPEARANCES.PRIMARY_TRANSPARENT}
            onClick={onProceedActionBtnClick}
          />
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;
