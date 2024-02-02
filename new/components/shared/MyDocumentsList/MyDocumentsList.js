/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import { format } from 'date-fns';
import { SortDown, SortUp } from 'iconoir-react';
import _ from 'lodash';
import DocumentStatus from 'new/components/shared/DocumentStatus/DocumentStatus';
import * as documentConstants from 'new/constants/document';
import Pagination from 'new/ui-elements/Pagination';
import Table from 'new/ui-elements/Table';

import DocumentTypeCell from './components/DocumentTypeCell/DocumentTypeCell';
import EmptyTable from './components/EmptyTable/EmptyTable';
import FileFolderCell from './components/FileFolderCell/FileFolderCell';
import PermissionDeniedState from './components/PermissionDeniedState/PermissionDeniedState';
import UploadedByCell from './components/UploadedByCell/UploadedByCell';

import styles from './MyDocumentsList.scss';

const DateCell = ({ dateValue }) => {
  let dateTime = new Date(dateValue).getTime();

  return (
    <div>
      <p>{format(dateTime, 'h:mm a')}</p>
      <p className={styles.dateField}>{format(dateTime, 'd LLL yyyy')}</p>
    </div>
  );
};

const SortableHeaderCell = ({
  cellData,
  sortOrderValues = {},
  onSortableItemClick,
}) => {
  const { title, key } = cellData;

  const sortOrder = !_.isEmpty(sortOrderValues) ? sortOrderValues[key] : 'asc';

  return (
    <div
      className={styles.sortableHeaderCell}
      title={`Sort by ${title?.toLowerCase()}`}
      onClick={() => onSortableItemClick(key)}
    >
      <span className={styles.sortableHeaderCell_text}>{title}</span>
      <span className={'d-flex justify-content-center align-items-center'}>
        {sortOrder === 'desc' ? (
          <SortDown color={'var(--ds-clr-gray-800'} />
        ) : (
          <SortUp color={'var(--ds-clr-gray-800'} />
        )}
      </span>
    </div>
  );
};

