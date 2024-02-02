import React, { Component } from 'react';

import _ from 'lodash';
import { ReactComponent as CheckIcon } from 'new/assets/images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
import ConfirmationModal from 'new/components/shared/FiledConfirmationModal';
import ToggleControl from 'new/ui-elements/ToggleControl/ToggleControl';

import styles from './inputSwitch.scss';

class InputSwitch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchValue: false,
      indexConfirmation: false,
    };
    this.overrideRef = React.createRef(null);
  }
  UNSAFE_componentWillMount() {
    const { option, value } = this.props;
    const optionValue = value && _.find(option, { id: value });
    const { value: status } = optionValue || {};
    this.setState({
      switchValue: status,
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.value &&
      this.props.value &&
      prevProps.value !== this.props.value
    ) {
      const { option, value } = this.props;
      const optionValue = value && _.find(option, { id: value });
      const { value: status } = optionValue || {};
      this.setState({
        switchValue: status,
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.overrideRef);
  }

  handleStatus = () => {
    this.handleCloseIndexConfirmation();
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
          value: itemId,
          filterId: filterId,
          label: labelText,
        });
      }
    );
  };

  handleIndexConfirm = () => {
    const { overrideOutsideClick, setOverRidePopup } = this.props;
    setOverRidePopup(true);
    overrideOutsideClick(true);
    this.setState({
      indexConfirmation: true,
    });
    this.delayOverrideFlag();
  };

  handleCloseIndexConfirmation = () => {
    const { overrideOutsideClick, setOverRidePopup, labelText } = this.props;
    if (labelText === 'Index') {
      setOverRidePopup(true);
    }
    overrideOutsideClick(false);
    this.setState({
      indexConfirmation: false,
    });
    this.delayOverrideFlag();
  };

  delayOverrideFlag = () => {
    const { labelText, setOverRidePopup } = this.props;
    this.overrideRef = setTimeout(() => {
      if (labelText === 'Index') {
        setOverRidePopup(false);
      }
    }, 2000);
  };
  render() {
    const { labelText, helpText, link, changeDataTypeFromSettings } =
      this.props;
    const { indexConfirmation, switchValue } = this.state;

    return (
      <>
        <div className={styles.generalField}>
          <label htmlFor='switch'>
            {labelText}
            <p className={styles.helpText}>
              {helpText}{' '}
              {link ? (
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={link}
                  tabIndex='-1'
                >
                  Learn more
                </a>
              ) : null}
            </p>
          </label>

          <ToggleControl
            checked={this.state.switchValue}
            handleStatus={
              labelText === 'Index'
                ? this.handleIndexConfirm
                : this.handleStatus
            }
            disabled={changeDataTypeFromSettings}
          />

          {indexConfirmation ? (
            <ConfirmationModal
              title={'Confirm Changes'}
              bodyText={
                switchValue
                  ? 'If you disable the existing index, other mapped values will be lost. Do you want to proceed with changes?'
                  : 'If you enable the field as index, existing relation with mapped values will be lost. Do you want to proceed with changes?'
              }
              proceedActionText='Confirm'
              cancelActionText='Cancel'
              processIcon={CheckIcon}
              cancelIcon={CloseIcon}
              onProceedActionBtnClick={() => this.handleStatus()}
              onCancelActionBtnClick={() => this.handleCloseIndexConfirmation()}
              onCloseBtnClick={() => this.handleCloseIndexConfirmation()}
            />
          ) : (
            ''
          )}
        </div>
      </>
    );
  }
}

export default InputSwitch;
