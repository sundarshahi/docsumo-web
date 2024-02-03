import React from 'react';

import cx from 'classnames';
import { Check } from 'iconoir-react';
import PropTypes from 'prop-types';

import styles from './Checkbox.scss';

function Checkbox(props) {
  const {
    className,
    name,
    value = '',
    checked = false,
    onChange,
    state = '',
    disabled = false,
    tabIndex = 0,
    role = 'checkbox',
  } = props;

  return (
    <div className={cx(styles.wrapper, className)}>
      <input
        tabIndex={tabIndex}
        type='checkbox'
        name={name}
        checked={checked}
        value={value}
        className={styles.checkbox}
        onChange={onChange}
        role={role}
        disabled={disabled}
      />
      <span
        className={cx(styles.checkboxIcon, {
          [styles.checkboxIcon__partial]: state === 'partial' && checked,
        })}
      >
        {state === 'partial' ? (
          ''
        ) : (
          <Check width={'1.25rem'} height={'1.25rem'} />
        )}
      </span>
    </div>
  );
}

export default Checkbox;

Checkbox.propTypes = {
  value: PropTypes.string,
  className: PropTypes.any,
  disabled: PropTypes.bool,
  state: PropTypes.string,
  name: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
