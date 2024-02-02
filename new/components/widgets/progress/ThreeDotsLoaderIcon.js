import React from 'react';

import cx from 'classnames';

import styles from './threeDotsLoaderIcon.scss';

const ThreeDotsLoaderIcon = (props) => {
  const { className, ...otherProps } = props;

  return (
    <div className={cx(styles.root, className)} {...otherProps}>
      {Array.from(new Array(3)).map((_, index) => {
        return <span key={index} className={styles.dot} />;
      })}
    </div>
  );
};

export default ThreeDotsLoaderIcon;
