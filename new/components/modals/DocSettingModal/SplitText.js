import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import Input from 'new/ui-elements/Input/Input';

import styles from './inputBox.scss';

class SplitText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
    };
  }
  UNSAFE_componentWillMount() {
    const { value, splitValue } = this.props;
    {
      value || value === 0
        ? this.setState({
            //dropDownValue:label || option && option[0].label,
            uiValue: value,
            splitValue: splitValue.value,
          })
        : null;
    }
    this.setState({
      splitValue: splitValue.value,
    });
  }

  componentDidUpdate(prevProps) {
    const { splitValue } = this.props;
    if (prevProps.splitValue !== this.props.splitValue) {
      this.setState({
        splitValue: splitValue.value,
      });
    }
  }

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
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
      helpText,
      fieldClassName,
      type,
      mainField,
      link,
      defaultPlaceholder,
      editable,
    } = this.props;
    const { uiValue, splitValue } = this.state;
    if (splitValue !== 122) {
      return null;
    }
    let placeholder = '';
    switch (label) {
      case 'Round':
        placeholder = '0';
        break;
      case 'Confidence Greater Than':
        placeholder = '%';
        break;
      case 'Confidence Score':
        placeholder = '%';
        break;
      case 'Notification':
        placeholder = 'No. of hours';
        break;
      default:
        placeholder = ' ';
        break;
    }
    return (
      <Fragment>
        {mainField === true ? (
          <div className={cx(styles.splitText, fieldClassName, 'mt-4')}>
            <label className={cx(styles.splitText__label)} htmlFor={label}>
              {label}
              <p className={cx(styles['splitText__label--helper'])}>
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
                onChange={this.handleInputChange}
                onBlur={editable === false ? null : this.handleBlur}
                type={type || 'text'}
                name='name'
                placeholder={defaultPlaceholder || placeholder}
                value={uiValue}
                className={cx(styles.input, className)}
              />
            </div>
          </div>
        ) : (
          <div className={cx(styles.splitText, fieldClassName, 'mt-4')}>
            <label className={cx(styles.splitText__label)} htmlFor={label}>
              {label}
              <p className={cx(styles['splitText__label--helper'])}>
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
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
                type={type || 'text'}
                name='name'
                placeholder={defaultPlaceholder || placeholder}
                value={uiValue}
                className={cx(styles.input, className)}
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default SplitText;
