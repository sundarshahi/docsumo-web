import React from 'react';

import cx from 'classnames';
import { CSSTransition } from 'react-transition-group';

import styles from './ModalSection.scss';

const ModalSection = ({
  children,
  title,
  disabled = false,
  selected = false,
  helpTextNotSelected = '',
}) => {
  const animation = 'growY';
  return (
    <div
      className={cx(styles.modalSectionBody, {
        [styles.modalSectionBody__disabled]: disabled,
      })}
    >
      <div className='text-md font-medium w-100'>{title}</div>

      {helpTextNotSelected}

      <CSSTransition
        in={selected}
        unmountOnExit
        timeout={1000}
        classNames={{
          enter: styles[`${animation}-enter`],
          enterActive: styles[`${animation}-enter-active`],
          enterDone: styles[`${animation}-enter-done`],
          exit: styles[`${animation}-exit`],
          exitActive: styles[`${animation}-exit-active`],
          exitDone: styles[`${animation}-exit-done`],
        }}
      >
        <div>{children}</div>
      </CSSTransition>
    </div>
  );
};

export default ModalSection;
