/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { capitalize } from 'lodash';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './dropDownDocType.scss';

class DropdownDocType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      dropDownValue: 'Select',
      isDropdownOpen: false,
      selectedDocType: [],
      hideDropdown: false,
      doctypesChecked: {},
    };
  }

  UNSAFE_componentWillMount() {
    const { selectedDocType } = this.props;
    if (selectedDocType) {
      this.setState({
        //dropDownValue:label || option && option[0].label,
        dropDownValue: capitalize(selectedDocType),
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedDocType } = this.props;
    if (selectedDocType !== prevProps.selectedDocType) {
      this.setState({
        dropDownValue: capitalize(selectedDocType),
      });
    }
  }

  handleCheckboxChange = (result) => {
    this.setState({ isDropdownOpen: true });
    this.handleCheckboxCheck(result);
    const color = '#EFF1F9';
    const { changeDocType } = this.props;
    const { selectedDocType } = this.state;
    const { value } = result;
    const isValuePresent = selectedDocType.find((item) => item.value === value);
    if (isValuePresent) {
      let filteredSelectedDocType = selectedDocType.filter(
        (item) => item.value !== value
      );
      this.setState(
        {
          selectedDocType: [...filteredSelectedDocType],
        },
        () => {
          changeDocType(this.state.selectedDocType);
          this.showOnlyDocTypes();
        }
      );
    } else {
      this.setState(
        {
          selectedDocType: [
            ...this.state.selectedDocType,
            {
              value: result.value,
              title: result.title,
              color: color,
            },
          ],
        },
        () => {
          changeDocType(this.state.selectedDocType);
          this.showOnlyDocTypes();
        }
      );
    }
  };

  changeValue = (e) => {
    const { changeDocType } = this.props;
    changeDocType(e);
  };

  toggleDropDown = () => {
    this.setState({ isDropdownOpen: true });
  };

  hideDropdDownBtn = () => {
    this.setState({ isDropdownOpen: false });
  };

  hideDropDownOnOptionsOpen = (e) => {
    this.setState({ isDropdownOpen: false });
  };

  showOnlyDocTypes = () => {
    if (this.state.selectedDocType.length > 0) {
      this.setState({ hideDropdown: true });
    } else {
      this.setState({ hideDropdown: false });
    }
  };

  handleCheckboxCheck = ({ value }) => {
    if (this.state.doctypesChecked[value]) {
      this.setState((prevState) => ({
        doctypesChecked: {
          ...prevState.doctypesChecked,
          [value]: false,
        },
      }));
    } else {
      this.setState((prevState) => ({
        doctypesChecked: {
          ...prevState.doctypesChecked,
          [value]: true,
        },
      }));
    }
  };

  isDisabled = (validDocList, item) => {
    return validDocList.length && !validDocList.includes(item.value);
  };

  render() {
    const { option, className, label, validDocList, helpText } = this.props;
    const { selectedDocType, isDropdownOpen } = this.state;

    const viewSelected =
      selectedDocType.length < 7
        ? selectedDocType
        : selectedDocType.slice(0, 6);
    const hideSelected =
      selectedDocType.length > 6
        ? selectedDocType.slice(6, selectedDocType.length)
        : null;
    return (
      <Fragment>
        <OutsideClickHandler onOutsideClick={this.hideDropDownOnOptionsOpen}>
          <div className={cx(styles.inputBox, 'mt-4')}>
            <label className={styles.inputBox__label} htmlFor={label}>
              {label}
              <p className={cx(styles['inputBox__label--helper'], 'mt-2')}>
                {helpText}
              </p>
            </label>
            <div className={cx(styles.inputBox__inputWrap, className)}>
              {
                <Dropdown
                  iconToggle={isDropdownOpen}
                  placeholder={
                    this.state.hideDropdown ? (
                      <div className={styles.trainFrom__row}>
                        {viewSelected.slice(0, 5).map((item, index) => {
                          return (
                            <div
                              className={styles.trainFrom__selection}
                              key={index}
                            >
                              <Tooltip
                                placement='bottom'
                                label={capitalize(item.value)}
                              >
                                <div
                                  className={
                                    styles['trainFrom__selection--name']
                                  }
                                >
                                  <p>{item?.title?.charAt(0).toUpperCase()}</p>
                                </div>
                              </Tooltip>
                            </div>
                          );
                        })}
                        {selectedDocType.length > 5 && (
                          <Tooltip
                            placement='bottom'
                            label={`${selectedDocType.length - 5} More`}
                          >
                            <div
                              className={styles['trainFrom__selection--name']}
                            >
                              <p>{selectedDocType.length - 5}+</p>
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    ) : (
                      'Select Value'
                    )
                  }
                  data={option}
                  onClick={this.toggleDropDown}
                  onOutsideClick={this.hideDropdDownBtn}
                >
                  {isDropdownOpen ? (
                    <div className={styles.dropdown__option}>
                      {option.map((item, idx) => {
                        return (
                          <div
                            onClick={() => {
                              !this.isDisabled(validDocList, item) &&
                                this.handleCheckboxChange(item);
                            }}
                            key={idx}
                            className={cx(styles.dropdown__option__value, {
                              'cursor-not-allowed': this.isDisabled(
                                validDocList,
                                item
                              ),
                            })}
                          >
                            <span>
                              <Checkbox
                                disabled={this.isDisabled(validDocList, item)}
                                value={item.value}
                                name={item.title}
                                onChange={() => {
                                  this.handleCheckboxChange(item);
                                }}
                                checked={this.state.doctypesChecked[item.value]}
                              />
                            </span>
                            <span
                              title={item.title}
                              className={cx('ml-2', 'text-truncate', {
                                [styles.disabled]: this.isDisabled(
                                  validDocList,
                                  item
                                ),
                              })}
                            >
                              {item.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </Dropdown>
              }
            </div>
          </div>
        </OutsideClickHandler>
      </Fragment>
    );
  }
}

export default DropdownDocType;
