/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { memo } from 'react';
//import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error.svg';
import { connect } from 'react-redux';

import cx from 'classnames';
import { Plus, Trash } from 'iconoir-react';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip';
import OutsideClickHandler from 'react-outside-click-handler';

import Field from './Field';

import styles from './lineItemRow.scss';
const LineItemRow = memo(
  (props) => {
    const {
      docReadOnly,
      row,
      isSelected,
      onDeleteBtnClick,
      onReadOnlyLineFieldClick,
      onLineFieldInputFocus,
      onLineFieldInputValueChange,
      onLineFieldInputSubmit,
      sectionField,
      rowCount,
      column,
      alignItem,
      wrapItem,
      optionRow,
      handleOptionRow,
      outsideRowOptionClick,
      handleRowOptionAddLineBtnClick,
      lineItemRowIds,
      lineItemRowsById,
      adjustTableContentHeight,
      lastRowRef,
      adjustScrollOnTable,
      handleBboxViewer,
      bboxClickType,
    } = props;

    const {
      id,
      fieldIds,
      isDeleting: isDeletingRow,
      errorFieldIds,
      lowConfidenceFieldIds,
      gridId,
    } = row;

    const hasErrorField = errorFieldIds.length > 0 ? true : false;

    const hasLowConfidenceField =
      !hasErrorField && lowConfidenceFieldIds.length > 0 ? true : false;

    const handleDeleteClick = () => {
      onDeleteBtnClick({
        id,
        gridId,
      });
    };

    return (
      <div className={cx(styles.root, { [styles.isSelected]: isSelected })}>
        {hasErrorField || hasLowConfidenceField ? (
          <Tooltip
            label={
              hasErrorField
                ? 'There is an error in the row'
                : hasLowConfidenceField
                ? 'There is a low confidence cell in the row'
                : ''
            }
            colorScheme={
              hasErrorField ? 'error' : hasLowConfidenceField ? 'warning' : ''
            }
            placement='right'
          >
            <div
              className={cx(styles.rowCount, {
                [styles['rowCount--selected']]: isSelected,
                [styles['rowCount--warning']]: hasLowConfidenceField,
                [styles['rowCount--error']]: hasErrorField,
              })}
              style={{ height: wrapItem.wrapHeight }}
              onClick={() => {
                const { id } = row;
                handleOptionRow(id);
              }}
            >
              {rowCount}
            </div>
          </Tooltip>
        ) : (
          <div
            className={cx(styles.rowCount, {
              [styles['rowCount--selected']]: isSelected,
              [styles['rowCount--warning']]: hasLowConfidenceField,
              [styles['rowCount--error']]: hasErrorField,
            })}
            style={{ height: wrapItem.wrapHeight }}
            onClick={() => {
              const { id } = row;
              handleOptionRow(id);
            }}
          >
            {rowCount}
          </div>
        )}
        {optionRow && optionRow === row.id && !docReadOnly ? (
          <OutsideClickHandler onOutsideClick={outsideRowOptionClick}>
            <div className={styles.rowOptionRoot}>
              <div
                className={cx('unstyled-btn', styles.link)}
                onClick={() => {
                  const { fieldIds } = row;
                  let currentFieldId = fieldIds[0];
                  handleRowOptionAddLineBtnClick(currentFieldId);
                  outsideRowOptionClick();
                }}
              >
                <Plus className={styles.icon} />
                <p className={styles.label}>Insert 1 row above</p>
              </div>
              <div
                className={cx('unstyled-btn', styles.link)}
                onClick={() => {
                  let currentItem = lineItemRowIds.find(
                    (lineItemId) => lineItemId === row.id
                  );

                  let currentIndex = lineItemRowIds.indexOf(currentItem);
                  let nextIndex = currentIndex + 1;
                  let nextItem = lineItemRowIds[nextIndex];
                  if (nextItem) {
                    const { fieldIds } = lineItemRowsById[nextItem];
                    let currentFieldId = fieldIds[0];
                    handleRowOptionAddLineBtnClick(currentFieldId);
                  } else {
                    handleRowOptionAddLineBtnClick();
                  }
                  outsideRowOptionClick();
                }}
              >
                <Plus className={styles.icon} />
                <p className={styles.label}>Insert 1 row below</p>
              </div>
              <div
                className={cx('unstyled-btn', styles.link)}
                onClick={() => {
                  handleDeleteClick();
                  outsideRowOptionClick();
                }}
              >
                <Trash className={cx(styles.icon, styles['icon--error'])} />
                <p className={styles.label}>Delete row</p>
              </div>
            </div>
          </OutsideClickHandler>
        ) : null}
        {fieldIds.map((fieldId) => {
          return (
            <Field
              key={fieldId}
              fieldId={fieldId}
              column={column}
              rowId={id}
              isDeletingRow={false}
              sectionField={sectionField}
              disabled={docReadOnly || isDeletingRow}
              docReadOnly={docReadOnly}
              onReadOnlyFieldClick={onReadOnlyLineFieldClick}
              onFieldInputFocus={onLineFieldInputFocus}
              onFieldInputValueChange={onLineFieldInputValueChange}
              onFieldInputSubmit={onLineFieldInputSubmit}
              alignItem={alignItem}
              wrapItem={wrapItem}
              adjustTableContentHeight={adjustTableContentHeight}
              lastRowRef={lastRowRef}
              handleBboxViewer={handleBboxViewer}
              bboxClickType={bboxClickType}
            />
          );
        })}

        {!docReadOnly ? (
          <div className={styles.deleteCol}>
            <IconButton
              disabled={isDeletingRow}
              title='Delete'
              className={styles.deleteBtn}
              onClick={handleDeleteClick}
              colorScheme='danger'
              variant='outlined'
              size='extra-small'
              icon={
                isDeletingRow ? (
                  <LoaderIcon className={styles.loaderIcon} />
                ) : (
                  <Trash />
                )
              }
            />
          </div>
        ) : null}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Bail out update if same field
    return (
      prevProps.fieldsById === nextProps.fieldsById &&
      prevProps.column === nextProps.column &&
      prevProps.row === nextProps.row &&
      prevProps.alignItem === nextProps.alignItem &&
      prevProps.wrapItem === nextProps.wrapItem &&
      prevProps.optionRow === nextProps.optionRow &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);

function mapStateToProp(state) {
  const { fieldsById } = state.documents.reviewTool;

  return {
    fieldsById,
  };
}

export default WithTrackingContext(
  connect(
    mapStateToProp
    // mapDispatchToProps,
  )(LineItemRow)
);
