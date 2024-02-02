import React from 'react';

import cx from 'classnames';
import { ReactComponent as CheckboxCheckedIcon } from 'new/assets/images/icons/checkbox-checked.svg';
import { ReactComponent as CheckboxUncheckedIcon } from 'new/assets/images/icons/checkbox-unchecked.svg';
import PropTypes from 'prop-types';

import styles from './checkbox.scss';

const Checkbox = (props) => {
  const {
    label,
    name,
    value,
    checked = false,
    onChange,
    className,
    indicatorClassName,
    labelClassName,
    disabled,
  } = props;

  const handleChange = ({ target }) => {
    const checked = target.checked;
    onChange &&
      onChange({
        name: name,
        value: value,
        checked: checked,
      });
  };

  const rootClassNames = cx(
    styles.root,
    { [styles.active]: checked },
    { [styles.rootDisable]: disabled },
    className
  );

  const controlIndicatorClassNames = cx(
    styles.controlIndicator,
    indicatorClassName
  );

  const labelClassNames = cx(styles.label, labelClassName);

  return (
    <label className={rootClassNames}>
      <input
        type='checkbox'
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className={controlIndicatorClassNames}>
        {checked ? <CheckboxCheckedIcon /> : <CheckboxUncheckedIcon />}
      </span>
      {label ? (
        <span className={labelClassNames} title={label}>
          {label}
        </span>
      ) : null}
    </label>
  );
};

Checkbox.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  indicatorClassName: PropTypes.string,
  labelClassName: PropTypes.string,
};

export default Checkbox;
