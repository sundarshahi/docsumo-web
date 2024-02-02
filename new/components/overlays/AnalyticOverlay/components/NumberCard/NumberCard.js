import React from 'react';

import styles from './numbercard.scss';

const NumberCard = (props) => {
  const { icon: Icon, title = '', totalNumber = 0 } = props;
  return (
    <>
      <div className={styles.root}>
        <div className={styles.top}>
          <Icon className={styles.top_icon} />
          <div className={styles.top_title}>{title}</div>
        </div>
        <div className={styles.number}>{totalNumber || 0}</div>
      </div>
    </>
  );
};
export default NumberCard;
