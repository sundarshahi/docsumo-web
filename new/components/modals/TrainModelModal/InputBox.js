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
  }

  handleInputChange = (e) => {
    const { changeSamplingValue } = this.props;
    if (
      (changeSamplingValue && e.target.value > 0 && e.target.value < 101) ||
      e.target.value === ''
    ) {
      this.setState(
        {
          uiValue: e.target.value,
        },
        () => {
          changeSamplingValue(this.state.uiValue);
        }
      );
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
      defaultPlaceholder,
      disabled = false,
    } = this.props;
    const { uiValue } = this.state;

    return (
      <Fragment>
        {mainField === true ? (
          <div className={cx(styles.inputBox, fieldClassName, 'mt-4')}>
            <label className={styles.inputBox__label} htmlFor={label}>
              {label}
              <p className={cx(styles['inputBox__label--helper'], 'mt-2')}>
                {helpText}{' '}
                {link ? (
                  <a
                    className={styles.link}
                    target='_blank'
                    rel='noopener noreferrer'
                    href={link}
                  >
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>

            <div className={styles.inputBox__inputWrap}>
              <Input
                className={styles['inputBox__inputWrap--input']}
                name='name'
                type='text'
                placeholder={defaultPlaceholder}
                value={uiValue}
                disabled={disabled}
                onChange={this.handleInputChange}
              />
            </div>
          </div>
        ) : (
          <div className={cx(styles.inputBox, fieldClassName, 'mt-4')}>
            <label className={styles.inputBox__label} htmlFor={label}>
              {label}
              <p className={cx(styles['inputBox__label--helper'], 'mt-2')}>
                {helpText}{' '}
                {link ? (
                  <a
                    className={styles.link}
                    target='_blank'
                    rel='noopener noreferrer'
                    href={link}
                  >
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>
            <div className={styles.inputBox__inputWrap}>
              <Input
                className={styles.inputBox__input}
                name='name'
                id={label}
                type={type || 'text'}
                placeholder={defaultPlaceholder}
                value={uiValue}
                disabled={disabled}
                onChange={this.handleInputChange}
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default InputBox;
