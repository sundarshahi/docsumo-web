import React from 'react';

import cx from 'classnames';
import {
  Cancel,
  CheckCircle,
  DeleteCircle,
  InfoEmpty,
  WarningCircle,
} from 'iconoir-react';
import { useTimeout } from 'new/hooks/useTimeout';

import styles from './Toast.scss';

const Toast = ({
  status = 'info',
  title,
  description,
  duration,
  handleClose,
  hideCloseButton = false,
}) => {
  useTimeout(handleClose, duration);

  const ICON = {
    success: <CheckCircle />,
    error: <DeleteCircle />,
    warning: <WarningCircle />,
    info: <InfoEmpty />,
  };

  return (
    <div className={cx(styles.toast, styles[`toast--${status}`])}>
      <div className='d-flex align-items-center'>
        <div className={styles.toast__icon}>{ICON[status]}</div>
        <div className='d-flex flex-direction-column'>
          {title && (
            <p className={cx(styles.toast__title, 'text-sm font-semi-bold')}>
              {title}
            </p>
          )}
          {React.isValidElement(description) ? (
            description ? (
              <p className={cx(styles.toast__desc, 'text-xs')}>{description}</p>
            ) : null
          ) : null}
        </div>
      </div>
      {!hideCloseButton ? (
        <div className={styles.toast__iconClose}>
          <Cancel className='cursor-pointer' onClick={handleClose} />
        </div>
      ) : null}
    </div>
  );
};

export default Toast;
