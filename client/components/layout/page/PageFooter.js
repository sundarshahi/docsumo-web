import React from 'react';

import cx from 'classnames';

import styles from './pageFooter.scss';

const PageFooter = (props) => {
  const { children, className, style } = props;

  return (
    <div className={cx(styles.root, className)} style={style || null}>
      {children}
    </div>
  );
};

export default PageFooter;
