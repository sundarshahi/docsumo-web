import React from 'react';

import { ReactComponent as InfoIcon } from 'images/icons/info.svg';

import styles from './testModeBanner.scss';

export const TestModeBanner = () => {
  return (
    <div className={styles.rootLine}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <InfoIcon className={styles.icon} />
          <div className={styles.tooltip}>
            You are in test mode{' '}
            <a
              href='https://support.docsumo.com/docs/how-to-use-test-and-prod-mode'
              target='_blank'
              rel='noopener noreferrer'
              className={styles.link}
            >
              learn more
            </a>
            <div className={styles.arrow} />
          </div>
        </div>
        <span className={styles.text}>Test mode active</span>
      </div>
    </div>
  );
};
