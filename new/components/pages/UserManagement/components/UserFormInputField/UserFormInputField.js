import React from 'react';
import { connect } from 'react-redux';

import cx from 'classnames';
import passGenerator from 'generate-password';
import { Refresh } from 'iconoir-react';
import Button, { SIZE, VARIANT } from 'new/ui-elements/Button/Button';
import ErrorText from 'new/ui-elements/Input/components/ErrorText/ErrorText';
import Input from 'new/ui-elements/Input/Input';

import RoleDropDown from '../RoleDropDown/RoleDropdown';

import styles from './UserFormInputField.scss';

const FormInputField = ({
  formData,
  label,
  fieldName,
  formError = {},
  onInputChange,
  placeholder,
  type,
  activeModal,
}) => {
  const generatePassword = (e) => {
    e.preventDefault();
    const password = passGenerator.generate({
      length: 14,
      numbers: true,
      symbols: true,
      lowercase: true,
      uppercase: true,
      strict: true,
    });
    function hasNumber(password) {
      return /\d/.test(password);
    }
    if (hasNumber(password)) {
      const event = { value: password, name: 'password' };
      onInputChange(null, event);
    } else {
      generatePassword(e);
    }
  };
  const renderFieldInput = (type) => {
    switch (type) {
      case 'password':
        return (
          <>
            <div className={styles.colSection}>
              <Input
                name={fieldName}
                placeholder={placeholder}
                value={formData[fieldName]}
                id={`users-input-${fieldName}`}
                onChange={onInputChange}
                hasError={formError[fieldName]}
              />

              <Button
                variant={VARIANT.OUTLINED}
                icon={<Refresh width={'1.25rem'} height={'1.25rem'} />}
                title='Generate'
                onClick={generatePassword}
                size={SIZE.SMALL}
                className={styles.generateBtn}
              >
                Generate
              </Button>
            </div>
            <ErrorText>{formError[fieldName]}</ErrorText>
          </>
        );
      case 'role':
        return (
          <RoleDropDown
            onInputChange={onInputChange}
            value={formData[fieldName]}
            errorMsg={formError[fieldName]}
            formData={formData}
            activeModal={activeModal}
          />
        );

      default:
        return (
          <Input
            type='text'
            name={fieldName}
            placeholder={placeholder}
            value={formData[fieldName]}
            id={`users-input-${fieldName}`}
            onChange={onInputChange}
            hasError={formError[fieldName]}
            errorText={formError[fieldName]}
          />
        );
    }
  };
  return (
    <>
      <div className={cx('d-flex', 'align-items-center')}>
        <label
          className={styles.formLabel}
          htmlFor={`users-input-${fieldName}`}
        >
          {label}
        </label>
      </div>
      <div>{renderFieldInput(type)}</div>
    </>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(FormInputField);
