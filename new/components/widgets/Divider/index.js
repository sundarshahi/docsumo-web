import React from 'react';

import cx from 'classnames';

import styles from './style.scss';

const Divider = ({ title, className }) => {
  return (
    <div className={cx(styles.root, className)}>
      <hr className={styles.line} />
      <p className={styles.textBox}>
        <span className={styles.text}>{title}</span>
      </p>
    </div>
  );
};

export default Divider;
