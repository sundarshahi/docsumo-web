import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

//import ConfirmationModal from 'new/components/shared/ConfirmationModal';
import { ReactComponent as CheckIcon } from 'new/assets/images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
import ConfirmationModal from 'new/components/shared/FiledConfirmationModal';

class DocShowAlertModal extends Component {
  handleCancelModal = () => {
    const { showAlertModalSlug, documentActions } = this.props;
    if (!showAlertModalSlug) return;

    documentActions.docHideAlertModal();
  };

  handleCloseBtnClick = () => {
    this.handleCancelModal();
  };

  handleProceedBtnClick = () => {
    const {
      app,
      documents: { docId },
    } = this.props;
    let documentName = app.config.documentTypes.find(
      (item) => item.id === docId
    );
    this.handleCloseBtnClick();
    this.props.documentActions.rtStartEditField({
      docType: documentName.value,
      slug: 'editField',
      docId,
    });

    const { document, documentActions, flag } = this.props;
    if (!document) return;

    documentActions.deleteDoc({
      docId: document.docId || document.id,
      flag,
    });
  };

  render() {
    const { showAlertModalSlug, modalPayload = {} } = this.props;
    if (!showAlertModalSlug) return null;
    const { modalTitle, bodyText, actionText, cancelText } = modalPayload;
    return (
      <ConfirmationModal
        title={modalTitle}
        bodyText={bodyText}
        proceedActionText={actionText}
        processIcon={CheckIcon}
        cancelIcon={CloseIcon}
        cancelActionText={cancelText}
        onProceedActionBtnClick={() => this.handleProceedBtnClick()}
        onCancelActionBtnClick={() => this.handleCloseBtnClick()}
        onCloseBtnClick={() => this.handleCloseBtnClick()}
      />
      // <ConfirmationModal
      //     title={modalTitle}
      //     bodyText={bodyText}
      //     proceedActionText={actionText}
      //     cancelActionText={cancelText}
      //     onProceedActionBtnClick={()=>this.handleProceedBtnClick()}
      //     onCancelActionBtnClick={this.handleCancelModal}
      //     onCloseBtnClick={this.handleCloseBtnClick}
      // />
    );
  }
}

function mapStateToProp({ documents, app }) {
  const { modalPayload, showAlertModalSlug } = documents;

  return {
    app,
    documents,
    modalPayload,
    showAlertModalSlug,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(DocShowAlertModal);
