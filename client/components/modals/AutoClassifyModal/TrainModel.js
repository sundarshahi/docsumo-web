import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import * as api from 'client/api';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import { ReactComponent as InfoIcon } from 'images/icons/info.svg';
import { ReactComponent as RefreshIcon } from 'images/icons/refresh.svg';
import { ReactComponent as TrainIcon } from 'images/icons/train.svg';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import Tooltip from 'rc-tooltip';

import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';
import { ThreeDotsLoaderIcon } from 'components/widgets/progress';

import styles from './trainModel.scss';

class TrainModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: 'Train',
      trainable: false,
      message: '',
      disableTrain: false,
    };
  }
  async UNSAFE_componentWillMount() {
    const { value, trainable, message } = this.props;
    const { option } = this.props;
    const optionValue = value && _.find(option, { id: value });
    const { value: status } = optionValue || {};

    this.handleGetTrainableStatus();

    {
      value || value === 0
        ? this.setState({
            //dropDownValue:label || option && option[0].label,
            uiValue: status,
          })
        : null;
    }
    this.setState({
      trainable,
      message,
    });
  }

  handleGetTrainableStatus = async () => {
    const { typeFiltered = [], appActions, user, config } = this.props;
    appActions.showLoaderOverlay();
    let payload = {
      doc_types: typeFiltered,
    };
    try {
      const response = await api.getTrainableStatus(payload);
      this.setState({
        uiValue: response.responsePayload.status,
        message: response.responsePayload.message,
      });

      const { canSwitchToOldMode = true } = config;

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.setup_auto_classify, {
        'work email': user.email,
        step: 'Document Type Selection',
        docType: typeFiltered.join(', '),
        version: 'old',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      const errorResponse = e.responsePayload.error;
      this.setState({
        disableTrain: true,
        message: errorResponse,
      });
    }
    appActions.hideLoaderOverlay();
  };

  async componentDidUpdate(prevProps) {
    const { typeFiltered } = this.props;
    let payload = {
      doc_types: typeFiltered,
    };
    if (prevProps.autoClassifyStatus !== this.props.autoClassifyStatus) {
      if (this.props.autoClassifyStatus === 'completed') {
        try {
          const response = await api.getTrainableStatus(payload);
          this.setState({
            uiValue: response.responsePayload.status,
            message: response.responsePayload.message,
          });
        } catch (e) {
          const errorResponse = e.responsePayload.error;
          this.setState({
            disableTrain: true,
            message: errorResponse,
          });
        }
      }
    }
  }

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
    });
  };
  proceedTrain = () => {
    const { startTrain } = this.props;
    this.props.documentActions.changeAutoClassifyStatus({
      autoClassifyStatus: '',
    });
    startTrain();
    this.setState({
      uiValue: 'training',
    });
  };
  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId, type } = this.props;
    handleChangedValueSubmit({
      id: id,
      value:
        type === 'number' ? parseInt(this.state.uiValue) : this.state.uiValue,
      filterId: filterId,
    });
  };
  render() {
    const { label, helpText, fieldClassName, link, isLoadingTrain } =
      this.props;
    const { uiValue, trainable, message, disableTrain } = this.state;
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
            <Button
              text={
                uiValue === 'ready_to_train'
                  ? 'Train'
                  : uiValue === 'training'
                  ? 'Training'
                  : 'Train'
              }
              iconLeft={
                uiValue === 'ready_to_train'
                  ? TrainIcon
                  : uiValue === 'training'
                  ? ThreeDotsLoaderIcon
                  : RefreshIcon
              }
              appearance={BUTTON_APPEARANCES.PRIMARY}
              className={cx(styles.btn)}
              iconClassName={styles.icon}
              onClick={() => this.proceedTrain()}
              disabled={!trainable || uiValue === 'training' || disableTrain}
              isLoading={isLoadingTrain}
            />
            <div className={styles.infoIconBox}>
              <Tooltip
                overlayClassName={styles.tooltipInfo}
                placement='top'
                overlay={
                  <p className={styles.tooltipInfoContent}>
                    {uiValue === 'training'
                      ? 'Custom ML training started. Estimated time to complete: 5 minutes.'
                      : message}
                  </p>
                }
              >
                <InfoIcon className={styles.infoIcon} />
              </Tooltip>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default TrainModel;