function MyDocumentsList(props) {
  const {
    uid = '',
    isLoading = false,
    documents = [],
    selectedList = [],
    currentEditId = '',
    documentTypes = [],
    showPagination,
    meta = {},
    onPageChange,
    onDocumentActionChange,
    sortOrderValues,
    onSortableItemClick,
    showEmptyState,
    documentActions,
    appActions,
    showPermissionDenied,
    user,
    onUploadFileBtnClick,
    onUploadFolderBtnClick,
    config,
  } = props;

  const emptyState = showEmptyState ? (
    <EmptyTable
      uid={uid}
      config={config}
      user={user}
      onUploadFileBtnClick={onUploadFileBtnClick}
      onUploadFolderBtnClick={onUploadFolderBtnClick}
    />
  ) : null;
  const permissionDeniedState = showPermissionDenied ? (
    <PermissionDeniedState />
  ) : null;

  const getSelectionIdentifier = (docItem) => {
    const { displayType } = docItem;

    if (displayType === 'folder') {
      return 'folderId';
    } else {
      return 'docId';
    }
  };

  const handleFileOrFolderSelectionChange = ({ checked, value }) => {
    const optionChecked = !checked;
    const included = selectedList.includes(value);

    if (optionChecked && !included) {
      documentActions.setTypeWiseSelections({
        uid,
        checked: [...selectedList, value],
      });
    } else if (!optionChecked && included) {
      const result = selectedList.filter((e) => e !== value);
      documentActions.setTypeWiseSelections({
        uid,
        checked: [...result],
      });
    }

    if (selectedList.length > 0) documentActions.setEditDocId({ docId: null });
  };

  const getRowClickableStatus = (docItem) => {
    const { isDeleting, displayType, status } = docItem;

    const isNew = status === documentConstants.STATUSES.NEW;
    const isProcessing = status === documentConstants.STATUSES.PROCESSING;
    const isErred = status === documentConstants.STATUSES.ERRED;

    const reviewActionAllowed =
      !isNew && !isProcessing && !isErred && !isDeleting;

    if (reviewActionAllowed || displayType === 'folder') {
      return true;
    } else {
      return false;
    }
  };

  const handleRowClick = ({ item }) => {
    const {
      displayType,
      docId = '',
      folderId = '',
      isDeleting,
      type,
      excelType,
      status,
    } = item;

    let actionType = '',
      id = docId;

    const isNew = status === documentConstants.STATUSES.NEW;
    const isProcessing = status === documentConstants.STATUSES.PROCESSING;
    const isErred = status === documentConstants.STATUSES.ERRED;

    const reviewActionAllowed =
      !isNew && !isProcessing && !isErred && !isDeleting;

    if (displayType === 'folder') {
      actionType = 'folderView';
      id = folderId;
    } else {
      if (reviewActionAllowed) {
        if (type === 'auto_classify' || type === 'auto_classify__test') {
          actionType = 'classifyView';
        } else if (excelType) {
          actionType = 'excelView';
        } else {
          actionType = 'review';
        }
      }
    }

    onDocumentActionChange(actionType, id);
  };

  const getTableColumns = () => {
    const tableColumns = [
      {
        key: 'name',
        title: 'Name',
        width: '35%',
        minWidth: '300px',
        showHoverIcon: true,
        className: styles.customCell,
        customBodyCell: (props) => (
          <FileFolderCell
            {...props}
            onDocumentActionChange={onDocumentActionChange}
            resetEditId={documentActions.resetDocId}
          />
        ),
      },
      {
        key: 'status',
        title: 'Status',
        width: '12%',
        className: styles.customCell,
        customBodyCell: ({ cellData }) => {
          const { status, errMessage } = cellData;
          return <DocumentStatus status={status} errMessage={errMessage} />;
        },
      },
      {
        key: 'type',
        title: 'Type',
        width: '20%',
        className: styles.customCell,
        customBodyCell: (props) => (
          <DocumentTypeCell
            {...props}
            documentTypes={config?.documentTypes}
            onDocumentActionChange={onDocumentActionChange}
          />
        ),
      },
      {
        key: 'uploaded_by',
        title: 'Uploaded By',
        width: '15%',
        className: [styles.customCell, styles.uploadedByCell],
        customBodyCell: (props) => <UploadedByCell {...props} />,
      },
      {
        key: 'modified_date',
        title: 'Date Modified',
        width: '10%',
        minWidth: '160px',
        customHeaderCell: ({ cellData, sortOrderValues }) => (
          <SortableHeaderCell
            cellData={cellData}
            sortOrderValues={sortOrderValues}
            onSortableItemClick={onSortableItemClick}
          />
        ),
        customBodyCell: ({ cellData }) => {
          const { modifiedAtIso, createdAtIso } = cellData;
          return <DateCell dateValue={modifiedAtIso || createdAtIso} />;
        },
      },
      {
        key: 'created_date',
        title: 'Date Added',
        width: '8%',
        minWidth: '160px',
        customHeaderCell: ({ cellData, sortOrderValues }) => (
          <SortableHeaderCell
            cellData={cellData}
            sortOrderValues={sortOrderValues}
            onSortableItemClick={onSortableItemClick}
          />
        ),
        customBodyCell: ({ cellData }) => {
          const { createdAtIso } = cellData;
          return <DateCell dateValue={createdAtIso} />;
        },
      },
    ];

    return tableColumns;
  };

  const renderPagination = () => {
    if (!showPagination) return <></>;

    const totalPageCount = Math.ceil(meta.total / meta.limit);
    const currentPage = Math.ceil((meta.offset + 1) / meta.limit);

    return (
      <div className={styles.paginationContainer}>
        <Pagination
          totalPageCount={totalPageCount}
          currentPage={currentPage}
          leftRightOffset={1}
          siblings={1}
          onPageChange={onPageChange}
        />
      </div>
    );
  };

  if (permissionDeniedState) {
    return permissionDeniedState;
  }
  return (
    <>
      <Table
        initialColumnStructure={getTableColumns()}
        data={documents}
        bodyClassNames={styles.tableBody}
        showCheckbox={true}
        checkedRows={selectedList}
        rowKey=''
        setRowKey={getSelectionIdentifier}
        setCheckedRows={handleFileOrFolderSelectionChange}
        tableBodyCellProps={{
          currentEditId,
        }}
        tableHeaderCellProps={{
          sortOrderValues,
          documentTypes,
        }}
        showLoader={isLoading}
        emptyState={emptyState}
        headerClassNames={styles.tableHeader}
        onRowClick={handleRowClick}
        setRowClickableStatus={getRowClickableStatus}
      />
      {renderPagination()}
    </>
  );
}

function mapStateToProp(state) {
  const { config } = state.app;

  const { currentEditId } = state.documents;

  return {
    currentEditId,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(MyDocumentsList)
);
