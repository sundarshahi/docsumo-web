import React from 'react';

import cx from 'classnames';
import PropTypes from 'prop-types';

import styles from './RadioButton.scss';

function RadioButton(props) {
  const {
    className,
    name,
    value = '',
    checked = false,
    disabled = false,
    onChange,
  } = props;

  return (
    <div className={cx(styles.wrapper, className)}>
      <input
        type='radio'
        name={name}
        checked={checked}
        value={value}
        className={styles.radio}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles.radioIcon} />
    </div>
  );
}

export default RadioButton;

RadioButton.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.any,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
