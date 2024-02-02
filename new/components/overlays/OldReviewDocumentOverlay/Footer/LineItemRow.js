/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { memo } from 'react';
//import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error.svg';
import { connect } from 'react-redux';

import cx from 'classnames';
import { Plus, Trash, WarningTriangle } from 'iconoir-react';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
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
      isCollapsed,
      rowCount,
      column,
      alignItem,
      wrapItem,
      //lineItemRowsById,
      optionRow,
      handleOptionRow,
      outsideRowOptionClick,
      handleRowOptionAddLineBtnClick,
      lineItemRows,
      fieldsById,
      adjustTableContentHeight,
      lastRowRef,
      adjustScrollOnTable,
    } = props;
    // const {
    //     fieldsById,
    // } = props;
    const { id, fieldIds, isDeletingRow } = row;
    let showErrorIcon = false;
    //console.log('row', row);
    //console.log('sectionField', sectionField);
    let field = fieldIds.map((fieldId) => fieldsById[fieldId]);
    for (let i = 0; i < field.length; i++) {
      if (field[i] && field[i].content && !field[i].content.isValidFormat) {
        showErrorIcon = true;
        break;
      } else {
        showErrorIcon = false;
      }
    }
    const fieldsDisabled = docReadOnly || isDeletingRow;
    const isDeleteAllowed = !isDeletingRow;

    const handleDeleteClick = () => {
      onDeleteBtnClick({
        id,
        fieldIds,
      });
    };

    return (
      <div className={cx(styles.root, { [styles.isSelected]: isSelected })}>
        <div
          className={cx(styles.rowCount, {
            [styles.rowCountSelected]: isSelected,
          })}
          onClick={() => {
            const { id } = row;
            //console.log('lineItemRowsById', lineItemRowsById);
            handleOptionRow(id);
            // onLineFieldInputFocus({
            //     rowId: id,
            //     fieldId: currentFieldId,
            // });
          }}
        >
          {rowCount}

          {showErrorIcon ? (
            <Tooltip
              label='There is error in the row'
              colorScheme='error'
              placement='right'
              hasArrow={false}
            >
              <WarningTriangle
                className={cx(styles.icon, styles['icon--error'])}
              />
            </Tooltip>
          ) : (
            <p className={styles.errorIcon}></p>
          )}
        </div>
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
                  let currentItem = lineItemRows.find((l) => l.id === row.id);

                  let currentIndex = lineItemRows.indexOf(currentItem);
                  let nextIndex = currentIndex + 1;
                  let nextItem = lineItemRows[nextIndex];
                  if (nextItem) {
                    const { fieldIds } = nextItem;
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
              isDeletingRow={isDeletingRow}
              sectionField={sectionField}
              disabled={fieldsDisabled}
              docReadOnly={docReadOnly}
              onReadOnlyFieldClick={onReadOnlyLineFieldClick}
              onFieldInputFocus={onLineFieldInputFocus}
              onFieldInputValueChange={onLineFieldInputValueChange}
              onFieldInputSubmit={onLineFieldInputSubmit}
              isCollapsed={isCollapsed}
              alignItem={alignItem}
              wrapItem={wrapItem}
              adjustTableContentHeight={adjustTableContentHeight}
              lastRowRef={lastRowRef}
              adjustScrollOnTable={adjustScrollOnTable}
            />
          );
        })}

        {!docReadOnly ? (
          <div className={styles.deleteCol}>
            <IconButton
              disabled={!isDeleteAllowed}
              title='Delete'
              className={styles.deleteBtn}
              onClick={handleDeleteClick}
              colorScheme='danger'
              variant='outlined'
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
      prevProps.deleted === nextProps.deleted &&
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
