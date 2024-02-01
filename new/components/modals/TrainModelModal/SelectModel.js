import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { capitalize } from 'lodash';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';

import styles from './selectModel.scss';

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
        dropDownValue: capitalize(selectedModelType),
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedModelType, selectedDoctype } = this.props;
    if (selectedModelType !== prevProps.selectedModelType) {
      this.setState({
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

  changeValue = ({ value, title }) => {
    this.toggle();
    const { changeModelType } = this.props;
    this.setState(
      {
        dropDownValue: value,
      },
      () => {
        changeModelType(value);
      }
    );
  };

  onChangeDropdown = (e) => {
    this.setState({
      dropDownValue: e,
    });
  };

  render() {
    const { option, className, label, selectedDoctype, helpText } = this.props;
    return (
      <Fragment>
        <div className={cx(styles.inputBox, 'mt-4')}>
          <div>
            <label className={cx(styles.inputBox__label)} htmlFor={label}>
              {label}
            </label>
            <p className={cx(styles['inputBox__label--helper'], 'mt-2')}>
              {helpText}
            </p>
          </div>
          <div className={cx(styles.inputBox__inputWrap, className)}>
            <Dropdown
              onChange={(e) => this.changeValue(e)}
              placeholder='Select model type'
              value={this.state.dropDownValue}
              data={option}
              disabled={!selectedDoctype.length}
              dropdownDisabledTooltipLabel='Please select atleast one model type to train from'
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SelectModel;
