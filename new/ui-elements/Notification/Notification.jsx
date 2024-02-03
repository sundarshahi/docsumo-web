import React from 'react';

import cx from 'classnames';
import { Portal } from 'react-portal';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import Snackbar from '../Snackbar';
import Toast from '../Toast';

import styles from './Notification.scss';

const Notification = ({
  duration = 4000,
  variant = 'toast',
  toastList = [],
  position = 'top-right',
  closeNotification,
}) => {
  return (
    <Portal className={position}>
      <ul
        className={cx(styles.notification, styles[`notification--${position}`])}
      >
        <TransitionGroup exit={false}>
          {toastList.map((toast, i) => {
            return (
              <CSSTransition
                key={toast.id}
                timeout={500}
                classNames={{
                  enter: styles['notification-item--enter'],
                  enterActive: styles['notification-item--enter-active'],
                }}
              >
                <li
                  className={cx(styles['notification-item'], 'mb-2')}
                  in={
                    toastList.find((item) => item.id === toast.id)
                      ? 'true'
                      : 'false'
                  }
                >
                  {variant === 'toast' && (
                    <Toast
                      duration={duration}
                      {...toast}
                      handleClose={() => closeNotification(toast.id)}
                    />
                  )}

                  {variant === 'snackbar' && (
                    <Snackbar
                      duration={duration}
                      {...toast}
                      handleClose={() => closeNotification(toast.id)}
                    />
                  )}
                </li>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      </ul>
    </Portal>
  );
};

export default Notification;
