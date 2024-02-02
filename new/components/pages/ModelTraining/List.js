import React, { Fragment } from 'react';

import cx from 'classnames';
import {
  CustomAnalysisHeaderCell,
  CustomHeaderCell,
  CustomMetricCell,
  //ActionsHeaderCell,
  CustomTextCell,
  //UserDetailCell,
  //UserActionsCell
  DateAddedHeaderCell,
  DateCell,
  ModelTitleCell,
} from 'new/components/shared/documentList';
import { Header, Row } from 'new/components/shared/tabularList';

import styles from './list.scss';

export const DocumentListHeader = () => {
  return (
    <Header className={styles.header}>
      <CustomHeaderCell
        className={cx(styles.headerCell, styles.wideCell)}
        name='Model Name'
      />
      <CustomHeaderCell className={styles.headerCell} name='Model Type' />
      <CustomHeaderCell className={styles.headerCell} name='Document Type' />
      <DateAddedHeaderCell
        className={cx(styles.headerCell, styles.dateAdded)}
      />
      <CustomHeaderCell
        className={cx(styles.headerCell, styles.analysis)}
        name='Analysis'
      />
    </Header>
  );
};
export const DocumentListSubHeader = () => {
  return (
    <Header className={styles.subHeader}>
      <CustomAnalysisHeaderCell
        className={cx(styles.subHeaderCell)}
        name='Accuracy'
        tooltip={true}
        tooltipContent={'% of correct predictions by model.'}
      />
      <CustomAnalysisHeaderCell
        className={styles.subHeaderCell}
        name='Precision'
        tooltip={true}
        tooltipContent={
          'If the model predicts 10 L labels, out of which 8 are actually correct label L, then precision is 8/10 -> 0.8 (80%)'
        }
      />
      <CustomAnalysisHeaderCell
        className={styles.subHeaderCell}
        name='Recall'
        tooltip={true}
        tooltipContent={
          'If there are originally 20 L labels, out of which model identifies 8 correctly, then recall is 8/20 -> 0.4 (40%)'
        }
      />
      <CustomAnalysisHeaderCell
        className={cx(styles.subHeaderCell)}
        name='F1 Score'
        tooltip={true}
        tooltipContent={
          'Harmonic mean between precision and recall F1 -> 2 * p * r/(p+r) -> 2 * 0.8 * 0.4/(0.8 + 0.4) -> 0.64/1.2 -> 0.533'
        }
      />
      <CustomAnalysisHeaderCell
        className={cx(styles.subHeaderCell)}
        tooltipClassName={styles.tooltipContainer}
        arrowClassName={styles.arrowClass}
        name='Support'
        tooltip={true}
        tooltipContent={'No. of fields in Documents.'}
      />
    </Header>
  );
};

export const DocumentList = (props) => {
  const {
    documents,
    onActionClick,
    appActions,
    handleSelectionDocList,
    selectedDocuments,
    modelTypeData,
  } = props;

  return (
    <Fragment>
      {documents.map((document) => {
        const id = document.modelId;
        return (
          <DocumentItem
            key={document.modelId}
            document={document}
            appActions={appActions}
            onSelctionChange={handleSelectionDocList}
            checked={selectedDocuments.includes(id)}
            onActionClick={onActionClick}
            modelTypeData={modelTypeData}
          />
        );
      })}
    </Fragment>
  );
};

const DocumentItem = (props) => {
  const {
    onActionClick,
    document,
    onSelctionChange,
    checked,
    modelTypeData,
    //appActions
  } = props;

  const {
    modelType,
    docTypeVerbose,
    modelTagVerbose,
    startedAtIso,
    modelId,
    status,
    metrics,
    elapsed,
    eta,
    estimatedTime,
  } = document;
  let [model] = modelTypeData.filter((item) => item.value === modelType);

  let viewActionAllowed = status === 'COMPLETE';

  return (
    <Row
      className={cx(styles.row, {
        [styles.disableRowClick]: !viewActionAllowed,
      })}
      onClick={() => (viewActionAllowed ? onActionClick(modelId) : null)}
    >
      <ModelTitleCell
        className={cx(styles.cell, styles.wideCell)}
        titleClassName={styles.modelTitle}
        title={modelTagVerbose}
        checked={checked}
        docId={modelId}
        onSelctionChange={onSelctionChange}
        onActionClick={onActionClick}
      />
      <CustomTextCell
        className={styles.cell}
        title={model.title}
        titleClassName={styles.text}
      />
      <CustomTextCell
        className={styles.cell}
        title={docTypeVerbose}
        titleClassName={styles.text}
      />
      <DateCell
        className={cx(styles.cell, styles.dateAdded)}
        date={startedAtIso}
      />
      <CustomMetricCell
        className={cx(styles.cell, styles.analysis)}
        status={status}
        metrics={metrics}
        titleClassName={styles.text}
        modelId={modelId}
        timeElapsed={elapsed || '0'}
        timeRemain={eta}
        timeEstimated={estimatedTime}
      />
    </Row>
  );
};
