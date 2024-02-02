import React from 'react';

import cx from 'classnames';
import { ReactComponent as CheckboxCheckedIcon } from 'new/assets/images/icons/checkbox-checked.svg';
import { ReactComponent as CheckboxUncheckedIcon } from 'new/assets/images/icons/checkbox-unchecked.svg';
import PropTypes from 'prop-types';

import styles from './checkbox.scss';

const CheckboxUser = (props) => {
  const {
    label,
    name,
    value,
    checked = false,
    onChange,
    className,
    indicatorClassName,
    labelClassName,
    id,
  } = props;

  const handleChange = ({ target }) => {
    const checked = target.checked;
    onChange &&
      onChange({
        name: name,
        value: value,
        checked: checked,
        id: id,
      });
  };

  const rootClassNames = cx(
    styles.root,
    { [styles.active]: checked },
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
      />
      <span className={controlIndicatorClassNames}>
        {checked ? <CheckboxCheckedIcon /> : <CheckboxUncheckedIcon />}
      </span>
      {label ? <span className={labelClassNames}>{label}</span> : null}
    </label>
  );
};

CheckboxUser.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  id: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  indicatorClassName: PropTypes.string,
  labelClassName: PropTypes.string,
};

export default CheckboxUser;
