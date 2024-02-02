import React from 'react';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import AriaModal from 'react-aria-modal';

import styles from './index.scss';

const Modal = (props) => {
  const { rootProps, className, children, onExit } = props;

  const finalRootProps = {
    focusDialog: true,
    underlayClickExits: true,
    verticallyCenter: true,
    focusTrapPaused: false,
    onExit,
    ...rootProps,
  };

  return (
    <AriaModal {...finalRootProps}>
      <div className={cx(styles.root, className)}>{children}</div>
    </AriaModal>
  );
};

const ModalHeader = (props) => {
  const {
    className,
    titleClassName,
    closeBtnClassName,
    title,
    showCloseBtn = true,
    onCloseBtnClick,
  } = props;

  return (
    <div className={cx(styles.header, className)}>
      {title ? (
        <h2 className={cx(styles.title, titleClassName)}>{title}</h2>
      ) : null}

      {showCloseBtn ? (
        <>
          <IconButton
            icon={Cancel}
            variant='ghost'
            size='small'
            className={cx('ml-3', closeBtnClassName)}
            onClick={onCloseBtnClick}
          />
        </>
      ) : null}
    </div>
  );
};

const ModalContent = (props) => {
  const { className, children } = props;

  return <div className={cx(styles.content, className)}>{children}</div>;
};

const ModalFooter = (props) => {
  const { className, children } = props;

  return <div className={cx(styles.footer, className)}>{children}</div>;
};

export default Modal;
export { ModalContent, ModalFooter, ModalHeader };
