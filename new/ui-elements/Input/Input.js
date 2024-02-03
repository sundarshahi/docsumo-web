/* eslint-disable jsx-a11y/no-autofocus */
import React, { forwardRef } from 'react';

import cx from 'classnames';
import PropTypes from 'prop-types';

import ErrorText from './components/ErrorText/ErrorText';
import PhoneNumberInput from './components/PhoneInput/PhoneNumberInput';

import styles from './Input.scss';

const Input = forwardRef((props, ref) => {
  const {
    className,
    inputGroupClassName,
    name,
    type = 'text',
    placeholder = '',
    value = '',
    disabled = false,
    hasError = false,
    onChange,
    onBlur,
    onKeyDown,
    icon,
    iconPosition = 'left',
    iconClickHandler,
    autoFocus,
    id,
    readOnly,
    tabIndex = 0,
    onFocus,
    autoComplete,
    onSelect,
    errorText,
    min,
    max,
    minLength,
    maxLength,
  } = props;

  if (type === 'phone') {
    return <PhoneNumberInput {...props} />;
  }

  return (
    <div
      className={cx(styles.inputGroup, {
        [inputGroupClassName]: inputGroupClassName,
      })}
    >
      {icon ? (
        <span
          role='presentation'
          className={cx(
            styles.input__icon,
            styles[`input__icon__${iconPosition}`],
            'mr-1',
            'cursor-pointer'
          )}
          onClick={iconClickHandler}
        >
          {icon}
        </span>
      ) : (
        ''
      )}
      <input
        id={id}
        readOnly={readOnly}
        tabIndex={tabIndex}
        autoComplete={autoComplete}
        type={type}
        name={name}
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onSelect={onSelect}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        disabled={disabled}
        min={min}
        max={max}
        minLength={minLength}
        maxLength={maxLength}
        className={cx(styles.input, className, {
          [styles.input__error]: hasError,
          [styles[`input__icon--space__${iconPosition}`]]: icon,
        })}
      />

      {hasError ? <ErrorText>{errorText}</ErrorText> : ''}
    </div>
  );
});

Input.propTypes = {
  ref: PropTypes.any,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disabled: PropTypes.bool,
  hasError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  className: PropTypes.any,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  autoFocus: PropTypes.bool,
};

export default Input;
