import React, { useEffect } from 'react';

import cx from 'classnames';
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'new/components/shared/Modal';
import Button from 'new/ui-elements/Button/Button';

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
    processingBtn,
    processIcon,
    cancelIcon,
    centerFooter,
    cancellingBtn,
    reverse,
    duplicateHeader,
    primaryBtnClassName,
    toast,
    appActions,
  } = props;
  useEffect(() => {
    if (toast) {
      appActions.removeToast({
        id: toast?.id,
      });
    }
  }, [toast]);
  let styleObj = {
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
  };
  return (
    <Modal
      className={styles.root}
      onExit={reverse ? '' : onCancelActionBtnClick || onCloseBtnClick}
      rootProps={{
        titleText: title,
      }}
    >
      <ModalHeader
        title={title}
        titleClassName={cx('ellipsis', styles.title)}
        className={styles.header}
        closeBtnClassName={styles.closeBtnClassName}
        onCloseBtnClick={onCloseBtnClick || onCancelActionBtnClick}
      />

      <ModalContent className={styles.modalContent}>
        <p>{bodyText}</p>
      </ModalContent>
      <ModalFooter
        className={cx(styles.footer, {
          [styles.centerFooter]: centerFooter,
        })}
      >
        <Button
          icon={cancelIcon}
          size='small'
          variant='outlined'
          onClick={onCancelActionBtnClick}
          className='mr-4'
          isLoading={cancellingBtn}
          disabled={reverse ? processingBtn || cancellingBtn : cancellingBtn}
          style={styleObj}
        >
          {cancelActionText}
        </Button>
        {proceedActionText && (
          <Button
            size='small'
            icon={processIcon}
            className={styles[primaryBtnClassName]}
            onClick={onProceedActionBtnClick}
            isLoading={processingBtn}
            disabled={reverse ? processingBtn || cancellingBtn : processingBtn}
            style={styleObj}
          >
            {proceedActionText}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;
