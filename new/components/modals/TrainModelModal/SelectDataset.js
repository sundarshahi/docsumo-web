import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { capitalize } from 'lodash';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';

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
    const { option, className, label, helpText } = this.props;
    return (
      <Fragment>
        <div className={styles.dataset}>
          <div className={styles.dataset__content}>
            <label className={styles.dataset__label} htmlFor={label}>
              {label}
            </label>
            <p className={styles.dataset__helper}>{helpText}</p>
          </div>
          <div className={cx(styles.inputBox__inputWrap, className)}>
            <Dropdown
              onChange={(e) => this.changeValue(e)}
              placeholder='Select document type'
              value={this.state.dropDownValue}
              data={option}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SelectDataset;
