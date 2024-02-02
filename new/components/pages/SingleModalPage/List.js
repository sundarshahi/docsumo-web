import React, { Fragment } from 'react';

import cx from 'classnames';
import { CustomTextCell } from 'new/components/shared/documentList';
import { Row } from 'new/components/shared/tabularList';

import styles from './list.scss';

const DocumentList = (props) => {
  const { documents } = props;
  return (
    <Fragment>
      {documents.map((document, index) => {
        return <DocumentItem key={index} document={document} />;
      })}
    </Fragment>
  );
};

const DocumentItem = (props) => {
  const { document } = props;

  const { title, precision, accuracy, recall, f1Score, support } = document;

  return (
    <Row className={cx(styles.row)}>
      <CustomTextCell
        className={cx(styles.cell, styles.wideCell)}
        title={title}
      />
      <CustomTextCell
        className={styles.cell}
        title={
          `${!accuracy ? 0 : Math.round(Number(accuracy.toFixed(2) * 100))}%` ||
          `${f1Score.toFixed(2) * 100}%`
        }
      />
      <CustomTextCell className={styles.cell} title={precision.toFixed(2)} />
      <CustomTextCell className={styles.cell} title={recall.toFixed(2)} />
      <CustomTextCell className={styles.cell} title={f1Score.toFixed(2)} />
      <CustomTextCell className={styles.cell} title={support.toFixed(2)} />
    </Row>
  );
};

export { DocumentItem, DocumentList };
