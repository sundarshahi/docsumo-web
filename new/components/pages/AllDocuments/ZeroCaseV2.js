import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showIntroModal } from 'new/redux/helpers';

import cx from 'classnames';
import { ReactComponent as FileAddIcon } from 'new/assets/images/icons/file-add.svg';
import NewDropdown from 'new/components/layout/PrimarySidebar/NewDropdown';
import { APPEARANCES, Button } from 'new/components/widgets/buttons';

import styles from './zeroCaseV2.scss';

class ZeroCaseV2 extends Component {
  state = {
    isNewDropdownVisible: false,
  };

  handleNewBtnClick = () => {
    this.setState({
      isNewDropdownVisible: true,
    });
  };

  handleWatchIntroBtnClick = () => {
    showIntroModal();
  };

  closeNewDropdown = () => {
    this.setState({
      isNewDropdownVisible: false,
    });
  };

  handleUploadFileBtnClick = (...args) => {
    this.closeNewDropdown();
    this.props.onUploadFileBtnClick(...args);
  };
  handleUploadFolderBtnClick = (...args) => {
    this.closeNewDropdown();
    this.props.onUploadFolderBtnClick(...args);
  };

  render() {
    const { user, config } = this.props;
    const { isNewDropdownVisible } = this.state;

    const documentTypes = config.documentTypes || [];
    const uploadableDocumentTypes = documentTypes.filter(
      (item) => item.canUpload
    );

    if (!uploadableDocumentTypes.length) {
      return 'No documents.';
    }

    return (
      <div className={styles.root}>
        <FileAddIcon className={styles.icon} />
        <p className={styles.title}>Click below to upload documents</p>
        <Button
          appearance={APPEARANCES.CUSTOM_ZERO_CASE_UPLOAD}
          onClick={this.handleNewBtnClick}
        >
          Upload documents
        </Button>

        <button
          className={cx('unstyled-btn', styles.introBtn)}
          onClick={this.handleWatchIntroBtnClick}
        >
          Watch Intro
        </button>

        {isNewDropdownVisible ? (
          <NewDropdown
            className={styles.newDropdown}
            documentTypes={uploadableDocumentTypes}
            uploadEmailAddress={user.uploadEmail}
            onOutsideClick={this.closeNewDropdown}
            onUploadFileBtnClick={this.handleUploadFileBtnClick}
            onUploadFolderBtnClick={this.handleUploadFolderBtnClick}
          />
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { user, config } = state.app;

  return {
    user,
    config,
  };
}

export default connect(mapStateToProps)(ZeroCaseV2);
