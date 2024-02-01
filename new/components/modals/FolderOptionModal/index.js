import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import * as reduxHelpers from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import _, { get } from 'lodash';
import * as api from 'new/api';
import { PageMetadata } from 'new/components/layout/page';
//import Modal from 'react-responsive-modal';
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'new/components/shared/Modal';
import { ErrorText } from 'new/components/widgets/typography';
import ROUTES from 'new/constants/routes';
import Button from 'new/ui-elements/Button/Button';
import Input from 'new/ui-elements/Input/Input';
import * as utils from 'new/utils';

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
      this.props.history.push(ROUTES.ALL);
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
      this.props.history.push(ROUTES.ALL);
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

  render() {
    const { savingData, folderName, folderNameError } = this.state;
    const { renameFolderId } = this.props;

    return (
      <Fragment>
        <Modal
          className={styles.modal}
          onExit={this.handleCancelFolder}
          rootProps={{
            titleText: 'Folder',
          }}
        >
          <PageMetadata
            title={`${renameFolderId ? 'Rename' : 'Create New'} Folder`}
          />
          <ModalHeader
            title={`${renameFolderId ? 'Rename' : 'Create New'} Folder`}
            titleClassName={cx('ellipsis', styles.title)}
            className={styles.header}
            onCloseBtnClick={this.handleCancelFolder}
          />

          <ModalContent>
            <Input
              ref={this.nameInputRef}
              type='text'
              placeholder='Ex: Invoices'
              value={folderName}
              className={styles.input}
              onChange={this.handleInputChange}
              onKeyDown={(e) => this.onKeyDown(e)}
            />
            {folderNameError ? (
              <ErrorText className={styles.errorAbs}>
                {folderNameError}
              </ErrorText>
            ) : null}
          </ModalContent>
          <ModalFooter className={styles.modalFooterLeft}>
            <Button
              size='small'
              disabled={savingData}
              variant='outlined'
              onClick={this.handleCancelFolder}
              className='mr-4'
            >
              Cancel
            </Button>
            <Button
              size='small'
              isLoading={savingData}
              onClick={
                renameFolderId ? this.handleEditFolder : this.handleCreateFolder
              }
            >
              Create Folder
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
