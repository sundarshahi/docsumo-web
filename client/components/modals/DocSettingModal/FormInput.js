/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component, Fragment } from 'react';
import { showToast } from 'client/redux/helpers';

import cx from 'classnames';
import copy from 'clipboard-copy';
import { ReactComponent as CopyEmail } from 'images/icons/copy-email.svg';
import { ReactComponent as FormLink } from 'images/icons/form-link.svg';

import styles from './formInput.scss';
//import {ReactComponent as FormEdit} from 'images/icons/form-edit.svg';

class FormInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
    };
  }
  UNSAFE_componentWillMount() {
    const { value } = this.props;
    {
      value || value === 0
        ? this.setState({
            //dropDownValue:label || option && option[0].label,
            uiValue: value,
          })
        : null;
    }
  }

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
    });
  };

  handleEmailCopy = () => {
    const { uiValue } = this.state;
    copy(uiValue);
    showToast({
      title: 'Email copied to clipboard',
      timeout: 3,
      success: true,
    });
  };

  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId, type, label } = this.props;
    handleChangedValueSubmit({
      id: id,
      value:
        type === 'number' ? parseInt(this.state.uiValue) : this.state.uiValue,
      filterId: filterId,
      label,
    });
  };
  render() {
    const {
      className,
      label,
      editable,
      helpText,
      fieldClassName,
      type,
      link,
      defaultPlaceholder,
      id,
    } = this.props;
    const { uiValue } = this.state;
    let icon = '';
    switch (id) {
      case 32:
        icon = <CopyEmail />;
        break;
      case 33:
        icon = <FormLink />;
        break;
      case 34:
        icon = <FormLink />;
        break;
      case 42:
        icon = <FormLink />;
        break;
      case 43:
        icon = <FormLink />;
        break;
      default:
        icon = <CopyEmail />;
        break;
    }
    return (
      <Fragment>
        <div className={cx(styles.generalSubField, fieldClassName)}>
          <label htmlFor={label}>
            {label}
            <p className={styles.helpText}>
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn More
                </a>
              ) : null}
            </p>
          </label>
          <div className={styles.inputWrap}>
            {id !== 32 ? (
              <a
                target='_blank'
                rel='noopener noreferrer'
                href={uiValue}
                className={styles.formIcon}
              >
                {icon}
              </a>
            ) : (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <span className={styles.formIcon} onClick={this.handleEmailCopy}>
                {icon}
              </span>
            )}
            <input
              id={id}
              type={type || 'text'}
              name='name'
              placeholder={defaultPlaceholder}
              value={uiValue}
              className={cx(styles.input, className)}
              onChange={this.handleInputChange}
              onBlur={editable === false || !editable ? null : this.handleBlur}
              readOnly={editable === false || !editable}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default FormInput;
