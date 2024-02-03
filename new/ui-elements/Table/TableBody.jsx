/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useContext } from 'react';

import cx from 'classnames';
import { ArrowRightCircle } from 'iconoir-react';
import { get } from 'lodash';

import Checkbox from '../Checkbox/Checkbox';

import { TableContext } from './tableContext';

import styles from './TableBody.scss';

const TableBody = ({ data, bodyClassNames, cellClassNames }) => {
  const {
    columnStructure,
    setColumnStructure,
    checkedRows = [],
    setCheckedRows,
    rowKey,
    setRowKey,
    showCheckbox,
    onRowClick,
    setRowClickableStatus = null,
    tableBodyCellProps = {},
  } = useContext(TableContext);

  const getRowKey = (dataItem) => {
    if (rowKey) {
      return rowKey;
    } else {
      return setRowKey(dataItem) || '';
    }
  };

  const getRowClickableStatus = (dataItem) => {
    let isClickable = false;

    if (setRowClickableStatus) {
      isClickable = setRowClickableStatus(dataItem);
    } else if (onRowClick) {
      isClickable = true;
    }

    return isClickable;
  };

  const renderCheckBox = (item) => {
    const checkboxKey = getRowKey(item);

    const checked = checkedRows.includes(item[checkboxKey]);

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        className={styles.checkbox}
        tabIndex={0}
        role='button'
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={checked}
          className={styles.checkbox}
          onChange={(e) => {
            setCheckedRows({ checked, value: item[checkboxKey] });
          }}
        />
      </div>
    );
  };

  const getCursorStyle = (itm, isRowClickable) => {
    if (!itm.onBodyCellClick) {
      return 'inherit';
    } else if (!isRowClickable) {
      return 'not-allowed';
    } else {
      return 'pointer';
    }
  };

  const tableBodyStyles = cx(styles.tableBody, bodyClassNames);
  return (
    <div className={tableBodyStyles}>
      {data.map((item, index) => {
        const isRowClickable = getRowClickableStatus(item);

        return (
          <div
            key={item[rowKey] || index}
            tabIndex={0}
            role='button'
            className={cx(styles.tableRow, {
              [styles.tableRow__clickable]: isRowClickable,
            })}
            onClick={
              onRowClick
                ? () =>
                    onRowClick({
                      item,
                    })
                : undefined
            }
          >
            {columnStructure.map((itm, idx) => {
              const tableCellClassNames = cx(
                styles.tableCell,
                itm.bodyCellClassNames,
                itm.className
              );
              return (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <div
                  tabIndex={0}
                  key={`${itm.key}`}
                  role='button'
                  className={tableCellClassNames}
                  style={{
                    flexBasis: itm.width,
                    minWidth: itm.minWidth,
                    cursor: getCursorStyle(itm, isRowClickable),
                  }}
                  onClick={
                    itm.onBodyCellClick
                      ? () =>
                          itm.onBodyCellClick({
                            item,
                            itm,
                            columnStructure,
                            setColumnStructure,
                          })
                      : undefined
                  }
                >
                  {showCheckbox && idx === 0 ? renderCheckBox(item) : null}

                  <div className={styles.tableCell_content}>
                    {itm.customBodyCell ? (
                      <itm.customBodyCell
                        cellData={item}
                        {...tableBodyCellProps}
                      />
                    ) : (
                      get(item, itm.key, itm.bodyCell)
                    )}
                    {itm.showHoverIcon && isRowClickable && (
                      <ArrowRightCircle
                        className={styles.clickableIcon}
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default TableBody;
