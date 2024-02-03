import React from 'react';

import cx from 'classnames';

import styles from './CircularProgress.scss';

const STROKE_FULL_OFFSET = 282.743;

const CircularProgress = ({
  value = 0,
  size = 'md',
  className,
  strokeWidth = 6,
  hideText = false,
}) => {
  const strokeDashOffset = `${
    STROKE_FULL_OFFSET - (value / 100) * STROKE_FULL_OFFSET
  }px`;

  return (
    <div
      className={cx(
        styles.circularProgressRoot,
        styles[`circularProgressRoot--${size}`],
        className
      )}
    >
      <svg
        className={styles.circularProgress}
        viewBox='0 0 100 100'
        data-test-id='CircularProgressbar'
      >
        <path
          className={styles.circularProgress__trail}
          d='M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90'
          strokeWidth={strokeWidth}
          fillOpacity='0'
          strokeDasharray={`${STROKE_FULL_OFFSET}, ${STROKE_FULL_OFFSET}`}
          strokeDashoffset='0px'
        ></path>
        <path
          className={styles.circularProgress__path}
          d='M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90'
          strokeWidth={strokeWidth}
          fillOpacity='0'
          transition='none 0s ease 0s'
          strokeDasharray={`${STROKE_FULL_OFFSET}, ${STROKE_FULL_OFFSET}`}
          strokeDashoffset={strokeDashOffset}
        ></path>
        {!hideText && (
          <text className={styles.circularProgress__text} x='50' y='50'>
            {value}%
          </text>
        )}
      </svg>
    </div>
  );
};

export default CircularProgress;
