import React from 'react';

import CircularProgress from 'new/ui-elements/CircularProgress/CircularProgress';

import styles from './progressaccuracy.scss';

const ProgressAccuracy = (props) => {
  const { title = '', percentage = 0 } = props;
  return (
    <>
      <div className={styles.root}>
        <div className={styles.title}>{title}</div>
        <div className={styles.progressCircle}>
          <CircularProgress
            value={percentage || 0}
            className={styles.progressCircle_circle}
          />
        </div>
      </div>
    </>
  );
};
export default ProgressAccuracy;
