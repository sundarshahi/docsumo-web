import React from 'react';

import cx from 'classnames';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';

import styles from './checkboxGroup.scss';

const CheckboxGroup = (props) => {
  const {
    checked = [],
    onChange,
    className,
    indicatorClassName,
    labelClassName,
    options = [],
  } = props;

  return (
    <div className={styles.checkbox__container}>
      {options.map(({ title: label, value }) => (
        <div className={styles.checkboxGroup} key={value}>
          <Checkbox
            label={label}
            value={value}
            onChange={onChange}
            indicatorClassName={indicatorClassName}
            labelClassName={labelClassName}
            className={className}
            checked={checked.includes(value)}
          />
          <p className={cx(styles.title, 'text-truncate')}>{label}</p>
        </div>
      ))}
    </div>
  );
};

export default CheckboxGroup;
