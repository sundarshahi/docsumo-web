import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import * as api from 'client/api';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';

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
    //console.log('lsdasd',option.filter(item => {if(item.uid === uiValue) return item.label;})
    // let placeholder='';
    // switch(label){
    // case 'Round':
    //     placeholder='0';
    //     break;
    // case 'Confidence Greater Than':
    //     placeholder='%';
    //     break;
    // case 'Confidence Score':
    //     placeholder='%';
    //     break;
    // case 'Notification':
    //     placeholder='No. of hours';
    //     break;
    // default:
    //     placeholder=' ';
    //     break;
    // }
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
          <div className={styles.inputWrap}>
            {!uiValue ? (
              <Button
                text='Click to select a version'
                appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
                className={cx(styles.btn)}
                iconClassName={styles.icon}
                onClick={() => this.openOption()}
                disabled={!option.length}
              />
            ) : (
              <Button
                text={
                  (here && here[0] && here[0].label) ||
                  'Click to select a version'
                }
                appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
                className={cx(styles.btn, styles.versionSelect)}
                iconClassName={styles.icon}
                onClick={() => this.openOption()}
              />
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
