import React from 'react';

import cx from 'classnames';

import styles from './SignonButton.scss';

const signonButton = (props) => {
  const {
    label = '',
    icon = {},
    containerClassName = '',
    contentClassName = '',
    provider = 'google',
    handleClickEvent = () => {},
  } = props;

  const clickEventHandler = () => {
    handleClickEvent({ provider });
  };

  const btnClassName = `border-${provider}`;

  return (
    <>
      <button
        className={cx(
          styles.signonBtn,
          styles[containerClassName],
          styles[btnClassName]
        )}
        onClick={clickEventHandler}
      >
        <div className={cx(styles.content, contentClassName)}>
          <span className={styles.icon}>{icon}</span>
          <span className={styles.label}>{label}</span>
        </div>
      </button>
    </>
  );
};

export default signonButton;
