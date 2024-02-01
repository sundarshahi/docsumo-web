import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { ReactComponent as CaretDownIcon } from 'images/icons/caret-down.svg';
import { capitalize } from 'lodash';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';

import styles from './dropdown.scss';

class SelectModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      dropDownValue: 'Select',
    };
  }

  UNSAFE_componentWillMount() {
    const { selectedModelType } = this.props;
    if (selectedModelType) {
      this.setState({
        //dropDownValue:label || option && option[0].label,
        dropDownValue: capitalize(selectedModelType),
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedModelType, selectedDoctype } = this.props;
    if (selectedModelType !== prevProps.selectedModelType) {
      this.setState({
        //dropDownValue:label || option && option[0].label,
        dropDownValue: capitalize(selectedModelType),
      });
    }
    if (
      selectedDoctype !== prevProps.selectedDoctype &&
      !selectedDoctype.length
    ) {
      this.setState({
        dropDownValue: 'Select',
      });
    }
  }

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  };

  changeValue = (value, label) => {
    this.toggle();
    const { changeModelType } = this.props;

    this.setState({
      dropDownValue: label,
    });
    this.setState(
      {
        dropDownValue: label,
      },
      () => {
        changeModelType(value);
      }
    );
  };

  render() {
    const { option, className, label, selectedDoctype } = this.props;
    return (
      <Fragment>
        <div
          className={cx(styles.generalMainField)}
          title={!selectedDoctype.length ? 'Please select document type' : ''}
        >
          <label htmlFor={label}>{label}</label>
          <div className={cx(styles.inputWrap, className)}>
            <Dropdown
              isOpen={this.state.dropdownOpen}
              toggle={!selectedDoctype.length ? null : this.toggle}
              className={cx(styles.dropGroup)}
              disabled={!selectedDoctype.length}
            >
              {this.state.dropDownValue && (
                <DropdownToggle
                  caret
                  className={cx(styles.btn, styles.dropdownToggle, {
                    [styles.fieldDisable]: !selectedDoctype.length,
                  })}
                  disabled={!selectedDoctype.length}
                >
                  {this.state.dropDownValue}
                  <CaretDownIcon className={styles.icon} />
                </DropdownToggle>
              )}
              {this.state.dropdownOpen && (
                <DropdownMenu className={cx(styles.dropdownMenu)}>
                  {option &&
                    option.map((item) => {
                      return (
                        <DropdownItem
                          className={styles.dropdownItem}
                          onClick={() =>
                            this.changeValue(item.value, item.title, item.id)
                          }
                          key={item.id}
                        >
                          <div className={styles.label}>{item.title}</div>
                        </DropdownItem>
                      );
                    })}
                </DropdownMenu>
              )}
            </Dropdown>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SelectModel;
