import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from '@redux/documents/actions';
import { bindActionCreators } from 'redux';

import ConfirmationModal from 'components/shared/ConfirmationModal';

class DocDeleteConfirmationModal extends Component {
  cancelDeletion = () => {
    const { document, documentActions } = this.props;
    if (!document) return;

    documentActions.deleteDocHideConfirmation({
      docId: document.docId || document.id,
    });
  };

  handleCancelBtnClick = () => {
    this.cancelDeletion();
  };

  handleCloseBtnClick = () => {
    this.cancelDeletion();
  };

  handleProceedBtnClick = () => {
    const { document, documentActions, flag } = this.props;
    if (!document) return;
    const { docType: doc_type } = document;
    documentActions.deleteDoc({
      docId: document.docId || document.id,
      flag,
      doc_type,
    });
  };

  render() {
    const { document } = this.props;
    if (!document) return null;

    return (
      <ConfirmationModal
        title={`Delete ${document.title}?`}
        bodyText='Are you sure you want to delete this document?'
        proceedActionText='Delete'
        cancelActionText='Cancel'
        onProceedActionBtnClick={this.handleProceedBtnClick}
        onCancelActionBtnClick={this.handleCancelBtnClick}
        onCloseBtnClick={this.handleCloseBtnClick}
      />
    );
  }
}

function mapStateToProp({ documents }) {
  const { deleteConfirmationDocId, reviewTool, flag } = documents;

  let idSetOne = documents.documentsById || {};
  let idSetTwo = reviewTool.documentsById || {};

  const documentsById = { ...idSetOne, ...idSetTwo };

  const document =
    deleteConfirmationDocId && documentsById[deleteConfirmationDocId];

  return {
    document,
    flag,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(
  mapStateToProp,
  mapDispatchToProps
)(DocDeleteConfirmationModal);
