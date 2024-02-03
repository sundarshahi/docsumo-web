import React, { forwardRef } from 'react';

import cx from 'classnames';
import PropTypes from 'prop-types';

import styles from './Textarea.scss';

const Textarea = forwardRef((props, ref) => {
  const {
    className = '',
    name,
    value = '',
    placeholder = '',
    onChange,
    disabled = false,
    hasError = false,
    onBlur,
    cols,
    rows,
  } = props;

  return (
    <textarea
      id={name}
      name={name}
      className={cx(styles.textarea, className, {
        [styles.textarea__error]: hasError,
      })}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      ref={ref}
      disabled={disabled}
      onBlur={onBlur}
      cols={cols}
      rows={rows}
    ></textarea>
  );
});

Textarea.propTypes = {
  ref: PropTypes.any,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  className: PropTypes.any,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default Textarea;
