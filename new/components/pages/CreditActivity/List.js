import React, { Fragment } from 'react';

import cx from 'classnames';
import {
  CustomHeaderCell,
  //FolderTitleCell
  CustomTextCell,
  //TypeHeaderCell,
  DateAddedHeaderCell,
  //TitleCell,
  //TypeCell,
  //StatusCell,
  DateCell,
  TitleHeaderCell,
} from 'new/components/shared/documentList';
import { Header, Row } from 'new/components/shared/tabularList';
import * as documentConstants from 'new/constants/document';

//import CustomCell from 'new/components/shared/documentList';
import styles from './list.scss';

const DocumentListHeader = (props) => {
  const { sortOrderValues = {}, onSortableItemClick } = props;

  return (
    <Header className={styles.header}>
      <TitleHeaderCell
        className={cx(styles.headerCell, styles.wideCell)}
        title={'Description'}
      />

      <CustomHeaderCell className={styles.headerCell} name='Type' />
      <CustomHeaderCell className={styles.headerCell} name='User' />

      <DateAddedHeaderCell
        className={styles.headerCell}
        sortKey={documentConstants.SORT_KEYS.CREATED_DATE}
        sortOrder={
          sortOrderValues
            ? sortOrderValues[documentConstants.SORT_KEYS.CREATED_DATE]
            : null
        }
        onClick={onSortableItemClick}
      />
    </Header>
  );
};

const DocumentList = (props) => {
  const { documents, onActionClick, appActions } = props;
  return (
    <Fragment>
      {documents.map((document, index) => {
        return (
          <DocumentItem
            key={index}
            document={document}
            onActionClick={onActionClick}
            appActions={appActions}
          />
        );
      })}
    </Fragment>
  );
};

const DocumentItem = (props) => {
  const {
    document,
    //onActionClick,
    //appActions
  } = props;

  const { action, dateTime, name, type } = document;
  let actionType = '';
  switch (type) {
    case 'document_action':
      actionType = 'Document';
      break;
    case 'admin_action':
      actionType = 'Credit';
      break;
    case 'user_action':
      actionType = 'User';
      break;
    default:
      actionType = 'Document';
      break;
  }
  return (
    <Row className={cx(styles.row)}>
      <CustomTextCell
        className={cx(styles.headerCell, styles.wideCell)}
        title={action}
        width={800}
      />
      <CustomTextCell className={styles.cell} title={actionType} />
      <CustomTextCell className={styles.cell} title={name} />
      <DateCell className={styles.cell} date={dateTime} />
    </Row>
  );
};

export { DocumentItem, DocumentList, DocumentListHeader };
