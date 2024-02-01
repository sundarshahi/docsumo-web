import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import copy from 'clipboard-copy';
import { Cancel, Copy, Upload } from 'iconoir-react';
import _ from 'lodash';
import Divider from 'new/components/widgets/Divider';
import * as fileConstants from 'new/constants/file';
import * as uploadHelper from 'new/helpers/upload';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal/Modal';
import Dropzone from 'react-dropzone';

import styles from './index.scss';

const EDIT_FIELDS_MODAL_LABEL = 'Please Upload Document before edit fields';
const DOC_UPLOAD_MODAL_LABEL =
  'Upload few sample documents before creating a template';

class DocUploadModal extends Component {
  constructor(props) {
    super(props);
    (this.state = {
      title: 'Click To Copy',
      mountModal: false,
    }),
      (this.dropZoneTypeRef = React.createRef());
  }

  handleCloseBtnClick = () => {
    const { documentActions, uploadConfirmationDocType, fieldType } =
      this.props;
    this.setState({
      title: 'Click To Copy',
    });
    if (!uploadConfirmationDocType) return;
    documentActions.uploadDocTypeHideConfirmation({
      docType: uploadConfirmationDocType,
      fieldType,
    });
  };

  handleDropAccepted = (files) => {
    const { currentDocumentType } = this.state;
    (this.documentType || currentDocumentType) &&
      uploadHelper.handleFileDrop({
        files: files,
        dropAccepted: true,
        documentType: this.documentType || currentDocumentType,
      });
    this.handleCloseBtnClick();
  };

  handleDropRejected = (files) => {
    this.documentType &&
      uploadHelper.handleFileDrop({
        files: files,
        dropAccepted: false,
        documentType: this.documentType,
      });
  };

  handleFileDialogCancel = () => {
    this.documentType = null;
    const { fieldType } = this.props;
    if (fieldType === 'upload') {
      this.handleCloseBtnClick();
    }
  };

  handleUploadFileBtnClick = (docType) => {
    this.setState({
      currentDocumentType: docType,
    });
    this.documentType = docType;
    this.dropZoneTypeRef?.current?.open();
  };

  handleCopyText = (mail) => {
    copy(mail);
    this.setState({
      title: 'Copied!',
    });
    showToast({
      title: 'Email copied to clipboard',
      duration: 3000,
      success: true,
    });
  };

  componentDidUpdate(prevProps) {
    const { uploadConfirmationDocType, fieldType } = this.props;

    if (
      uploadConfirmationDocType !== prevProps.uploadConfirmationDocType &&
      uploadConfirmationDocType
    ) {
      if (fieldType === 'upload') {
        this.handleUploadFileBtnClick(uploadConfirmationDocType);
      }
    }

    if (
      uploadConfirmationDocType !== prevProps.uploadConfirmationDocType ||
      fieldType !== prevProps.fieldType
    ) {
      this.setState({ mountModal: true });
    }
  }

  onModalCloseHandler = () => {
    this.setState({ mountModal: false });
    const { documentActions, uploadConfirmationDocType, fieldType } =
      this.props;
    documentActions.uploadDocTypeHideConfirmation({
      docType: uploadConfirmationDocType,
      fieldType,
    });
  };

  uploadDocContent = () => {
    const { fieldType, uploadConfirmationDocType } = this.props;
    return (
      <div className={styles.uploadContent}>
        <span>
          {fieldType ? EDIT_FIELDS_MODAL_LABEL : DOC_UPLOAD_MODAL_LABEL}
        </span>
        <div className={styles.uploadContent__btn}>
          <Button
            variant='contained'
            icon={Upload}
            size='small'
            title='Upload Documents'
            className={styles['uploadContent__btn--uploadBtn']}
            onClick={() =>
              this.handleUploadFileBtnClick(uploadConfirmationDocType)
            }
          >
            Upload Documents
          </Button>
        </div>
        <Divider title={'OR'} className={styles.uploadContent__divider} />
      </div>
    );
  };

  emailDocContent = () => {
    const {
      documentType: { uploadEmail = '' },
    } = this.props;
    const email = uploadEmail || '-';
    return (
      <div className={styles.emailDocContent}>
        <p className='mb-2'>Email us on</p>
        <p>
          <b className='font-medium'>Please consider:</b>&nbsp;&nbsp; File size
          should be maximum 25mb, and it shouldn't be password protected.
        </p>
        <div
          className={cx(
            styles.emailDocContent__btn,
            'd-flex',
            'align-items-center',
            'mt-4'
          )}
        >
          <Button
            variant='outlined'
            icon={Copy}
            size='small'
            title='Copy'
            className={styles['emailDocContent__btn--copyBtn']}
            onClick={() => this.handleCopyText(email)}
          >
            Copy
          </Button>
          <span className='ml-4'>{email}</span>
        </div>
      </div>
    );
  };

  modalContent = () => {
    const { fieldType, uploadConfirmationDocType } = this.props;
    return (
      <div>
        {fieldType !== 'mail' && !!uploadConfirmationDocType
          ? this.uploadDocContent()
          : null}
        {this.emailDocContent()}
      </div>
    );
  };

  modalHeader = () => {
    return (
      <div
        className={cx(
          styles.header,
          'd-flex',
          'align-items-center',
          'justify-content-between'
        )}
      >
        <span className={cx(styles.header__label, 'font-bold')}>Upload</span>
        <IconButton
          icon={<Cancel height={24} width={24} />}
          className='ml-4'
          variant='ghost'
          onClick={this.onModalCloseHandler}
        />
      </div>
    );
  };

  modalDOMContent = () => {
    const { uploadConfirmationDocType, fieldType } = this.props;
    const { mountModal } = this.state;
    return (
      <>
        {fieldType !== 'upload' && !!uploadConfirmationDocType ? (
          <Modal
            onCloseHandler={this.onModalCloseHandler}
            show={mountModal}
            modalTitle={'Upload'}
            isCloseIconBtn
            animation='fade'
            size='md'
            className={styles.modal}
          >
            {this.modalHeader()}
            {this.modalContent()}
          </Modal>
        ) : (
          ''
        )}
      </>
    );
  };

  render() {
    return (
      <Fragment>
        <Dropzone
          ref={this.dropZoneTypeRef}
          disableClick
          accept={fileConstants.SUPPORTED_MIME_TYPES}
          className={styles.dropzoneClassName}
          activeClassName={styles.dropzoneActiveClassName}
          rejectClassName={styles.dropzoneRejectClassName}
          onDropAccepted={this.handleDropAccepted}
          onDropRejected={this.handleDropRejected}
          onFileDialogCancel={this.handleFileDialogCancel}
        />
        {this.modalDOMContent()}
      </Fragment>
    );
  }
}

function mapStateToProp({ documents }) {
  const { uploadConfirmationDocType, fieldType, documentsById } = documents;

  const key =
    uploadConfirmationDocType &&
    _.findKey(documentsById, ['docType', uploadConfirmationDocType]);

  const documentType = key ? documentsById[key] : {};

  return {
    uploadConfirmationDocType,
    fieldType,
    documentType,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(DocUploadModal);
