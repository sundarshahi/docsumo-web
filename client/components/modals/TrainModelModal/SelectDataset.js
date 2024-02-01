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

import styles from './selectDataset.scss';

class SelectDataset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      dropDownValue: 'Select',
    };
  }

  UNSAFE_componentWillMount() {
    const { option } = this.props;
    if (option) {
      this.setState({
        //dropDownValue:label || option && option[0].label,
        dropDownValue: option[0].title,
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedDataset } = this.props;
    if (selectedDataset !== prevProps.selectedDataset) {
      this.setState({
        //dropDownValue:label || option && option[0].label,
        dropDownValue: capitalize(selectedDataset),
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
    const { changeSampleDataset } = this.props;

    this.setState(
      {
        dropDownValue: label,
      },
      () => {
        changeSampleDataset(value);
      }
    );
  };

  render() {
    const { option, className, label } = this.props;
    return (
      <Fragment>
        <div className={styles.generalMainField}>
          <label htmlFor={label}>{label}</label>
          <div className={cx(styles.inputWrap, className)}>
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

export default SelectDataset;
