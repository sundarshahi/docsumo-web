import React from 'react';

import cx from 'classnames';

import styles from './Spinner.scss';

const Spinner = ({ size = 'md', showLabel, className = '' }) => {
  return (
    <div className='d-flex flex-direction-column align-items-center'>
      <div
        className={cx(styles.spinner, styles[`spinner--${size}`], className)}
      ></div>
      {showLabel && <span className='text-sm mt-1'>Loading..</span>}
    </div>
  );
};

export default Spinner;
