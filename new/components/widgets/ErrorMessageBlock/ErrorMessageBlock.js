import React from 'react';

import cx from 'classnames';

import styles from './ErrorMessageBlock.scss';

const ErrorMessageBlock = (props) => {
  const { className = '', content = '' } = props;

  return (
    <div
      className={cx(styles.container, className, !content ? styles.hide : '')}
    >
      {content}
    </div>
  );
};

export default ErrorMessageBlock;
