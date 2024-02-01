import React from 'react';

import { SUPPORT_LINK } from 'new/constants/urllink';

import styles from './testModeBanner.scss';

export const TestModeBanner = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <span className={styles.text}>
          <span className={styles.testmodeBannerDot} />
          Test mode active
          <a
            href={SUPPORT_LINK.TEST_PROD_MODE_DOC}
            target='_blank'
            rel='noopener noreferrer'
          >
            Learn more
          </a>
        </span>
      </div>
    </div>
  );
};
