import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { ReactComponent as CaretDownIcon } from 'images/icons/caret-down.svg';
import _ from 'lodash';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';

import styles from './dropDown.scss';

class DropDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      dropDownValue: 'Select',
    };
  }

  UNSAFE_componentWillMount() {
    const { option, value } = this.props;
    const optionValue = value && _.find(option, { id: value });
    const { label } = optionValue || {};
    {
      label
        ? this.setState({
            //dropDownValue:label || option && option[0].label,
            dropDownValue: label,
          })
        : null;
    }
  }

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  };

  changeValue = (item) => {
    const { handleChangedValueSubmit, id, filterId, labelText } = this.props;
    this.toggle();
    const { id: itemId, label } = item;

    this.setState(
      {
        dropDownValue: label,
      },
      () => {
        handleChangedValueSubmit({
          id: id,
          value: itemId,
          filterId: filterId,
          label: labelText,
          uiValue: this.state.dropDownValue.toLowerCase(),
        });
      }
    );
  };

  render() {
    const {
      option,
      value,
      mainField,
      labelText,
      helpText,
      icons,
      link,
      className,
    } = this.props;
    const optionValue = value && _.find(option, { id: value });
    const { label } = optionValue || {};
    return (
      <Fragment>
        {mainField === true ? (
          <div className={cx(styles.generalMainField, className)}>
            <label htmlFor={labelText}>
              {labelText}
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
              <Dropdown
                isOpen={this.state.dropdownOpen}
                toggle={this.toggle}
                className={styles.dropGroup}
              >
                {this.state.dropDownValue && (
                  <DropdownToggle
                    caret
                    className={cx(styles.btn, styles.dropdownToggle)}
                  >
                    {this.state.dropDownValue || label}
                    <CaretDownIcon className={styles.icon} />
                  </DropdownToggle>
                )}
                {this.state.dropdownOpen && (
                  <DropdownMenu className={cx(styles.dropdownMenu)}>
                    {option &&
                      option.map((item) => {
                        return (
                          <DropdownItem
                            key={item.id}
                            className={styles.dropdownItem}
                            onClick={() => this.changeValue(item)}
                          >
                            {icons &&
                              icons.map((unit) => {
                                if (unit.id === item.id)
                                  return (
                                    <span className={styles.menuIcon}>
                                      {unit.icon}
                                    </span>
                                  );
                              })}
                            <div className={styles.label}>{item.label}</div>
                          </DropdownItem>
                        );
                      })}
                  </DropdownMenu>
                )}
              </Dropdown>
            </div>
          </div>
        ) : (
          <div className={cx(styles.generalSubField, className)}>
            <label htmlFor={labelText}>
              {labelText}
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
              <Dropdown
                isOpen={this.state.dropdownOpen}
                toggle={this.toggle}
                className={styles.dropGroup}
              >
                {this.state.dropDownValue && (
                  <DropdownToggle
                    caret
                    className={cx(styles.btn, styles.dropdownToggle)}
                  >
                    {this.state.dropDownValue || label}
                    <CaretDownIcon className={styles.icon} />
                  </DropdownToggle>
                )}
                {this.state.dropdownOpen && (
                  <DropdownMenu className={cx(styles.dropdownMenu)}>
                    {option &&
                      option.map((item) => {
                        return (
                          <DropdownItem
                            key={item.id}
                            className={styles.dropdownItem}
                            onClick={() => this.changeValue(item)}
                          >
                            {item.icon && (
                              <span className={styles.menuIcon}>
                                {item.icon}
                              </span>
                            )}
                            {item.label}
                          </DropdownItem>
                        );
                      })}
                  </DropdownMenu>
                )}
              </Dropdown>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default DropDown;
