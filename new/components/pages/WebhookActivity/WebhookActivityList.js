import React, { Fragment } from 'react';

import cx from 'classnames';
import {
  CustomHeaderCell,
  CustomTextCell,
  DateAddedHeaderCell,
  DateCell,
  TitleHeaderCell,
} from 'new/components/shared/documentList';
import { Header, Row } from 'new/components/shared/tabularList';
import * as documentConstants from 'new/constants/document';

import styles from './Webhook.scss';

const WebhookListHeader = (props) => {
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

const WebhookList = (props) => {
  const { activities = [] } = props;
  return (
    <Fragment>
      {activities.length
        ? activities.map((activity, index) => {
            return <WebhookListItem key={index} activity={activity} />;
          })
        : null}
    </Fragment>
  );
};

const WebhookListItem = (props) => {
  const { activity = {} } = props;

  const { action, dateTime, name } = activity;

  return (
    <Row className={cx(styles.row)}>
      <CustomTextCell
        className={cx(styles.headerCell, styles.wideCell)}
        title={action}
        width={800}
      />
      <CustomTextCell className={styles.cell} title='Webhook' />
      <CustomTextCell className={styles.cell} title={name} />
      <DateCell className={styles.cell} date={dateTime} />
    </Row>
  );
};

export { WebhookList, WebhookListHeader, WebhookListItem };
