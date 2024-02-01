import React, { Component, Fragment } from 'react';

import cx from 'classnames';

import styles from './inputEpochBox.scss';

class InputEpochBox extends Component {
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
    const { changeEpochValue } = this.props;
    if (
      (changeEpochValue && e.target.value > 0 && e.target.value < 51) ||
      e.target.value === ''
    ) {
      this.setState(
        {
          uiValue: e.target.value,
        },
        () => {
          changeEpochValue(this.state.uiValue);
        }
      );
    }
  };

  // handleBlur = () => {
  //     const { handleChangedValueSubmit, id, filterId, type} = this.props;
  //     handleChangedValueSubmit({
  //         id: id,
  //         value: type === 'number' ? parseInt(this.state.uiValue) : this.state.uiValue,
  //         filterId: filterId,
  //     });
  // }
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
    } = this.props;
    const { uiValue } = this.state;
    // let placeholder='';
    // switch(label){
    // case 'Round':
    //     placeholder='0';
    //     break;
    // case 'Confidence Greater Than':
    //     placeholder='%';
    //     break;
    // default:
    //     placeholder=' ';
    //     break;
    // }
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
                min={type === 'number' ? 0 : null}
                max={type === 'number' ? 50 : null}
                name='name'
                placeholder={defaultPlaceholder}
                value={uiValue}
                disabled={
                  label === 'No. of Documents in Training' ||
                  label === 'Display Label'
                }
                className={cx(styles.input, className)}
                onChange={this.handleInputChange}
                //onBlur={this.handleBlur}
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
                placeholder={defaultPlaceholder}
                value={uiValue}
                disabled={
                  label === 'No. of Documents in Training' ||
                  label === 'Display Label'
                }
                className={cx(styles.input, className)}
                onChange={this.handleInputChange}
                //onBlur={this.handleBlur}
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default InputEpochBox;
