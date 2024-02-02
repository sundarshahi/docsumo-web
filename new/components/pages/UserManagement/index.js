import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as usersActions } from 'new/redux/users/actions';
import { bindActionCreators } from 'redux';

import { Plus } from 'iconoir-react';
import { memoize } from 'lodash';
import * as api from 'new/api';
import { PageMetadata } from 'new/components/layout/page';
import DeleteConfirmationModal from 'new/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';
import { DataFetchFailurePageError } from 'new/components/shared/PageError';
import { FETCH_STATES } from 'new/constants/api';
import ROUTES from 'new/constants/routes';
import Button, { SIZE } from 'new/ui-elements/Button/Button';
import * as utils from 'new/utils';

import UsersList from './components/UserList/UsersList';
import AddUserModal from './components/UserModals/AddUserModal';
import EditUserModal from './components/UserModals/EditUserModal';
import TransferOwnershipModal from './components/UserModals/TransferOwnershipModal/TransferOwnershipModal';

import styles from './index.scss';

export const MODAL_TYPE = {
  addUser: 'ADD_USER',
  editUser: 'EDIT_USER',
  transferOwnership: 'TRANSFER_OWNERSHIP',
  deleteUser: 'DELETE_USER',
};

const UserManagementPage = ({
  users,
  isFetchingUsers,
  fetchFailed,
  usersActions,
  appActions,
  history,
}) => {
  // Set modal which is active, set empty string for closing all modal.
  const [activeModal, setActiveModal] = useState('');
  const [prevActiveModal, setPrevActiveModal] = useState('');
  const [canTransferOwnership, setCanTransferOwnership] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [editUserData, setEditUserData] = useState({});
  const [tempFormData, setTempFormData] = useState({});

  const handleAddUserClick = () => {
    setActiveModal(MODAL_TYPE.addUser);
  };

  const showFetchError = !isFetchingUsers && fetchFailed;
  const handleDeleteUser = async () => {
    const { userId: editUserId } = editUserData;

    setIsDeletingUser(true);

    try {
      await api.deleteMember({
        payload: {
          user_id: editUserId,
        },
      });

      usersActions.userDelete({
        user: editUserId,
      });
      appActions.setToast({
        title: 'User deleted.',
        success: true,
      });
      setActiveModal('');
    } catch (e) {
      const dError = e.responsePayload
        ? e.responsePayload.error
        : 'Something went wrong!';
      appActions.setToast({
        title: dError,
        error: true,
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const fetchUsers = (location = {}) => {
    const { pathname = '', search = '' } = location;
    if (!isFetchingUsers && pathname === ROUTES.USER_SETTINGS) {
      let queryParams = getValidPageQueryParams(search, {
        offset: {
          type: 'number',
          default: 0,
        },
      });

      usersActions.usersFetch({ queryParams });
    }
  };

  const getValidPageQueryParams = memoize((locationSearch) => {
    return utils.getValidPageQueryParams(locationSearch, {
      offset: {
        type: 'number',
        default: 0,
      },
    });
  });

  useEffect(() => {
    fetchUsers(location);

    const unlisten = history.listen(fetchUsers);

    return unlisten;
  }, []);

  return (
    <>
      <PageMetadata title='Users' />
      <div className={styles.pageHeader}>
        <div className={styles.title}>Users</div>
        <Button
          icon={<Plus width='1.25rem' height='1.25rem' />}
          onClick={handleAddUserClick}
          size={SIZE.SMALL}
        >
          Add User
        </Button>
      </div>

      <UsersList
        users={users || []}
        setActiveModal={setActiveModal}
        setEditUserData={setEditUserData}
        isLoading={isFetchingUsers}
      />
      {showFetchError ? <DataFetchFailurePageError className='mt-12' /> : null}
      {activeModal === MODAL_TYPE.addUser ? (
        <AddUserModal
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          tempFormData={tempFormData}
          setTempFormData={setTempFormData}
          canTransferOwnership={canTransferOwnership}
          showModal={activeModal === MODAL_TYPE.addUser}
          setPrevActiveModal={setPrevActiveModal}
          setCanTransferOwnership={setCanTransferOwnership}
        />
      ) : (
        ''
      )}
      {activeModal === MODAL_TYPE.editUser ? (
        <EditUserModal
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          editUserData={editUserData}
          tempFormData={tempFormData}
          setTempFormData={setTempFormData}
          canTransferOwnership={canTransferOwnership}
          showModal={activeModal === MODAL_TYPE.editUser}
          setPrevActiveModal={setPrevActiveModal}
          setCanTransferOwnership={setCanTransferOwnership}
        />
      ) : (
        ''
      )}
      {activeModal === MODAL_TYPE.transferOwnership ? (
        <TransferOwnershipModal
          setCanTransferOwnership={setCanTransferOwnership}
          setActiveModal={setActiveModal}
          modalType={activeModal}
          showModal={activeModal === MODAL_TYPE.transferOwnership}
          previousActiveModal={prevActiveModal}
        />
      ) : (
        ''
      )}
      <DeleteConfirmationModal
        show={activeModal === MODAL_TYPE.deleteUser}
        onCloseHandler={() => setActiveModal('')}
        handleDeleteBtnClick={handleDeleteUser}
        modalTitle='Delete User'
        isLoading={isDeletingUser}
        modalBody='Are you sure you want to delete the member?'
      />
    </>
  );
};

const mapStateToProps = ({
  users: {
    usersPage: { users, fetchState },
  },
}) => ({
  users,
  isFetchingUsers: fetchState === FETCH_STATES.FETCHING,
  fetchFailed: fetchState === FETCH_STATES.FAILURE,
});

const mapDispatchToProps = (dispatch) => ({
  usersActions: bindActionCreators(usersActions, dispatch),
  appActions: bindActionCreators(appActions, dispatch),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(UserManagementPage)
);
