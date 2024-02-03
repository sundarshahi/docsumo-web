/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

import cx from 'classnames';
import PropTypes from 'prop-types';

import styles from './ToggleControl.scss';

const ToggleControl = (props) => {
  const {
    handleStatus,
    size = 'small',
    checked,
    disabled,
    isLoading = false,
    className,
  } = props;
  return (
    <div
      className={cx(
        className,
        styles.toggleControl,
        styles[`toggleControl--${size}`],
        styles[`toggleControl--${checked ? 'on' : 'off'}`],
        {
          [styles['toggleControl--disable']]: disabled,
          [styles['toggleControl--loading']]: isLoading,
        }
      )}
      onClick={!disabled ? handleStatus : null}
    >
      <div className={cx(styles.toggleControl__toggle)} />
    </div>
  );
};
ToggleControl.propTypes = {
  handleStatus: PropTypes.func,
  size: PropTypes.oneOf(['small', 'large']),
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
};

export default ToggleControl;
