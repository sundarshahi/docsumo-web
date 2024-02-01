import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from '@redux/documents/actions';
import { showToast } from 'client/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as fileConstants from 'client/constants/file';
import copy from 'clipboard-copy';
import * as uploadHelper from 'helpers/upload';
import { ReactComponent as CopyIcon } from 'images/icons/copy.svg';
import _ from 'lodash';
import Dropzone from 'react-dropzone';
import Modal from 'react-responsive-modal';

import {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'components/shared/Modal';
import { Cell, Row } from 'components/shared/tabularList';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';
import Divider from 'components/widgets/Divider';

import styles from './index.scss';

class DocUploadModal extends Component {
  constructor(props) {
    super(props);
    (this.state = {
      title: 'Click To Copy',
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
    this.dropZoneTypeRef.current.open();
  };

  handleCopyText = (mail) => {
    copy(mail);
    this.setState({
      title: 'Copied!',
    });
    showToast({
      title: 'Email copied to clipboard',
      timeout: 3,
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
  }

  render() {
    const {
      uploadConfirmationDocType,
      fieldType,
      documentType: { uploadEmail },
    } = this.props;
    const email = uploadEmail || '-';
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
        {/* <Modal
                    classNames={{
                        modal:styles.modal
                    }}
                    rootProps={{
                        titleText: fieldType ?'Edit Fields':'Upload Documents',
                    }}
                    open={fieldType !== 'upload' && !!uploadConfirmationDocType}
                    center={true}
                    closeOnEsc={false}
                    onClose={this.handleCloseBtnClick}
                    blockScroll={true}
                >
                    { fieldType !== 'mail' && !!uploadConfirmationDocType ? 
                        <>
                        <ModalHeader
                            className={styles.modalHeader}
                            title={fieldType ?'Edit Fields':'Upload Documents'}
                        />

                        <ModalContent className={styles.modalContent}>
                            <p>
                                {fieldType? 'Please Upload Document before edit fields ':
                                    'Upload few sample documents before creating a template'
                                }
                            </p>
                        </ModalContent>

                        <ModalFooter className={styles.modalFooter}>
                            <Button
                                text="Upload Documents"
                                appearance={BUTTON_APPEARANCES.PRIMARY}
                                onClick={()=>this.handleUploadFileBtnClick(uploadConfirmationDocType)}
                            />
                        </ModalFooter>
                    
                        <Divider title={'OR'} className={styles.divider}/>
                        </>
                        : 
                        ''
                    }
                    <ModalHeader
                        className={styles.modalHeader}
                        title={'Email us on'}
                    />
                    <Cell className={styles.modalSubHeader}>
                        <div className={styles.modalSubHeaderContent}>
                            <b className={styles.modalSubHeaderTitle}>
                                Please consider : {' '}
                            </b>
                                File size should be maximum 25mb, and it shouldn't be password protected.
                        </div>
                    </Cell>
                    <Row className={styles.row}>
                        <Cell className={styles.cellButton}>
                            <Button
                                title={'Click to copy'}
                                iconLeft={CopyIcon}
                                onClick={()=>this.handleCopyText(email)}
                                iconLeftClassName={styles.cellButtonIcon}
                            >
                                {this.state.title}
                            </Button>
                        </Cell>
                            
                        <Cell className={styles.cellField}>
                            <div className={styles.apiWrapper}>
                                <Cell className={styles.input}>{email}</Cell>
                            </div>
                        </Cell>
                       
                    </Row>
                </Modal>  */}
        {fieldType !== 'upload' && !!uploadConfirmationDocType ? (
          // <Modal
          //     className={styles.root}
          //     rootProps={{
          //         titleText: 'Upload',
          //     }}
          // >
          <Modal
            classNames={{
              //modal:cx(styles.modal, { [styles.modalHalf] : singleDoc }),
              modal: cx(styles.root),
              closeButton: styles.closeButton,
              closeIcon: styles.closeIcon,
            }}
            open={true}
            center={true}
            closeOnEsc={false}
            onOverlayClick={this.handleCloseBtnClick}
            closeOnOverlayClick={false}
            onClose={this.handleCloseBtnClick}
          >
            <ModalHeader
              title='Upload'
              titleClassName={cx('ellipsis', styles.title)}
              className={styles.header}
              showCloseBtn={false}
              //closeBtnClassName={styles.closeBtnClassName}
              //onCloseBtnClick={this.handleCloseBtnClick}
            />
            {fieldType !== 'mail' && !!uploadConfirmationDocType ? (
              <>
                <ModalContent className={styles.modalContent}>
                  {/* <p>
                                {fieldType ?'Edit Fields':'Upload Documents'}
                            </p> */}
                  <p>
                    {fieldType
                      ? 'Please Upload Document before edit fields '
                      : 'Upload few sample documents before creating a template'}
                  </p>
                </ModalContent>

                <ModalFooter className={styles.modalFooter}>
                  <Button
                    text='Upload Documents'
                    appearance={BUTTON_APPEARANCES.PRIMARY}
                    onClick={() =>
                      this.handleUploadFileBtnClick(uploadConfirmationDocType)
                    }
                  />
                </ModalFooter>

                <Divider title={'OR'} className={styles.divider} />
              </>
            ) : (
              ''
            )}
            <div className={styles.modalSubHeader}>
              <div className={styles.modalLargeHeader}>
                <p className={styles.largeHeader}>Email us on</p>
              </div>
              <div className={styles.modalSubHeaderContent}>
                <b className={styles.modalSubHeaderTitle}>Please consider : </b>
                File size should be maximum 25mb, and it shouldn't be password
                protected.
              </div>
            </div>
            <Row className={styles.row}>
              <Cell className={styles.cellButton}>
                <Button
                  title={'Click to copy'}
                  iconLeft={CopyIcon}
                  onClick={() => this.handleCopyText(email)}
                  iconLeftClassName={styles.cellButtonIcon}
                >
                  {this.state.title}
                </Button>
              </Cell>

              <Cell className={styles.cellField}>
                <div className={styles.apiWrapper}>
                  <Cell className={styles.input}>{email}</Cell>
                </div>
              </Cell>
            </Row>
          </Modal>
        ) : (
          ''
        )}
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
