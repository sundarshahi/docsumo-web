import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import cx from 'classnames';
import find from 'lodash/find';
import routes from 'new/constants/routes';
import { DropdownExtraction } from 'new/ui-elements/Dropdown/DropDownExtraction';

import styles from './newTrainModelExtraction.scss';

class NewTrainModelExtraction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchValue: false,
      dropdownOpen: false,
      currentModel: 'none',
    };
  }
  UNSAFE_componentWillMount() {
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
            status: 201, // HOTFIX: Because radio button is removed, it is assumed that each change is true
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

  handleTrainModelClick = () => {
    const { history, modelActions } = this.props;

    history.push(routes.MODEL);

    modelActions.showTrainModelModal();
  };

  handleImportClick = () => {
    const { history, csvActions } = this.props;

    history.push(routes.DATABASE_TABLES);

    csvActions.showUploadCsvModal();
  };

  render() {
    const { labelText, helpText, link, dropDownOption, id } = this.props;

    const { switchValue, currentModel } = this.state;
    const { label = '' } =
      dropDownOption?.find((item) => item.id === currentModel) || {};

    return (
      <>
        <div className={cx(styles.trainModel, 'mb-5')}>
          <label htmlFor='switch' className={styles.trainModel__label}>
            {labelText}
            <p className={cx(styles['trainModel__label--helper'], 'mt-1')}>
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn more
                </a>
              ) : null}
            </p>
          </label>

          <div className={styles.inputWrap}>
            <div
              title={currentModel === 'none' ? '' : label}
              className={cx({
                [styles.inputDisabled]: !switchValue,
              })}
            >
              <DropdownExtraction
                value={currentModel}
                disabled={!switchValue}
                data={dropDownOption || []}
                optionLabelKey='label'
                optionValueKey='id'
                onChange={this.changeValue}
                settingId={id}
                onTrainModelClick={this.handleTrainModelClick}
                onImportClick={this.handleImportClick}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(NewTrainModelExtraction);
