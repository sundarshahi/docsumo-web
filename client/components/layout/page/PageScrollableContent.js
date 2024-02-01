import React from 'react';

import cx from 'classnames';

import styles from './pageScrollableContent.scss';

const PageScrollableContent = (props) => {
  const { children, className, style, id } = props;

  return (
    <div className={cx(styles.root, className)} id={id} style={style || null}>
      {children}
    </div>
  );
};

export default PageScrollableContent;
