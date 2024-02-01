import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import { ReactComponent as ApiIcon } from 'new/assets/images/icons/api-boxed.svg';
import { ReactComponent as AutomationIcon } from 'new/assets/images/icons/automation-boxed.svg';
import { ReactComponent as TrainModelIcon } from 'new/assets/images/icons/train-model-boxed.svg';
import { ReactComponent as UserIcon } from 'new/assets/images/icons/user-mgmt-boxed.svg';
import { ACCOUNT_TYPES } from 'new/constants';
import {
  CLARITY_CUSTOM_KEYS,
  clarityAddCustomTags,
} from 'new/thirdParty/clarity';
import Button from 'new/ui-elements/Button/Button';
import Modal from 'new/ui-elements/Modal/Modal';

import ModalHeader from '../ModalHeader';

import styles from './UpgradedToProPlanModal.scss';

class UpgradedToProPlanModal extends Component {
  handleModalClose = () => {
    const { appActions } = this.props;

    appActions.setLocalConfigFlags({
      showProAccountPopup: false,
    });
    appActions.setConfigFlags({
      showProAccountPopup: false,
    });

    // Add clarity events
    clarityAddCustomTags(CLARITY_CUSTOM_KEYS.planType, ACCOUNT_TYPES.PRO);
  };

  render() {
    const { config } = this.props;

    if (
      !config ||
      !config.flags ||
      (config.flags && !config.flags.showProAccountPopup) ||
      (config.flags && config.flags.changePassword)
    ) {
      return null;
    }

    const heading = (
      <>
        <h1 className={styles.heading}>Your plan has been upgraded to Pro!</h1>
        <p className={styles.subHeading}>
          It's time to take advantage of new features.
        </p>
      </>
    );

    return (
      <Modal
        show={true}
        onCloseHandler={this.handleModalClose}
        animation='fade'
        size='sm'
      >
        <ModalHeader
          title={heading}
          className={styles.header}
          handleCloseBtnClick={this.handleModalClose}
          oldModal={true}
        />
        <div className={styles.content}>
          <span className={styles.text}>WHAT'S NEW?</span>
          <div className={styles.infoRow}>
            <div className={styles.infoCol}>
              <ApiIcon />
              <p>All pre-trained APIs</p>
            </div>
            <div className={styles.infoCol}>
              <AutomationIcon />
              <p>Automated learning</p>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoCol}>
              <TrainModelIcon />
              <p>Train your own model </p>
            </div>
            <div className={styles.infoCol}>
              <UserIcon />
              <p>User management and user logs</p>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <Button
            onClick={this.handleModalClose}
            className={styles.button}
            variant='contained'
          >
            Get Started
          </Button>
        </div>
      </Modal>
    );
  }
}

function mapStateToProp(state) {
  const { config } = state.app;

  return {
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(
  mapStateToProp,
  mapDispatchToProps
)(UpgradedToProPlanModal);
