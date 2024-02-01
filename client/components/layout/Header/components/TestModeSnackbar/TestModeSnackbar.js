import React from 'react';

import { ReactComponent as InfoIcon } from 'images/icons/info.svg';

import styles from './testModeSnackbar.scss';

export const TestModeSnackbar = (props = {}) => {
  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <InfoIcon className={styles.icon} />
        <div className={styles.text}>You are in test mode</div>
      </div>
      <div className={styles.right}>
        <a
          href='https://support.docsumo.com/docs/how-to-use-test-and-prod-mode'
          target='_blank'
          rel='noopener noreferrer'
          className={styles.link}
        >
          Learn more
        </a>
      </div>
    </div>
  );
};
