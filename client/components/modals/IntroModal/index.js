// import React, { Component } from 'react';
import React from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from '@redux/app/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import AriaModal from 'react-aria-modal';

import IntroModalContent from './IntroModalContent';

const IntroModal = (props) => {
  const { showIntroModal, introPopupContent, introPopupSeen, appActions } =
    props;

  if (!showIntroModal || !introPopupContent) {
    return null;
  }

  const handleExit = () => {
    appActions.hideIntroModal();

    if (introPopupSeen === false) {
      appActions.setLocalConfigFlags({
        introPopupSeen: true,
      });
      appActions.setConfigFlags({
        introPopupSeen: true,
      });
    }
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
      <IntroModalContent
        content={introPopupContent}
        onCloseBtnClick={handleExit}
      />
    </AriaModal>
  );
};

// class IntroModalX extends Component {
//     handleExit = () => {
//         console.log('handleExit');
//     };

//     render() {
//         const {
//             showIntroPopup,
//             introPopupContent,
//         } = this.props;

//         if (!showIntroPopup || !introPopupContent) {
//             return null;
//         }

//         const rootProps = {
//             titleText: 'Intro',
//             focusDialog: true,
//             underlayClickExits: true,
//             verticallyCenter: true,
//             onExit: this.handleExit,
//         };

//         return (
//             <AriaModal {...rootProps}>
//                 <IntroModalContent
//                     content={introPopupContent}
//                     onCloseBtnClick={this.handleExit}
//                 />
//             </AriaModal>
//         );
//     }
// }

function mapStateToProp({ app }) {
  const showIntroModal = app.showIntroModal;
  const introPopupContent = _.get(app, 'config.introPopupContent');
  const introPopupSeen = _.get(app.config, 'flags.introPopupSeen');

  return {
    showIntroModal,
    introPopupContent,
    introPopupSeen,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(IntroModal);
