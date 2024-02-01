import React, { Component } from 'react';

import cx from 'classnames';
import find from 'lodash/find';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import ToggleControl from 'new/ui-elements/ToggleControl/ToggleControl';

import styles from './newTrainModel.scss';

class NewTrainModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchValue: false,
      dropdownOpen: false,
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
    const optionValue = status && find(option, { id: status });
    const { value } = optionValue || {};
    const dropValue = model && find(dropDownOption, { id: model });
    const { label } = dropValue || {};

    this.setState({
      switchValue: value,
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
      const optionValue = status && find(option, { id: status });
      const { value } = optionValue || {};
      const dropValue = model && find(dropDownOption, { id: model });
      const { label } = dropValue || {};

      this.setState({
        switchValue: value,
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
    const optionValue = status && find(option, { id: status });
    const { value } = optionValue || {};
    const dropValue = model && find(dropDownOption, { id: model });
    const { label } = dropValue || {};

    this.setState({
      switchValue: value,
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
        const { id: itemId } = find(option, {
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
        dropDownValue: itemId,
      },
      () => {
        const { option } = this.props;
        const { id: statusId } = find(option, {
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
          uiValue: this.state.currentModel.toLowerCase(),
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
    const { labelText, helpText, link, dropDownOption } = this.props;

    const { switchValue, currentModel } = this.state;
    const { label = '' } =
      dropDownOption.find((item) => item.id === currentModel) || {};

    return (
      <>
        <div className={cx(styles.trainModel, 'mb-4')}>
          <label htmlFor='switch' className={styles.trainModel__label}>
            {labelText}
            <p className={styles['trainModel__label--helper']}>
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn more
                </a>
              ) : null}
            </p>
          </label>

          <div className={styles.inputWrap}>
            <div className={cx(styles.switchInput, 'mr-4')}>
              <ToggleControl
                size='small'
                className={styles.switch}
                handleStatus={this.handleStatus}
                checked={this.state.switchValue}
              />
            </div>

            <div
              title={currentModel === 'none' ? '' : label}
              className={cx({
                [styles.inputDisabled]: !switchValue,
              })}
            >
              {
                <Dropdown
                  value={currentModel}
                  disabled={!switchValue}
                  data={dropDownOption || []}
                  optionLabelKey='label'
                  optionValueKey='id'
                  onChange={this.changeValue}
                />
              }
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default NewTrainModel;
