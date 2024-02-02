import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import cx from 'classnames';
import { Edit } from 'iconoir-react';
import { USER_ROLES } from 'new/constants/userRoles';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import { SIZE } from 'new/ui-elements/IconButton/IconButton';
import { VARIANT } from 'new/ui-elements/IconButton/IconButton';
import Pagination from 'new/ui-elements/Pagination';
import Table from 'new/ui-elements/Table';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import queryString from 'query-string';

import { MODAL_TYPE } from '../..';

import styles from './UsersList.scss';

export const UsersList = ({
  users = [],
  meta,
  match,
  history,
  location,
  setActiveModal,
  setEditUserData,
  isLoading,
  currentUser,
}) => {
  const prevPropsRef = useRef({ users });

  const handleEditUserClick = (user) => {
    setActiveModal(MODAL_TYPE.editUser);
    setEditUserData(user);
  };

  const userColumnStructure = () => [
    {
      key: 'user',
      title: 'User',
      customBodyCell: BodyUserComponent,
      width: '200px',
      minWidth: '30%',
      bodyCellClassNames: styles.userListBodyCell,
    },
    {
      key: 'role',
      title: 'Current Role',
      width: '20%',
      bodyCellClassNames: [styles.roleColumnCell, styles.userListBodyCell],
    },
    {
      key: 'api-access',
      title: 'API Access',
      customBodyCell: BodyApiAccessComponent,
      width: '40%',
      bodyCellClassNames: styles.userListBodyCell,
    },
    {
      key: 'actions',
      title: 'Actions',
      customBodyCell: ({ cellData, currentUser }) => {
        const canEditUser =
          currentUser?.role === USER_ROLES.OWNER ||
          (cellData?.role !== USER_ROLES.OWNER &&
            currentUser?.role !== USER_ROLES.OWNER);
        return (
          <Tooltip
            label={
              canEditUser ? 'Edit User' : 'Cannot edit settings of the Owner'
            }
            placement='left'
          >
            <IconButton
              icon={<Edit width='1.5rem' height='1.5rem' />}
              size={SIZE.SMALL}
              variant={VARIANT.GHOST}
              disabled={!canEditUser}
            />
          </Tooltip>
        );
      },
      onBodyCellClick: onActionClick,
      width: '10%',
      bodyCellClassNames: [styles.editIcon, styles.userListBodyCell],
    },
  ];

  useEffect(() => {
    const currentPage = Math.ceil((meta.offset + 1) / meta.limit);
    if (
      !users.length &&
      prevPropsRef.current.users.length !== users.length &&
      currentPage > 1
    ) {
      handlePageNavigation(currentPage - 1);
    }
  }, [users]);

  const onActionClick = ({ item }) => {
    handleEditUserClick(item);
  };

  const handlePageNavigation = (page) => {
    const offset = meta.limit * (page - 1);
    const params = {
      ...queryString.parse(location.search),
      offset: offset,
    };
    // this.props.documentActions.setTypWiseSelectionALL({
    //     uid:'all', checked: false
    // });

    history.push(`${match.url}?${queryString.stringify(params)}`);
  };

  const renderPagination = () => {
    if (isLoading) return <></>;

    const totalPageCount = Math.ceil(meta.total / meta.limit);
    const currentPage = Math.ceil((meta.offset + 1) / meta.limit);

    return (
      <div className={styles.paginationContainer}>
        <Pagination
          totalPageCount={totalPageCount}
          currentPage={currentPage}
          leftRightOffset={1}
          siblings={1}
          onPageChange={handlePageNavigation}
        />
      </div>
    );
  };

  return (
    <div className={styles.usersList}>
      <Table
        data={users}
        initialColumnStructure={userColumnStructure()}
        rowKey={'userId'}
        headerClassNames={styles.userListHeader}
        bodyClassNames={styles.userListBody}
        showLoader={isLoading}
        tableBodyCellProps={{ currentUser }}
      />

      {renderPagination()}
    </div>
  );
};

const BodyUserComponent = ({ cellData }) => {
  const { fullName, email } = cellData;
  return (
    <div className='d-flex justify-content-between align-items-center w-100'>
      <div className={styles.userAvatar}>{fullName?.charAt(0)}</div>
      <div className='w-100 d-flex flex-direction-column'>
        <div className={cx(styles.userName, 'text-truncate')}>{fullName}</div>
        <div className={cx(styles.userEmail, 'text-truncate')}>{email}</div>
      </div>
    </div>
  );
};

const BodyApiAccessComponent = ({ cellData: { authorizedDocTypes } }) => {
  const apiAccessList =
    authorizedDocTypes && authorizedDocTypes.length
      ? authorizedDocTypes.map((item) => item.title)
      : [];
  const apiAccessString = apiAccessList.length ? apiAccessList.join(', ') : '';
  return (
    <span className={styles.apiAccessColumnCell} title={apiAccessString}>
      {apiAccessString}
    </span>
  );
};

const mapStateToProp = ({
  users: {
    usersPage: { meta, users },
  },
}) => {
  const currentUser = users?.length ? users.find((item) => item.default) : {};
  return {
    meta,
    currentUser,
  };
};

export default withRouter(connect(mapStateToProp, {})(UsersList));
