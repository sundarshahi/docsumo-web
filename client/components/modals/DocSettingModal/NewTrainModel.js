import React, { Component } from 'react';

import cx from 'classnames';
import { ReactComponent as CaretDownIcon } from 'images/icons/caret-down.svg';
import _ from 'lodash';
import Switch from 'react-switch';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';

import styles from './newTrainModel.scss';

class NewTrainModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchValue: false,
      dropdownOpen: false,
      dropDownValue: 'Select',
      currentModel: 'none',
    };
  }
  UNSAFE_componentWillMount() {
    //const { value }=this.props;
    const {
      option,
      value: { status, model },
      dropDownOption,
    } = this.props;
    const optionValue = status && _.find(option, { id: status });
    const { value } = optionValue || {};
    const dropValue = model && _.find(dropDownOption, { id: model });
    const { label } = dropValue || {};

    this.setState({
      switchValue: value,
      dropDownValue: label ? label : 'Select',
      currentModel: model,
      //switchValue:value
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value.status !== this.props.value.status) {
      const {
        option,
        value: { status, model },
        dropDownOption,
      } = this.props;
      const optionValue = status && _.find(option, { id: status });
      const { value } = optionValue || {};
      const dropValue = model && _.find(dropDownOption, { id: model });
      const { label } = dropValue || {};

      this.setState({
        switchValue: value,
        dropDownValue: label ? label : 'Select',
        currentModel: model,
        //switchValue:value
      });
    }
  }

  checkError = () => {
    const {
      option,
      value: { status, model },
      dropDownOption,
    } = this.props;
    const optionValue = status && _.find(option, { id: status });
    const { value } = optionValue || {};
    const dropValue = model && _.find(dropDownOption, { id: model });
    const { label } = dropValue || {};

    this.setState({
      switchValue: value,
      dropDownValue: label ? label : 'Select',
      currentModel: model,
    });
  };

  handleStatus = () => {
    this.setState(
      {
        switchValue: !this.state.switchValue,
      },
      () => {
        const { handleChangedValueSubmit, id, filterId, labelText } =
          this.props;
        const { option } = this.props;
        const { id: itemId } = _.find(option, {
          value: this.state.switchValue,
        });
        handleChangedValueSubmit({
          id: id,
          value: {
            status: itemId,
            model: itemId === 202 ? 'none' : this.state.currentModel,
          },
          filterId: filterId,
          label: labelText,
        });
      }
    );
  };

  changeValue = (item) => {
    const { handleChangedValueSubmit, id, filterId } = this.props;
    this.toggle();
    const { id: itemId, label } = item;

    this.setState(
      {
        dropDownValue: label,
      },
      () => {
        const { option } = this.props;
        const { id: statusId } = _.find(option, {
          value: this.state.switchValue,
        });
        handleChangedValueSubmit({
          id: id,
          value: {
            status: statusId,
            model: itemId,
          },
          filterId: filterId,
          label: label,
          uiValue: this.state.dropDownValue.toLowerCase(),
          checkError: this.checkError,
        });
      }
    );
  };

  toggle = () => {
    const { switchValue } = this.state;
    if (!switchValue) {
      return null;
    }
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  };

  render() {
    const { labelText, helpText, link, label, dropDownOption } = this.props;

    const { switchValue } = this.state;

    return (
      <>
        <div className={styles.generalField}>
          <label htmlFor='switch'>
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
            <div className={styles.switchInput}>
              <Switch
                onColor={'#405089'}
                offColor={'#e8eaed'}
                height={15}
                width={40}
                checkedIcon={null}
                uncheckedIcon={null}
                //disabled = {}
                checked={this.state.switchValue}
                onChange={this.handleStatus}
                handleDiameter={20}
                className={styles.switch}
                boxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
                activeBoxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
              />
            </div>

            <div
              title={this.state.dropDownValue}
              className={cx(styles.dropdownInput, {
                [styles.inputDisabled]: !switchValue,
              })}
            >
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
                    {dropDownOption &&
                      dropDownOption.map((item) => {
                        return (
                          <DropdownItem
                            key={item.label}
                            className={styles.dropdownItem}
                            onClick={() => this.changeValue(item)}
                          >
                            <div className={styles.label} title={item.label}>
                              {item.label}
                            </div>
                          </DropdownItem>
                        );
                      })}
                  </DropdownMenu>
                )}
              </Dropdown>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default NewTrainModel;
