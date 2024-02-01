import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';

import styles from './dropDown.scss';

class DropDown extends Component {
  constructor(props) {
    super(props);
  }

  changeValue = ({ label: selectedLabel, id: selectedItemId }) => {
    const { handleChangedValueSubmit, id, filterId, labelText } = this.props;

    handleChangedValueSubmit({
      id: id,
      value: selectedItemId,
      filterId: filterId,
      label: labelText, // label is used only for mixpanel tracking
      uiValue: selectedLabel.toLowerCase(),
    });
  };

  render() {
    const {
      option,
      value,
      mainField,
      labelText,
      helpText,
      link,
      className,
      id,
    } = this.props;

    return (
      <Fragment>
        {mainField === true ? (
          <div className={styles.dropdownFields}>
            <label htmlFor={labelText} className={styles.dropdownFields__label}>
              {labelText}
              <p
                className={cx(styles['dropdownFields__label--helper'], 'mt-2')}
              >
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>
            <div className={styles.inputWrap}>
              <Dropdown
                data={option || []}
                optionLabelKey='label'
                optionValueKey='id'
                onChange={this.changeValue}
                value={value}
              />
            </div>
          </div>
        ) : (
          <div className={cx(styles.dropdownFields, className)}>
            <label
              className={cx(
                styles.dropdownFields__label,
                id === 2 && {
                  'text-md font-semibold': !mainField,
                }
              )}
              htmlFor={labelText}
            >
              {labelText}
              <p
                className={cx(
                  id === 2
                    ? styles['dropdownFields__label--helper']
                    : styles['dropdownFields__label--helperAlt'],
                  'mt-2'
                )}
              >
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>
            <div className={styles.inputWrap}>
              <Dropdown
                data={option || []}
                optionLabelKey='label'
                optionValueKey='id'
                onChange={this.changeValue}
                value={value}
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default DropDown;
