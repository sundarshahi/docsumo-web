import React from 'react';

import cx from 'classnames';
import { ReactComponent as CheckboxCheckedIcon } from 'new/assets/images/icons/checkbox-checked.svg';
import { ReactComponent as CheckboxUncheckedIcon } from 'new/assets/images/icons/checkbox-unchecked.svg';
import PropTypes from 'prop-types';

import styles from './checkbox.scss';

const CheckboxDocument = (props) => {
  const {
    label,
    name,
    value,
    counts,
    checked = false,
    onChange,
    className,
    indicatorClassName,
    labelClassName,
    countClassName,
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
  let totalCount = counts.reviewing + counts.processed;

  const isDisabled = totalCount >= 20 || checked ? false : true;

  const rootClassNames = cx(
    styles.root,
    { [styles.active]: checked },
    className,
    { [styles.rootDisable]: isDisabled }
  );

  const controlIndicatorClassNames = cx(
    styles.controlIndicator,
    indicatorClassName,
    { [styles.rootDisable]: isDisabled }
  );

  const labelClassNames = cx(
    styles.label,
    labelClassName,
    { [styles.active]: checked },
    { [styles.rootDisable]: isDisabled }
  );
  const countClassNames = cx(
    styles.count,
    countClassName,
    { [styles.active]: checked },
    { [styles.rootDisable]: isDisabled }
  );

  return (
    <label className={rootClassNames}>
      <input
        type='checkbox'
        name={name}
        value={value}
        checked={checked}
        disabled={totalCount >= 20 || checked ? false : true}
        onChange={handleChange}
      />
      <span className={controlIndicatorClassNames}>
        {checked ? <CheckboxCheckedIcon /> : <CheckboxUncheckedIcon />}
      </span>
      {label ? <span className={labelClassNames}>{label}</span> : null}
      <span className={countClassNames}>
        {`(${
          totalCount >= 10000
            ? Math.floor(totalCount / 1000) + 'K'
            : totalCount || 0
        })`}
      </span>
    </label>
  );
};

CheckboxDocument.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  indicatorClassName: PropTypes.string,
  labelClassName: PropTypes.string,
};

export default CheckboxDocument;
