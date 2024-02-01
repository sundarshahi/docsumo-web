import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from '@redux/app/actions';
import { bindActionCreators } from 'redux';

import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'client/components/widgets/buttons';
import { ACCOUNT_TYPES } from 'client/constants';
import { ReactComponent as ApiIcon } from 'client/images/icons/api-boxed.svg';
import { ReactComponent as AutomationIcon } from 'client/images/icons/automation-boxed.svg';
import { ReactComponent as TrainModelIcon } from 'client/images/icons/train-model-boxed.svg';
import { ReactComponent as UserIcon } from 'client/images/icons/user-mgmt-boxed.svg';
import {
  CLARITY_CUSTOM_KEYS,
  clarityAddCustomTags,
} from 'client/thirdParty/clarity';

import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'components/shared/Modal';

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
        className={styles.modal}
        onExit={this.handleModalClose}
        rootProps={{
          titleText: 'Setting',
        }}
      >
        <ModalHeader
          title={heading}
          className={styles.header}
          titleClassName={styles.title}
          closeBtnClassName={styles.closeBtn}
          onCloseBtnClick={this.handleModalClose}
        />
        <ModalContent className={styles.content}>
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
        </ModalContent>
        <ModalFooter className={styles.footer}>
          <Button
            onClick={this.handleModalClose}
            className={styles.button}
            appearance={BUTTON_APPEARANCES.PRIMARY}
          >
            Get Started
          </Button>
        </ModalFooter>
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
