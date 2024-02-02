import React from 'react';

import { Checkbox } from './index';

import styles from './checkbox.scss';

const CheckboxGroup = (props) => {
  const {
    checked = [],
    onChange,
    className,
    indicatorClassName,
    labelClassName,
    options = [],
  } = props;

  const handleChange = ({ checked: optionChecked, value }) => {
    const included = checked.includes(value);
    if (optionChecked && !included) {
      onChange([...checked, value]);
    } else if (!optionChecked && included) {
      const result = checked.filter((e) => e !== value);
      onChange(result);
    }
  };

  return (
    <div className={styles.checkboxGroup}>
      {options.map(({ title: label, value }) => (
        <Checkbox
          key={value}
          label={label}
          value={value}
          onChange={handleChange}
          indicatorClassName={indicatorClassName}
          labelClassName={labelClassName}
          className={className}
          checked={checked.includes(value)}
        />
      ))}
    </div>
  );
};

export default CheckboxGroup;
