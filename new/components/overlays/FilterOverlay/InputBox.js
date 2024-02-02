import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import Input from 'new/ui-elements/Input/Input';

import styles from './inputBox.scss';

class InputBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
    };
  }
  UNSAFE_componentWillMount() {
    const { value, indexCheck } = this.props;
    {
      value || value === 0
        ? this.setState({
            //dropDownValue:label || option && option[0].label,
            uiValue: value,
            indexValue: indexCheck && indexCheck.value,
          })
        : null;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({
        uiValue: this.props.value === undefined ? '' : this.props.value,
      });
    }
    if (
      prevProps.indexCheck &&
      this.props.indexCheck &&
      prevProps.indexCheck !== this.props.indexCheck
    ) {
      this.setState({
        indexValue: this.props.indexCheck && this.props.indexCheck.value,
      });
    }
  }

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
    });
  };

  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId, type, value } = this.props;
    handleChangedValueSubmit({
      id: id,
      value:
        type === 'number' ? parseInt(this.state.uiValue) : this.state.uiValue,
      filterId: filterId,
      onError: (prevValue) => {
        this.setState({ uiValue: prevValue });
      },
    });
    if (type === 'number' && !this.state.uiValue) {
      this.setState({
        uiValue: value,
      });
    }
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
      changeDataTypeFromSettings,
    } = this.props;
    const { uiValue } = this.state;
    let placeholder = '';
    switch (label) {
      case 'Round':
        placeholder = '0';
        break;
      case 'Confidence Greater Than':
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
              placeholder={placeholder}
              value={uiValue}
              min='0'
              disabled={changeDataTypeFromSettings}
              className={cx(styles.input, className)}
              inputGroupClassName={styles.inputGroup}
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
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
              min='0'
              name={label}
              placeholder={placeholder}
              value={uiValue}
              disabled={
                this.state.indexValue === 302 || changeDataTypeFromSettings
              }
              className={cx(styles.input, className)}
              onChange={this.handleInputChange}
              inputGroupClassName={styles.inputGroup}
              onBlur={this.handleBlur}
            />
          </div>
        )}
      </Fragment>
    );
  }
}

export default InputBox;
