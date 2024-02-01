/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as csvActions } from 'new/redux/csv/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import download from 'downloadjs';
import { Cancel, InfoEmpty } from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import { SUPPORT_LINK } from 'new/constants/urllink';
import * as uploadHelper from 'new/helpers/uploadcsv';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal/Modal';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import Dropzone from 'react-dropzone';

import styles from './index.scss';

class CSVUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      isUploading: false,
    };

    this.dropZoneTypeRef = React.createRef();
  }

  handleCloseBtnClick = () => {
    const { csvActions } = this.props;
    csvActions.hideUploadCsvModal();
    this.setState({
      files: [],
    });
  };
  handleRemoveFile = () => {
    this.setState({
      files: [],
    });
  };
  handleUploader = () => {
    const { files } = this.state;
    uploadHelper.handleFileDrop({
      files: files,
      dropAccepted: true,
      csvUpload: true,
    });
    this.handleCloseBtnClick();
  };

  handleCustomDownload = async () => {
    const { appActions } = this.props;
    appActions.setToast({
      title: 'Downloading...',
      duration: 4000,
    });
    let result = {
      type: 'sample',
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

  handleDropAccepted = (files) => {
    this.setState({
      files: files,
    });
  };

  modalContent = () => {
    const { files } = this.state;
    return (
      <div className={styles.content}>
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
        <p className={styles.content_sampleText}>
          Click below to view the sample CSV file to follow the organised format
          for better data mapping.
        </p>
        <p
          className={styles.content_sampleCSV}
          onClick={this.handleCustomDownload}
        >
          Sample CSV File
        </p>
      </div>
    );
  };

  modalFooter = () => {
    const { files } = this.state;
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
          onClick={this.handleUploader}
          disabled={!files.length}
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
          Import Table
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
    const { uploadCsv } = this.props;
    if (!uploadCsv) return null;
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
  const { uploadCsv } = state.csv;

  return {
    uploadCsv,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    csvActions: bindActionCreators(csvActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(CSVUpload)
);
