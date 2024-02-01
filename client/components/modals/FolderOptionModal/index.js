import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from '@redux/app/actions';
import { actions as documentActions } from '@redux/documents/actions';
import { showToast } from 'client/redux/helpers';
import * as reduxHelpers from 'client/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as api from 'client/api';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'client/components/widgets/buttons';
import * as utils from 'client/utils';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import _, { get } from 'lodash';

import { PageMetadata } from 'components/layout/page';
//import Modal from 'react-responsive-modal';
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'components/shared/Modal';
import { ErrorText } from 'components/widgets/typography';

import styles from './index.scss';

class FolderOption extends Component {
  state = {
    folderName: '',
    folderNameError: '',

    renameFolderId: null,

    savingData: false,
  };
  isMounted = false;
  nameInputRef = React.createRef();
  componentDidMount() {
    this.isMounted = true;

    if (this.nameInputRef && this.nameInputRef.current) {
      const nameInputRef = this.nameInputRef.current;
      setTimeout(() => {
        nameInputRef.focus();
      }, 500);
    }
  }
  componentDidUpdate(prevProps) {
    const { renameFolderId } = this.props;

    if (renameFolderId && renameFolderId !== prevProps.renameFolderId) {
      this.setState(
        {
          renameFolderId,
        },
        () => this.fetchFolderName(renameFolderId)
      );
    }

    // if (this.nameInputRef && this.nameInputRef.current) {
    //     this.nameInputRef.current.focus();
    // }
  }
  fetchFolderName = (renameFolderId) => {
    const store = reduxHelpers.getStore();
    const {
      documents: { selectedFolderData },
    } = store.getState();
    if (renameFolderId === selectedFolderData.folderId) {
      this.setState({
        folderName: selectedFolderData.folderName,
        renameFolderId: renameFolderId,
      });
    }
  };

  handleInputChange = (e) => {
    this.setState({
      folderName: e.target.value,
      folderNameError: '',
    });
  };

  handleEditFolder = async () => {
    const { folderName, renameFolderId } = this.state;

    let formError = '';

    if (_.isEmpty(folderName.trim())) {
      formError = {
        folderNameError: 'Please enter the name of folder',
      };
    }
    if (formError) {
      this.setState({ ...formError });
      return;
    }

    this.setState({
      savingData: true,
    });

    try {
      await api.editNewFolder({
        payload: {
          folder_id: renameFolderId,
          folder_name: folderName,
        },
      });
      showToast({
        title: 'Folder name changed successfully!',
        success: true,
      });
      this.handleCancelFolder();
      this.props.history.push('/all');
    } catch (e) {
      const error = get(
        e.responsePayload,
        'error',
        'Failed to change Folder Name'
      );

      this.setState({
        folderNameError: error,
      });
    } finally {
      this.setState({
        savingData: false,
      });
    }
  };

  handleCreateFolder = async () => {
    const { folderName } = this.state;

    let formError = '';

    if (_.isEmpty(folderName.trim())) {
      formError = {
        folderNameError: 'Please enter the name of folder',
      };
    }
    if (formError) {
      this.setState({ ...formError });
      return;
    }

    this.setState({
      savingData: true,
    });

    try {
      await api.createNewFolder({
        payload: {
          folder_name: folderName,
        },
      });
      showToast({
        title: 'Folder created successfully!',
        success: true,
      });
      this.handleCancelFolder();
      this.props.history.push('/all');
      let searchQuery = utils.getValidPageQueryParams(
        _.get(this.props, 'location.search'),
        {
          q: {
            type: 'string',
            default: '',
          },
          folder_id: {
            type: 'string',
            default: '',
          },
        }
      );
      const { folder_id, q = '' } = searchQuery;
      this.props.documentActions.allDocumentsFetch({
        queryParams: {
          q,
          view: 'folder',
          folder_id,
        },
      });
    } catch (e) {
      this.setState({
        folderNameError: e?.responsePayload?.message || 'Something went wrong!',
      });
    } finally {
      this.setState({
        savingData: false,
      });
    }
  };
  handleCancelFolder = () => {
    this.setState(
      {
        folderName: '',
        folderNameError: '',

        renameFolderId: null,

        savingData: false,
      },
      () => {
        this.props.appActions.setFolderOption({
          renameFolderId: null,
          addNewFolder: false,
        });
      }
    );
  };

  onKeyDown = (e) => {
    if (e.key === 'Enter' && this.state.renameFolderId) {
      this.handleEditFolder();
    } else if (e.key === 'Enter') {
      this.handleCreateFolder();
    }
  };
  renderFormContent = () => {
    const { folderName, folderNameError } = this.state;
    return (
      <Fragment>
        <input
          ref={this.nameInputRef}
          type='text'
          placeholder='ex: All invoices'
          value={folderName}
          className={styles.input}
          onChange={this.handleInputChange}
          onKeyDown={(e) => this.onKeyDown(e)}
        />
        {folderNameError ? (
          <ErrorText className={styles.errorAbs}>{folderNameError}</ErrorText>
        ) : null}
      </Fragment>
    );
  };
  render() {
    const { savingData } = this.state;
    const { renameFolderId } = this.props;

    return (
      <Fragment>
        {/* <Modal
                    classNames={{
                        modal:styles.modal
                    }}
                    center={true}
                    closeOnEsc={false}
                    open={Boolean(renameFolderId) || addNewFolder }
                    onClose={this.handleCancelFolder}
                    blockScroll={true}
                >
                    <PageMetadata
                        title={`${renameFolderId ? 'Rename' : 'New'} Folder`}
                    />
                    <ModalHeader className={styles.modalHeader} title={`${renameFolderId ? 'Rename' : 'New Folder'}`} />
                    <ModalContent> { this.renderFormContent() }</ModalContent>
                    <ModalFooter className={styles.modalFooterLeft}> 
                        <Button disabled={savingData} iconLeft={CloseIcon} appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}  onClick={this.handleCancelFolder} pre>
                            Cancel
                        </Button>
                        <Button isLoading={savingData} iconLeft={CheckIcon} onClick={ renameFolderId ? this.handleEditFolder : this.handleCreateFolder } >
                            Submit
                        </Button>
                    </ModalFooter>
                </Modal> */}
        <Modal
          className={styles.modal}
          onExit={this.handleCancelFolder}
          rootProps={{
            titleText: 'Folder',
          }}
        >
          <PageMetadata title={`${renameFolderId ? 'Rename' : 'New'} Folder`} />
          <ModalHeader
            title={`${renameFolderId ? 'Rename' : 'New'} Folder`}
            titleClassName={cx('ellipsis', styles.title)}
            className={styles.header}
            closeBtnClassName={styles.closeBtnClassName}
            onCloseBtnClick={this.handleCancelFolder}
          />

          <ModalContent> {this.renderFormContent()}</ModalContent>
          <ModalFooter className={styles.modalFooterLeft}>
            <Button
              disabled={savingData}
              iconLeft={CloseIcon}
              className={styles.cancelButton}
              appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
              onClick={this.handleCancelFolder}
              pre
            >
              Cancel
            </Button>
            <Button
              isLoading={savingData}
              iconLeft={CheckIcon}
              onClick={
                renameFolderId ? this.handleEditFolder : this.handleCreateFolder
              }
            >
              Submit
            </Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

const FolderOptionModal = (props) => {
  const { addNewFolder } = props;
  if (!addNewFolder) {
    return null;
  }
  return <FolderOption {...props} />;
};

function mapStateToProp(state) {
  const { renameFolderId, addNewFolder } = state.app;

  return {
    renameFolderId,
    addNewFolder,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}
export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(FolderOptionModal)
);
