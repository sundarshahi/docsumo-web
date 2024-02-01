import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import Input from 'new/ui-elements/Input/Input';

import styles from './CommonInput.scss';

class CommonInput extends Component {
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
    const { changeInputFieldHandler, name } = this.props;

    this.setState(
      {
        uiValue: e.target.value,
      },
      () => {
        changeInputFieldHandler(name, this.state.uiValue);
      }
    );
  };

  render() {
    const {
      className,
      label,
      helpText,
      fieldClassName,
      type,
      link,
      defaultPlaceholder,
      name,
    } = this.props;
    const { uiValue } = this.state;
    return (
      <Fragment>
        <div className={cx(styles.inputBox, fieldClassName, 'mt-4')}>
          <label className={styles.inputBox__label} htmlFor={label}>
            {label}
            {helpText && (
              <p className={cx(styles['inputBox__helper'], 'mt-2')}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn more
                  </a>
                ) : null}
              </p>
            )}
          </label>

          <div className={styles.inputBox__inputWrap}>
            <Input
              className={styles['inputBox__inputWrap-input']}
              name={name}
              type={type || 'text'}
              placeholder={defaultPlaceholder}
              min={type === 'number' ? 0 : null}
              max={type === 'number' ? 50 : null}
              value={uiValue}
              disabled={
                label === 'No. of Documents in Training' ||
                label === 'Display Label'
              }
              onChange={this.handleInputChange}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default CommonInput;
