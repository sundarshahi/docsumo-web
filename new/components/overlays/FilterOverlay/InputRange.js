import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import Input from 'new/ui-elements/Input/Input';

import styles from './inputRange.scss';

class InputRange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValueOne: '',
      uiValueTwo: '',
    };
  }

  UNSAFE_componentWillMount() {
    const { value } = this.props;
    if (value) {
      for (let i = 0; i < value.length; i++) {
        if (value[i].id === 191) {
          this.setState({
            uiValueOne: value[i].value,
          });
        } else {
          this.setState({
            uiValueTwo: value[i].value,
          });
        }
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      const { value } = this.props;
      if (value && value.length) {
        for (let i = 0; i < value.length; i++) {
          if (value[i].id === 191) {
            this.setState({
              uiValueOne: value[i].value,
            });
          } else {
            this.setState({
              uiValueTwo: value[i].value,
            });
          }
        }
      } else {
        this.setState({
          uiValueOne: '',
          uiValueTwo: '',
        });
      }
    }
  }

  handleInputOneChange = (e) => {
    this.setState({
      ...this.state,
      uiValueOne: e.target.value,
    });
  };
  handleInputTwoChange = (e) => {
    this.setState({
      ...this.state,
      uiValueTwo: e.target.value,
    });
  };

  handleMinBlur = (valueId) => {
    const {
      handleChangedValueSubmit,
      id,
      filterId,
      value: fieldValue = [],
      appActions,
    } = this.props;

    let value = this.state.uiValueOne;

    if (
      this.state.uiValueTwo &&
      this.state.uiValueOne &&
      this.state.uiValueOne > this.state.uiValueTwo
    ) {
      appActions.setToast({
        title: 'The min value cannot be greater than max value',
        error: true,
      });
      this.setState({
        uiValueOne: parseInt(this.state.uiValueTwo) - 1,
      });
      handleChangedValueSubmit({
        id: id,
        valueId: valueId,
        value: parseInt(this.state.uiValueTwo) - 1,
        filterId: filterId,
      });
      return;
    }

    handleChangedValueSubmit({
      id: id,
      valueId: valueId,
      value: parseInt(value),
      filterId: filterId,
    });
  };

  handleMaxBlur = (valueId) => {
    const {
      handleChangedValueSubmit,
      id,
      filterId,
      value: fieldValue,
      appActions,
    } = this.props;

    let value = this.state.uiValueTwo;

    if (
      this.state.uiValueOne &&
      this.state.uiValueTwo &&
      this.state.uiValueTwo < this.state.uiValueOne
    ) {
      appActions.setToast({
        title: 'The max value cannot be less than min value',
        error: true,
      });
      this.setState({
        uiValueTwo: parseInt(this.state.uiValueOne) + 1,
      });
      handleChangedValueSubmit({
        id: id,
        valueId: valueId,
        value: parseInt(this.state.uiValueOne) + 1,
        filterId: filterId,
      });
      return;
    }

    handleChangedValueSubmit({
      id: id,
      valueId: valueId,
      value: parseInt(value),
      filterId: filterId,
    });
  };

  render() {
    const {
      className,
      label,
      helpText,
      placeholderOne,
      placeholderTwo,
      fieldClassName,
      option,
      link,
      changeDataTypeFromSettings,
    } = this.props;
    const { uiValueOne, uiValueTwo } = this.state;

    return (
      <Fragment>
        <div className={cx(styles.generalField, fieldClassName)}>
          <label htmlFor='range'>
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
          <div className={styles.inputWrap}>
            <Input
              id='range'
              type='number'
              min='0'
              name='One'
              placeholder={placeholderOne}
              value={uiValueOne}
              className={cx(styles.input, className)}
              onChange={this.handleInputOneChange}
              onBlur={(e) => this.handleMinBlur(option[0].id)}
              disabled={changeDataTypeFromSettings}
            />
            <Input
              id='range'
              type='number'
              min='0'
              name='Two'
              placeholder={placeholderTwo}
              value={uiValueTwo}
              className={cx(styles.input, className)}
              onChange={this.handleInputTwoChange}
              onBlur={(e) => this.handleMaxBlur(option[1].id)}
              disabled={changeDataTypeFromSettings}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default InputRange;
