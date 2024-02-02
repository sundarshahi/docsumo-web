/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';

import cx from 'classnames';
import { InfoEmpty } from 'iconoir-react';
import _ from 'lodash';
import { ReactComponent as ActiveEyeIcon } from 'new/assets/images/icons/eye.svg';
import { ReactComponent as InactiveEyeIcon } from 'new/assets/images/icons/eye-closed.svg';
import passwordRegex from 'new/constants/passwordRegex';

import { ReactComponent as CrossIcon } from '../../../assets/images/docsumo/cross_icon_red.svg';
import { ReactComponent as CheckIcon } from '../../../assets/images/docsumo/tick_icon_green.svg';

import styles from './passwordField.scss';

class PasswordField extends Component {
  state = {
    showPassword: false,
    inputType: 'password',
    password: '',
    errorMsg: '',
    validation: true,
    errors: {},
    socialSignon: false,
  };

  componentDidMount() {
    const { validation = true, value } = this.props;
    this.setState({ validation });

    if (value) {
      this.setState({ password: value });
    }
  }

  handleInputChange = (event) => {
    const { validation } = this.state;
    let { name, value } = event.target;
    this.setState({
      [name]: _.trimStart(value),
      uiError: '',
    });
    if (validation) {
      setTimeout(() => this.validate(_.trimStart(value), 2000));
    } else {
      this.setState({ errorMsg: '' });
    }
  };

  // toggle hide/show for password visibility
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

  clearFieldValue = ({ validation, password, socialSignon }) => {
    this.validate(password, validation, socialSignon);
  };

  // password input field validation
  validate = (value, validation, socialSignon) => {
    const password = value !== undefined ? value : this.state.password;
    const doValidation =
      validation !== undefined ? validation : this.state.validation;
    const isSocialSignon =
      socialSignon !== undefined ? socialSignon : this.state.socialSignon;
    const { handleInputValue } = this.props;

    let errors = {};
    let errorMsg = '';

    if (_.isEmpty(password) && !isSocialSignon) {
      errorMsg = 'Please enter a password';
    }

    if (!_.isEmpty(password) && _.isEmpty(errors)) {
      if (password.length < 8) {
        errors.limitCharacter = true;
      }
      if (!passwordRegex.number.test(password)) {
        errors.number = true;
      }
      if (!passwordRegex.upperCharacter.test(password)) {
        errors.upperCharacter = true;
      }
      if (!passwordRegex.lowerCharacter.test(password)) {
        errors.lowerCharacter = true;
      }
      if (!passwordRegex.specialCharacter.test(password)) {
        errors.specialCharacter = true;
      }
    }
    if (!doValidation) {
      errors = {};
    }
    this.setState({ errors, errorMsg, password }, () =>
      handleInputValue(this.state)
    );
    return (
      !!Object.values(this.state.errors).some((value) => value) ||
      _.isEmpty(password)
    );
  };

  // validation popup dialog for different input characters
  validationDialog = () => {
    const {
      limitCharacter,
      upperCharacter,
      lowerCharacter,
      number,
      specialCharacter,
    } = this.state.errors;
    const { secondaryPasswordField = false } = this.props;

    return (
      <div
        className={cx(styles.dialog, {
          [styles.topMargin]: secondaryPasswordField,
        })}
      >
        <div>
          {!limitCharacter ? <CheckIcon /> : <CrossIcon />}
          <span>At least 8 Characters</span>
        </div>
        <div>
          {!specialCharacter ? <CheckIcon /> : <CrossIcon />}
          <span>A special character</span>
        </div>
        <div>
          {!upperCharacter ? <CheckIcon /> : <CrossIcon />}
          <span>An uppercase character</span>
        </div>
        <div>
          {!lowerCharacter ? <CheckIcon /> : <CrossIcon />}
          <span>A lowercase character</span>
        </div>
        <div>
          {!number ? <CheckIcon /> : <CrossIcon />}
          <span>A number</span>
        </div>
      </div>
    );
  };

  render() {
    const { inputType, password, showPassword, errors, validation } =
      this.state;
    let { errorMsg } = this.state;
    const {
      name,
      placeholder,
      disabled,
      id = '',
      className = '',
      label = '',
      error = '',
      autoComplete = 'on',
      showErrorIcon = false,
      inputRef,
    } = this.props;
    const isError = Object.values(errors).some((value) => value);

    // validation for password input field, must not be empty
    if (!_.isEmpty(password) && isError && validation) {
      errorMsg = true;
    }

    return (
      <div className={cx(styles.container, className)}>
        {label && <label htmlFor={id}>{label}</label>}
        <div className={styles.inputContainer}>
          <input
            className={errorMsg || error ? styles.error : ''}
            type={inputType}
            id={id}
            name={name}
            placeholder={placeholder}
            value={password}
            disabled={disabled}
            autoComplete={autoComplete}
            onChange={this.handleInputChange}
            ref={inputRef}
          />
          <span
            onClick={this.handlePasswordVisibility}
            title={inputType === 'password' ? 'Show Password' : 'Hide Password'}
          >
            {showPassword ? <ActiveEyeIcon /> : <InactiveEyeIcon />}
          </span>
        </div>
        {!_.isEmpty(password) &&
          isError &&
          validation &&
          this.validationDialog()}
        {!_.isEmpty(error) || !_.isEmpty(errorMsg) ? (
          <div className={styles.errorMsg}>
            {showErrorIcon ? (
              <InfoEmpty width={'0.8125rem'} height={'0.8125rem'} />
            ) : null}
            <span>{error || errorMsg}</span>
          </div>
        ) : null}
      </div>
    );
  }
}

export default PasswordField;
