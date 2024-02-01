import React, { Component, Fragment } from 'react';

import cx from 'classnames';

import styles from './percentageBox.scss';

class PercentageBox extends Component {
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
      defaultPlaceholder,
      type,
      mainField,
      link,
    } = this.props;
    const { uiValue } = this.state;
    let placeholder = '';
    switch (label) {
      case 'Confidence Greater Than':
        placeholder = '%';
        break;
      case 'Confidence Score':
        placeholder = '%';
        break;
      default:
        placeholder = ' ';
        break;
    }
    return (
      <Fragment>
        {mainField === true ? (
          <div className={cx(styles.generalMainField, fieldClassName)}>
            <label htmlFor={label}>
              {label}
              <p className={styles.helpText}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>

            <div className={styles.inputWrap}>
              <input
                id={label}
                type={type || 'text'}
                name='name'
                placeholder={defaultPlaceholder || placeholder}
                value={uiValue}
                disabled={
                  label === 'Display label' || label === 'Display Label'
                }
                className={cx(styles.input, className)}
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
              />
            </div>
          </div>
        ) : (
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
              <input
                id={label}
                type={type || 'text'}
                name='name'
                placeholder={defaultPlaceholder || placeholder}
                value={uiValue}
                className={cx(styles.input, className)}
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default PercentageBox;
