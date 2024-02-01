/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component, Fragment } from 'react';
import { showToast } from 'new/redux/helpers';

import cx from 'classnames';
import copy from 'clipboard-copy';
import { Copy, Link } from 'iconoir-react';
import Input from 'new/ui-elements/Input/Input';

import styles from './formInput.scss';
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
      duration: 3000,
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

  redirect = (url) => window.open(url, '_blank', 'noopener,noreferrer');

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
        icon = <Copy />;
        break;
      case 33:
        icon = <Link />;
        break;
      case 34:
        icon = <Link />;
        break;
      case 42:
        icon = <Link />;
        break;
      case 43:
        icon = <Link />;
        break;
      default:
        icon = <Copy />;
        break;
    }

    return (
      <Fragment>
        <div className={cx(styles.importExport, fieldClassName, 'mb-4')}>
          <label className={styles.importExport__label} htmlFor={label}>
            {label}
            <p className={styles['importExport__label--helper']}>
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn More
                </a>
              ) : null}
            </p>
          </label>
          <div className={styles.inputWrap}>
            <Input
              type={type || 'text'}
              name='name'
              icon={icon}
              iconClickHandler={
                id !== 32 ? () => this.redirect(uiValue) : this.handleEmailCopy
              }
              placeholder={defaultPlaceholder}
              value={uiValue}
              className={cx(styles.input, className)}
              onChange={this.handleInputChange}
              onBlur={editable === false || !editable ? null : this.handleBlur}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default FormInput;
