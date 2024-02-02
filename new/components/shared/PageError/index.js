import React from 'react';

import cx from 'classnames';
import { Refresh } from 'iconoir-react';
import { ReactComponent as DataFetchErrorIcon } from 'new/assets/images/icons/fetch_error.svg';
import Button, { SIZE, VARIANT } from 'new/ui-elements/Button/Button.js';

import styles from './index.scss';

const PageError = (props) => {
  const {
    className,
    errorTitle,
    text,
    btnText,
    icon,
    onBtnClick,
    ErrorCodeImage,
  } = props;

  const handleBtnClick = (e) => {
    if (onBtnClick) {
      return onBtnClick(e);
    }

    global.window.location.reload();
  };

  const Icon = icon;
  const leftIcon = React.isValidElement(icon) ? icon : <Icon />;

  return (
    <div className={cx(styles.root, className)}>
      <ErrorCodeImage className={styles.errCodeImage} />

      <h2 className={styles.errorTitle}>{errorTitle}</h2>

      <p className={styles.text}>{text}</p>

      <Button
        variant={VARIANT.CONTAINED}
        size={SIZE.MEDIUM}
        icon={leftIcon}
        onClick={handleBtnClick}
      >
        {btnText}
      </Button>
    </div>
  );
};

export default PageError;

export const DataFetchFailurePageError = (props = {}) => {
  const { onBtnClick = null, className } = props;
  return (
    <PageError
      errorTitle='Error'
      text='Failed to fetch data from server'
      btnText='Reload page'
      icon={<Refresh />}
      onBtnClick={onBtnClick}
      ErrorCodeImage={DataFetchErrorIcon}
      className={className}
    />
  );
};
