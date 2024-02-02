import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import Input from 'new/ui-elements/Input/Input';

import styles from './regexBox.scss';

class RegexBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
    };
  }
  UNSAFE_componentWillMount() {
    const { value } = this.props;
    {
      value
        ? this.setState({
            uiValue: value,
          })
        : null;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      const { value } = this.props;

      this.setState({
        uiValue: value === undefined ? '' : value,
      });
    }
  }

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
    });
  };

  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId } = this.props;
    handleChangedValueSubmit({
      id: id,
      value: this.state.uiValue,
      filterId: filterId,
    });
  };
  render() {
    const {
      className,
      label,
      helpText,
      defaultPlaceholder,
      fieldClassName,
      type,
      mainField,
      link,
      changeDataTypeFromSettings,
    } = this.props;
    const { uiValue } = this.state;
    return (
      <Fragment>
        {mainField === true ? (
          <div className={cx(styles.generalMainField, fieldClassName)}>
            <label htmlFor={label}>
              {label}
              <p className={styles.helpText}>
                {helpText}
                {link ? (
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href={link}
                    tabIndex='-1'
                  >
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>

            <Input
              id={label}
              type={type || 'text'}
              name={label}
              placeholder={defaultPlaceholder}
              value={uiValue}
              className={cx(styles.input, className)}
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
              disabled={changeDataTypeFromSettings}
            />
          </div>
        ) : (
          <div className={cx(styles.generalSubField, fieldClassName)}>
            <label htmlFor={label}>
              {label}
              <p className={styles.helpText}>
                {helpText}{' '}
                {link ? (
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href={link}
                    tabIndex='-1'
                  >
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>
            <Input
              id={label}
              type={type || 'text'}
              name={label}
              placeholder={defaultPlaceholder}
              value={uiValue}
              className={cx(styles.input, className)}
              inputGroupClassName='w-100'
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
              disabled={changeDataTypeFromSettings}
            />
          </div>
        )}
      </Fragment>
    );
  }
}

export default RegexBox;
