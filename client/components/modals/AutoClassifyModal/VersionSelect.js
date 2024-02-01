import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import * as api from 'client/api';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import OutsideClickHandler from 'react-outside-click-handler';

import VersionSelectModal from 'components/shared/VersionSelectModal';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';

import styles from './versionSelect.scss';

// const VersionData = [
//     {
//         title : 'Version 1',
//         uid : 'version_one'
//     },
//     {
//         title : 'Version 2',
//         uid : 'version_two'
//     },
//     {
//         title : 'Version 3',
//         uid : 'version_three'
//     },
//     {
//         title : 'Version 4',
//         uid : 'version_four'
//     },
//     {
//         title : 'Version 5',
//         uid : 'version_five'
//     }
// ];
class VersionSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
      option: [],
      noVersionMessage: '',
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
    const response = await api.getAutoClassifyVersion();
    this.setState({
      option: response.responsePayload.data,
    });
  };
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { value, option } = this.props;
      {
        value
          ? this.setState({
              uiValue: value,
            })
          : null;
      }
      this.setState({
        option: option,
      });
    }
  }

  onOutsideClick = () => {
    this.setState({
      noVersionMessage: '',
    });
  };

  openOption = async () => {
    const { uiValue } = this.state;
    if (!uiValue) {
      this.setState({
        noVersionMessage:
          'There is no previous version. Train to create first version',
      });
      return;
    }
    this.setState({
      checkConfirm: true,
    });
    await this.fetchTrainVersion();
  };
  checkBtn = (checkConfirm = false) => {
    this.setState({ checkConfirm });
  };
  versionSelect = (value) => {
    const { handleChangedValueSubmit } = this.props;
    handleChangedValueSubmit({
      value: value,
    });
  };

  render() {
    const { label, helpText, fieldClassName, link, errorMessage } = this.props;
    const { checkConfirm, uiValue, noVersionMessage, option } = this.state;
    let here =
      option &&
      option.filter((item) => {
        if (item.uid === uiValue) return item.label;
      });
    return (
      <Fragment>
        <div className={cx(styles.generalSubField, fieldClassName)}>
          <label htmlFor={label}>
            {label}
            <p className={styles.helpText}>
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn More
                </a>
              ) : null}
            </p>
          </label>
          <OutsideClickHandler onOutsideClick={this.onOutsideClick}>
            <div className={styles.inputWrap}>
              {!uiValue ? (
                <Button
                  text='Click to select a version'
                  appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
                  className={cx(styles.btn)}
                  iconClassName={styles.icon}
                  onClick={() => this.openOption()}
                  disabled={false}
                />
              ) : (
                <Button
                  text={
                    (here && here[0] && here[0].label) || 'Loading version..'
                  }
                  appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
                  className={cx(styles.btn, styles.versionSelect)}
                  iconClassName={styles.icon}
                  onClick={() => this.openOption()}
                />
              )}
              {errorMessage ? (
                <p className={styles.errorMessage}>{errorMessage}</p>
              ) : null}
              {noVersionMessage ? (
                <p className={styles.errorMessage}>{noVersionMessage}</p>
              ) : null}
            </div>
          </OutsideClickHandler>
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
