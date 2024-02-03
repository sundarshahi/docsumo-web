import React from 'react';

import cx from 'classnames';
import { useTimeout } from 'new/hooks/useTimeout';

import styles from './Snackbar.scss';

const Snackbar = ({
  theme = 'light',
  title,
  duration,
  handleClose,
  hideDismissButton = false,
  className = '',
}) => {
  useTimeout(handleClose, duration);

  return (
    <div
      className={cx(styles.snackbar, className, styles[`snackbar--${theme}`])}
    >
      <div className='d-flex align-items-center'>{title}</div>
      {!hideDismissButton && (
        <button className={styles.snackbar__close} onClick={handleClose}>
          Dismiss
        </button>
      )}
    </div>
  );
};

export default Snackbar;
