import React, { Component, Fragment } from 'react';
import { showToast } from 'new/redux/helpers';

import cx from 'classnames';
import { Plus } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './trainModel.scss';

class TrainModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: 'Train',
      message: '',
      trainable: false,
      disableTrain: false,
    };
  }
  async UNSAFE_componentWillMount() {
    const { trainable, message } = this.props;
    this.handleGetTrainableStatus();
    this.setState({
      trainable,
      message,
    });
  }

  handleGetTrainableStatus = async () => {
    const { typeFiltered, appActions, user, config } = this.props;
    appActions.showLoaderOverlay();
    let payload = {
      doc_types: typeFiltered,
    };
    try {
      const response = await api.getTrainableStatus(payload);
      this.setState({
        uiValue: response?.responsePayload?.status,
        message: response?.responsePayload?.message,
      });

      const { canSwitchToOldMode = true } = config;
      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.setup_auto_classify, {
        'work email': user.email,
        step: 'Document Type Selection',
        docType: typeFiltered.join(', '),
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      const errorResponse = e?.responsePayload?.error;
      this.setState({
        disableTrain: true,
        message: errorResponse,
      });
      showToast({
        title: errorResponse,
        error: true,
      });
    }
    appActions.hideLoaderOverlay();
  };

  async componentDidUpdate(prevProps) {
    const { typeFiltered, autoClassifyStatus } = this.props;
    let payload = {
      doc_types: typeFiltered,
    };
    if (prevProps.autoClassifyStatus !== autoClassifyStatus) {
      if (autoClassifyStatus === 'completed') {
        try {
          const response = await api.getTrainableStatus(payload);
          this.setState({
            uiValue: response?.responsePayload?.status,
            message: response?.responsePayload?.message,
          });
        } catch (e) {
          const errorResponse = e?.responsePayload?.error;
          this.setState({
            disableTrain: true,
            message: errorResponse,
          });
          showToast({
            title: errorResponse,
            error: true,
          });
        }
      }
    }
  }

  proceedTrain = () => {
    const { startTrain } = this.props;
    this.props.documentActions.changeAutoClassifyStatus({
      autoClassifyStatus: '',
    });
    startTrain();
    this.setState({
      uiValue: 'training',
    });

    const { typeFiltered, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.train_auto_classify, {
      'work email': user.email,
      step: 'Document Type Selection',
      docType: typeFiltered.join(', '),
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  render() {
    const { isLoadingTrain } = this.props;
    const { uiValue, trainable, message, disableTrain } = this.state;
    const isTraining = uiValue === 'training';
    return (
      <Fragment>
        <div className={cx(styles.generalSubField)}>
          <div className={styles.generalSubField__header}>
            <span className={styles['generalSubField__header--title']}>
              Train auto classification engine
            </span>
          </div>
          <Tooltip
            label={
              isTraining
                ? 'Custom ML training started. Estimated time to complete: 5 minutes.'
                : message
            }
            placement='left'
          >
            <Button
              size='small'
              variant='outlined'
              disabled={!trainable || uiValue === 'training' || disableTrain}
              icon={isTraining ? <Plus /> : ''}
              isLoading={isLoadingTrain || isTraining}
              className={cx({ [styles.generalSubField__btn]: isTraining })}
              onClick={() => this.proceedTrain()}
            >
              {isTraining ? 'Training' : 'Train'}
            </Button>
          </Tooltip>
        </div>
      </Fragment>
    );
  }
}

export default TrainModel;
