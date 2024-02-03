import React from 'react';
import { useCallback, useEffect, useState } from 'react';

import cx from 'classnames';
import { Portal } from 'react-portal';
import { CSSTransition } from 'react-transition-group';

import styles from './Modal.scss';

const Modal = ({
  show,
  onCloseHandler = null,
  animation = 'fade',
  children,
  className,
  baseClass,
  size = 'sm',
  timeout,
  hideOverlay,
}) => {
  const closeOnEscapeDownKey = useCallback(
    (e) => {
      if ((e.charCode || e.keyCode) === 27) {
        (typeof onCloseHandler === 'function' && onCloseHandler()) || null;
      }
    },
    [onCloseHandler]
  );

  const [mountModal, setMountModal] = useState(false);

  useEffect(() => {
    document.body.addEventListener('keydown', closeOnEscapeDownKey);
    setMountModal(show);
    return () => {
      document.body.removeEventListener('keydown', closeOnEscapeDownKey);
    };
  }, [show, closeOnEscapeDownKey]);

  return (
    <Portal>
      <CSSTransition
        in={mountModal}
        unmountOnExit
        timeout={timeout ?? 300}
        classNames={{
          enter: styles[`${animation}-enter`],
          enterActive: styles[`${animation}-enter-active`],
          enterDone: styles[`${animation}-enter-done`],
          exit: styles[`${animation}-exit`],
          exitActive: styles[`${animation}-exit-active`],
          exitDone: styles[`${animation}-exit-done`],
        }}
      >
        <div
          className={cx(styles.modal, 'shadow-300', baseClass, {
            [styles['modal--hide-overlay']]: hideOverlay,
          })}
          onClick={onCloseHandler}
          role='presentation'
        >
          <div
            className={cx(styles.modalContent, className, styles[size])}
            onClick={(e) => e.stopPropagation()}
            role='presentation'
          >
            {children}
          </div>
        </div>
      </CSSTransition>
    </Portal>
  );
};

export default Modal;
