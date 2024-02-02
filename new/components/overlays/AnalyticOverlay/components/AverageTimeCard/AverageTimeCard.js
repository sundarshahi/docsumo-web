import React from 'react';

import styles from './averagetime.scss';

const AverageTimeCard = (props) => {
  const { title = '', time } = props;
  return (
    <>
      <div className={styles.root}>
        <div className={styles.title}>{title}</div>
        <div className={styles.iconContent}>
          <div className={styles.iconContent_time}>{`${time || 0} Sec`}</div>
        </div>
      </div>
    </>
  );
};
export default AverageTimeCard;
