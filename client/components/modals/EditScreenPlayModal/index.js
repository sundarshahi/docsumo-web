// import React, { Component } from 'react';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from '@redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { ReactComponent as ClearIcon } from 'images/icons/clear.svg';
import AriaModal from 'react-aria-modal';

import styles from './index.scss';

const EditScreenPlayModal = (props) => {
  const { showEditScreenPlayModal, appActions, history = {} } = props;

  useEffect(() => {
    window.onpopstate = () => {
      appActions.hideEditScreenPlay();
    };
  });

  if (!showEditScreenPlayModal) {
    return null;
  }
  const slug =
    history.location && history.location.state
      ? history.location.state.slug
      : '';
  const handleExit = () => {
    appActions.hideEditScreenPlay();
  };

  const rootProps = {
    titleText: 'Intro',
    focusDialog: true,
    underlayClickExits: true,
    verticallyCenter: true,
    onExit: handleExit,
  };

  return (
    <AriaModal {...rootProps}>
      <div className={styles.screen}>
        <div className={styles.header}>
          <div className={styles.ytVideo}>
            <iframe
              title={'Edit Field Screen'}
              allowFullScreen='allowFullScreen'
              src={
                slug === 'editField'
                  ? 'https://www.youtube.com/embed/d59-hXWg5LQ'
                  : 'https://www.youtube.com/embed/NDWrAXHNonU'
              }
              width='1250'
              height='680'
              allowTransparency='true'
              frameBorder='0'
            />
          </div>
        </div>
        <button
          title='Close'
          className={cx('unstyled-btn', styles.closeBtn)}
          onClick={handleExit}
        >
          <ClearIcon />
        </button>
      </div>
    </AriaModal>
  );
};

function mapStateToProp({ app }) {
  const showEditScreenPlayModal = app.showEditScreenPlayModal;

  return {
    showEditScreenPlayModal,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(EditScreenPlayModal)
);
