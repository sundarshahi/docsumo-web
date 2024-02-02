/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as csvActions } from 'new/redux/csv/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import download from 'downloadjs';
import { Cancel, Download, InfoEmpty } from 'iconoir-react';
import _, { get } from 'lodash';
import * as api from 'new/api';
import { ReactComponent as ClearIcon } from 'new/assets/images/icons/clear.svg';
import { ReactComponent as InfoIcon } from 'new/assets/images/icons/info.svg';
import { SUPPORT_LINK } from 'new/constants/urllink';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal/Modal';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import Dropzone from 'react-dropzone';

import styles from './index.scss';

class UpdateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      isUploading: false,
      uiErrorText: '',
    };
    this.inputRef = React.createRef();
  }

  handleInputChange = (e) => {
    let selectedFile = Array.from(e.target.files);
    this.setState({
      files: selectedFile,
    });
  };
  handleCloseBtnClick = () => {
    const { onCloseBtnClick } = this.props;
    this.setState({
      files: [],
      uiErrorText: '',
    });
    onCloseBtnClick();
  };
  handleRemoveFile = () => {
    this.setState({
      files: [],
      uiErrorText: '',
    });
  };

  fetchDocuments = () => {
    const { currentCSVDocId } = this.props;
    this.props.csvActions.getUpdatedTableView({
      ddId: currentCSVDocId || this.props.match.params.docId,
    });
    this.setState({
      fetched: true,
    });
  };

  handleUploader = async () => {
    const { currentCSVDocId, appActions } = this.props;
    const { files } = this.state;
    if (!files.length) {
      this.setState({
        uiErrorText: 'Please add file',
      });
      return;
    }
    this.setState({
      isUploading: true,
    });
    try {
      await api.updateCsvDocument({
        files: files,
        ddId: currentCSVDocId || this.props.match.params.docId,
      });
      appActions.setToast({
        title: 'Updated the CSV',
        success: true,
        duration: 3000,
      });
      this.handleCloseBtnClick();
    } catch (e) {
      const error = get(e.responsePayload, 'error', 'Update CSV Failed');
      this.setState({
        uiErrorText: error,
      });
    } finally {
      this.setState({
        isUploading: false,
      });
    }

    this.fetchDocuments();
  };
  handleDropAccepted = (files) => {
    this.setState({
      files: files,
    });
  };
  handleCustomDownload = async () => {
    const { currentCSVDocId, appActions } = this.props;
    appActions.setToast({
      title: 'Downloading...',
      duration: 3000,
    });
    let result = {
      dd_ids: [currentCSVDocId || this.props.match.params.docId],
      type: 'template',
    };
    try {
      const { responsePayload } = await api.downloadCsv({
        ...result,
      });
      const downloadUrl = _.get(responsePayload, 'data');
      download(downloadUrl);
    } catch (e) {
      // Do nothing
    }
  };

  renderHeader = () => {
    return (
      <div className={cx(styles.header)}>
        <>
          <h2 className={cx(styles.title)}>Update Table</h2>
        </>

        <a
          className={styles.infoIconBox}
          target='_blank'
          rel='noopener noreferrer'
          href={SUPPORT_LINK.DB_TABLE_CSV}
        >
          <InfoIcon className={styles.infoIcon} />
          <div className={styles.tooltip}>
            Read about csv upload
            <div className={styles.arrow} />
          </div>
        </a>
        <button
          className={cx(
            'unstyled-btn',
            styles.closeBtn,
            styles.closeBtnClassName
          )}
          onClick={this.handleCloseBtnClick}
        >
          <ClearIcon />
        </button>
      </div>
    );
  };
  modalContent = () => {
    const { files, uiErrorText } = this.state;
    return (
      <div className={styles.content}>
        <div className={styles.content_stepOne}>
          <h1 className={styles.content_stepText}>
            Step 1: Add row in the same template to match the headers
          </h1>
          <p className={styles.content_helpText}>
            Click below to view the sample CSV file to follow the organised
            format for better data mapping.
          </p>
          <Button
            variant='outlined'
            size='small'
            icon={Download}
            onClick={this.handleCustomDownload}
          >
            Download Template
          </Button>
        </div>
        <div className={styles.content_stepTwo}>
          <h1 className={styles.content_stepText}>Step 2: Upload a CSV file</h1>
          <p className={styles.content_helpText}>
            Once you upload the CSV file, the new rows will be added
            automatically below the existing row.
          </p>
          <div className={styles.content_uploadBox}>
            {files.length ? (
              <>
                <div className={styles.fileContainer}>
                  <div className={styles.fileContainer_fileName}>
                    {files[0].name}
                  </div>
                  <div className={styles.fileContainer_progress}>
                    <div className={styles.fileContainer_progressBar}></div>
                    <div className={styles.fileContainer_progressDeleteIcon}>
                      <Cancel onClick={this.handleRemoveFile} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Dropzone
                  ref={this.dropzoneRef}
                  accept='.csv, application/vnd.ms-excel'
                  className={styles.content_dropzone}
                  multiple={false}
                  activeClassName={styles['dropzone--active']}
                  onDropAccepted={this.handleDropAccepted}
                >
                  <p className={styles.content_placeholderText}>
                    Drag & Drop files here
                  </p>
                  <p className={styles.content_placeholderOption}>OR</p>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={this.handleSelectFile}
                  >
                    Select File
                  </Button>
                </Dropzone>
              </>
            )}
          </div>
        </div>
        {uiErrorText ? (
          <p className={styles.content_errorTextText}>{uiErrorText}</p>
        ) : null}
      </div>
    );
  };
  modalFooter = () => {
    const { isUploading } = this.state;
    return (
      <div className={styles.footer}>
        <Button
          variant='outlined'
          size='small'
          onClick={this.handleCloseBtnClick}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          size='small'
          isLoading={isUploading}
          onClick={this.handleUploader}
        >
          Import
        </Button>
      </div>
    );
  };
  modalHeader = () => {
    return (
      <div className={cx(styles.header)}>
        <span className={cx(styles.header_left, 'font-bold')}>
          Update Table
        </span>
        <div className={styles.header_right}>
          <a
            style={{ marginRight: '10px' }}
            target='_blank'
            rel='noopener noreferrer'
            href={SUPPORT_LINK.DB_TABLE_CSV}
          >
            <Tooltip label={'Read about csv upload'}>
              <InfoEmpty
                className={styles.header_icon}
                height='1.5rem'
                width='1.5rem'
              />
            </Tooltip>
          </a>
          <IconButton
            icon={<Cancel height={24} width={24} />}
            className='ml-4'
            variant='ghost'
            onClick={this.handleCloseBtnClick}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <Modal
        onCloseHandler={this.handleCloseBtnClick}
        show={true}
        modalTitle={'Import Table'}
        isCloseIconBtn
        animation='fade'
        size='md'
        className={styles.modal}
      >
        {this.modalHeader()}
        {this.modalContent()}
        {this.modalFooter()}
      </Modal>
    );
  }
}
function mapStateToProp(state) {
  const { currentCSVDocId, documentsById } = state.csv;

  const currentDocument = currentCSVDocId && documentsById[currentCSVDocId];

  return {
    currentCSVDocId,
    currentDocument,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    csvActions: bindActionCreators(csvActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(UpdateModal)
);
