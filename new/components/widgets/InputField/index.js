/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/*eslint linebreak-style: ["error", "windows"]*/
import React, { Component } from 'react';

import cx from 'classnames';
import activeEyeIcon from 'new/assets/images/docsumo/eye_icon_active.png';
import inactiveEyeIcon from 'new/assets/images/docsumo/eye_icon_inactive.png';
import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error_confidence.svg';

import styles from './InputField.scss';

class InputField extends Component {
  state = {
    showPassword: false,
    inputType: 'text',
  };

  componentDidMount() {
    const { type } = this.props;
    this.setState({ inputType: type });
  }

  handlePasswordVisibility = () => {
    const { showPassword, inputType } = this.state;
    let input = '';
    if (inputType === 'password') {
      input = 'text';
    } else {
      input = 'password';
    }
    this.setState({ inputType: input, showPassword: !showPassword });
  };

  render() {
    const { inputType, showPassword } = this.state;
    const {
      name,
      type,
      innerRef,
      placeholder,
      value,
      disabled,
      id = '',
      className = '',
      label = '',
      showErrorIcon = false,
      autoComplete = 'off',
      onChange,
      errorMsg,
      readOnly = false,
    } = this.props;

    const inputFieldElement =
      type === 'textarea' ? (
        <textarea
          className={cx(
            styles.inputField,
            styles.textarea,
            errorMsg ? styles.error : ''
          )}
          ref={innerRef}
          id={id}
          name={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          onChange={onChange}
          readOnly={readOnly}
        ></textarea>
      ) : (
        <input
          className={cx(styles.inputField, errorMsg ? styles.error : '')}
          ref={innerRef}
          type={inputType}
          id={id}
          name={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          onChange={onChange}
          readOnly={readOnly}
        />
      );

    return (
      <div className={cx(styles.container, className)}>
        {label && <label htmlFor={id}>{label}</label>}
        <div className={styles.inputContainer}>
          {inputFieldElement}
          {type === 'password' && (
            <span
              onClick={this.handlePasswordVisibility}
              title={
                inputType === 'password' ? 'Show Password' : 'Hide Password'
              }
            >
              <img
                src={showPassword ? activeEyeIcon : inactiveEyeIcon}
                alt=''
              />
            </span>
          )}
        </div>
        {errorMsg && (
          <div className={styles.errorMsg}>
            {showErrorIcon ? <ErrorIcon /> : null}
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    );
  }
}

export default React.forwardRef((props, ref) => (
  <InputField innerRef={ref} {...props} />
));
