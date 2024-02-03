import React from 'react';

import cx from 'classnames';

import styles from './LinearProgressbar.scss';

const LinearProgressbar = ({ value = 0, showLabel = true, size = 'md' }) => {
  return (
    <div className='d-flex align-items-center py-2'>
      <div className={cx(styles.progressBar, styles[`progressBar--${size}`])}>
        <div
          role='progressbar'
          className={styles.progressBar__Value}
          aria-valuenow={value}
          aria-valuemin='0'
          aria-valuemax='100'
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && <span className={`text-${size} ml-2`}>{value}%</span>}
    </div>
  );
};

export default LinearProgressbar;
