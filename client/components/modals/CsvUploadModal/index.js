/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from '@redux/app/actions';
import { actions as csvActions } from '@redux/csv/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as api from 'client/api';
import download from 'downloadjs';
import * as uploadHelper from 'helpers/uploadcsv';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as ClearIcon } from 'images/icons/clear.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import { ReactComponent as InfoIcon } from 'images/icons/info.svg';
//import {ReactComponent as DeleteIcon} from 'images/icons/deletedoc.svg';
import _ from 'lodash';
import Dropzone from 'react-dropzone';

import Modal, { ModalContent, ModalFooter } from 'components/shared/Modal';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';

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

  // componentDidMount(){
  //     let fileUpload = document.getElementById('file-upload');
  //     fileUpload.addEventListener('change', () => {
  //         console.log('dsad',fileUpload.files);
  //     });

  // }

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

  renderHeader = () => {
    return (
      <div className={cx(styles.header)}>
        <>
          <h2 className={cx(styles.title)}>Import Table</h2>
        </>

        <a
          className={styles.infoIconBox}
          target='_blank'
          rel='noopener noreferrer'
          href='https://support.docsumo.com/docs/database-table-and-dropdown-mapped'
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

  handleCustomDownload = async () => {
    const { appActions } = this.props;
    appActions.setToast({
      title: 'Downloading...',
      timeout: 4,
    });
    let result = {
      type: 'sample',
    };
    try {
      const { responsePayload } = await api.downloadCsv({
        ...result,
      });
      this.handleCloseBtnClick();
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

  handleSelectFile = () => {
    this.inputRef.current.click();
  };

  render() {
    const { uploadCsv } = this.props;
    const { files, isUploading } = this.state;
    if (!uploadCsv) return null;
    return (
      <Modal
        className={styles.root}
        onExit={this.handleCloseBtnClick}
        rootProps={{
          titleText: 'Import Table',
        }}
      >
        {this.renderHeader()}
        <ModalContent className={styles.modalContent}>
          <h1>Upload</h1>
          <div className={styles.uploadBox}>
            {files.length ? (
              <>
                <div className={styles.fileContainer}>
                  <div className={styles.fileName}>{files[0].name}</div>
                  <div className={styles.progress}>
                    <div className={styles.progressBar}></div>
                    <div className={styles.progressDeleteIcon}>
                      <ClearIcon onClick={() => this.handleRemoveFile()} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Dropzone
                  ref={this.dropzoneRef}
                  accept='.csv, application/vnd.ms-excel'
                  className={styles.dropzone}
                  multiple={false}
                  activeClassName={styles['dropzone--active']}
                  onDropAccepted={this.handleDropAccepted}
                >
                  <p className={styles.placeholderText}>
                    Drag & Drop files here or
                  </p>
                  <Button
                    text='Select File'
                    appearance={BUTTON_APPEARANCES.PRIMARY}
                    className={styles.btn}
                    onClick={() => this.handleSelectFile()}
                  />
                </Dropzone>
              </>
            )}
          </div>
          <p className={styles.sampleText}>
            Click below to view the sample CSV file to follow the organised
            format for better data mapping.
          </p>
          <p className={styles.sampleCSV} onClick={this.handleCustomDownload}>
            Sample CSV File
          </p>
        </ModalContent>
        <ModalFooter className={styles.modalFooter}>
          <Button
            text='Cancel'
            iconLeft={CloseIcon}
            appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
            className={cx(styles.btn, styles.btnCancel)}
            onClick={() => this.handleCloseBtnClick()}
          />
          <Button
            text='Import'
            disabled={!files.length}
            iconLeft={CheckIcon}
            isLoading={isUploading}
            appearance={BUTTON_APPEARANCES.PRIMARY}
            className={styles.btn}
            onClick={() => this.handleUploader()}
          />
        </ModalFooter>
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
