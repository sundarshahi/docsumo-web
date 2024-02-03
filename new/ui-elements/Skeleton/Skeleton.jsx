import React from 'react';

import cx from 'classnames';

import styles from './Skeleton.scss';

const Skeleton = ({ height = '20px', width = '100px', className }) => {
  return (
    <div
      className={cx(styles.skeleton, { [className]: className })}
      style={{ height: height, width: width }}
    ></div>
  );
};

export default Skeleton;
