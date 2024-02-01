import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import * as api from 'new/api';
import { ReactComponent as CheckIcon } from 'new/assets/images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
import VersionSelectModal from 'new/components/shared/VersionSelectModal';
import { Button } from 'new/components/widgets/buttons';

import styles from './versionSelect.scss';
class VersionSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
      option: [],
      checkConfirm: false,
    };
  }
  UNSAFE_componentWillMount() {
    const { value, option } = this.props;
    {
      value || value === 0
        ? this.setState({
            //dropDownValue:label || option && option[0].label,
            uiValue: value,
          })
        : null;
    }
    this.setState({
      option,
    });

    this.fetchTrainVersion();
  }

  fetchTrainVersion = async () => {
    const { docType } = this.props;

    const response = await api.getTrainVersion({
      docType,
    });
    this.setState({
      option: response.responsePayload.data,
    });
  };
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { value } = this.props;
      {
        value
          ? this.setState({
              uiValue: value,
            })
          : null;
      }
    }
  }

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
    });
  };
  openOption = async () => {
    await this.fetchTrainVersion();
    this.setState({
      checkConfirm: true,
    });
  };
  checkBtn = (checkConfirm = false) => {
    this.setState({ checkConfirm });
  };
  versionSelect = (value) => {
    const { handleChangedValueSubmit, id, filterId, label } = this.props;
    handleChangedValueSubmit({
      id: id,
      value: value,
      filterId: filterId,
      label,
    });
  };
  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId, type, label } = this.props;
    handleChangedValueSubmit({
      id: id,
      value:
        type === 'number' ? parseInt(this.state.uiValue) : this.state.uiValue,
      filterId: filterId,
      label,
    });
  };
  render() {
    const { label, helpText, fieldClassName, link } = this.props;
    const { checkConfirm, option, uiValue } = this.state;
    let here = option.filter((item) => {
      if (item.uid === uiValue) return item.label;
    });
    return (
      <Fragment>
        <div className={cx(styles.versionSelect, fieldClassName)}>
          <label className={cx(styles.versionSelect__label)} htmlFor={label}>
            {label}
            <p className={cx(styles['versionSelect__label--helper'])}>
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn More
                </a>
              ) : null}
            </p>
          </label>
          <div className={styles.inputWrap}>
            {!uiValue ? (
              <Button
                disabled={!option.length}
                variant='contained'
                onClick={() => this.openOption()}
              >
                Click to select a version
              </Button>
            ) : (
              <Button
                className={cx(styles.btn, styles.versionSelect)}
                disabled={!option.length}
                variant='contained'
                onClick={() => this.openOption()}
              >
                {(here && here[0] && here[0].label) ||
                  'Click to select a version'}
              </Button>
            )}
          </div>
          {checkConfirm ? (
            <VersionSelectModal
              VersionData={option}
              value={uiValue}
              proceedActionText='Select & Close'
              processIcon={CheckIcon}
              cancelIcon={CloseIcon}
              cancelActionText='Cancel'
              onProceedActionBtnClick={this.versionSelect}
              onCancelActionBtnClick={() => this.checkBtn(false)}
              onCloseBtnClick={() => this.checkBtn(false)}
            />
          ) : (
            ''
          )}
        </div>
      </Fragment>
    );
  }
}

export default VersionSelect;
