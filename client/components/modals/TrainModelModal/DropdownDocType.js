/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { Checkbox } from 'client/components/widgets/checkbox';
import { ReactComponent as ArrowDropdownIcon } from 'images/icons/caret-down.svg';
import { capitalize } from 'lodash';
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
        //dropDownValue:label || option && option[0].label,
        dropDownValue: capitalize(selectedDocType),
      });
    }
  }

  handleCheckboxChange = (result) => {
    var colors = ['#3D9F75', '#7AABB7', '#717677', '#337281', '#4FBED9'];

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
        }
      );
    } else {
      this.setState(
        {
          selectedDocType: [
            ...this.state.selectedDocType,
            {
              value: result.value,
              title: result.name,
              color: colors[Math.floor(Math.random() * colors.length)],
            },
          ],
        },
        () => {
          changeDocType(this.state.selectedDocType);
        }
      );
    }
  };
  toggle = () => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen,
    });
  };

  changeValue = (value, label) => {
    this.toggle();
    const { changeDocType } = this.props;
    this.setState(
      {
        dropDownValue: label,
      },
      () => {
        changeDocType(value);
      }
    );
  };

  render() {
    const { option, className, label, validDocList } = this.props;
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
        <div className={styles.generalMainField}>
          <label htmlFor={label}>{label}</label>
          <div className={cx(styles.inputWrap, className)}>
            <div
              className={cx('unstyled-btn', className, styles.dropdownBtn)}
              onClick={this.toggle}
            >
              {selectedDocType.length ? (
                <div className={styles.selectedValue}>
                  {viewSelected.slice(0, 6).map((item) => {
                    let nameArray = item && item.title.split(' ');
                    let firstInitial = '';
                    let lastInitial = '';
                    if (nameArray.length > 1) {
                      firstInitial = nameArray[0].substring(0, 1).toUpperCase();
                      lastInitial = nameArray[nameArray.length - 1]
                        .substring(0, 1)
                        .toUpperCase();
                    } else {
                      firstInitial = nameArray[0].substring(0, 1).toUpperCase();
                      lastInitial = null;
                    }

                    return (
                      <>
                        <div
                          className={styles.initial}
                          style={{
                            backgroundColor: item.color,
                          }}
                        >
                          <div className={styles.name}>
                            {firstInitial}
                            {lastInitial}
                          </div>
                          <div className={styles.tooltip}>
                            {item.title}
                            <div className={styles.arrow} />
                          </div>
                        </div>
                      </>
                    );
                  })}
                  {hideSelected && hideSelected.length ? (
                    <div
                      className={styles.hide}
                      style={{
                        backgroundColor: '#4FBED9',
                      }}
                    >
                      <div className={styles.name}>
                        {`${hideSelected.length} +`}
                      </div>
                      <div className={styles.tooltip}>
                        {hideSelected.map((item) => (
                          <p key={item.title}>{item.title}</p>
                        ))}
                        <div className={styles.arrow} />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                'Select'
              )}
              <ArrowDropdownIcon
                className={cx(styles.icon, {
                  [styles.iconInvert]: isDropdownOpen,
                })}
              />
            </div>
            {isDropdownOpen ? (
              <OutsideClickHandler onOutsideClick={this.toggle}>
                <div className={styles.dropdownBox}>
                  <div className={styles.label}>
                    {option.map((item) => {
                      return (
                        <Checkbox
                          key={item.value}
                          name={item.title}
                          id={item.value}
                          label={item.title}
                          checked={
                            (selectedDocType &&
                              selectedDocType.find(
                                (pro) => pro.value === item.value
                              )) ||
                            false
                          }
                          value={item.value}
                          disabled={
                            validDocList.length &&
                            !validDocList.includes(item.value)
                          }
                          className={styles.rootCheck}
                          labelClassName={styles.checkLabel}
                          onChange={this.handleCheckboxChange}
                        />
                      );
                    })}
                  </div>
                </div>
              </OutsideClickHandler>
            ) : null}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default DropdownDocType;
