import React, { useContext } from 'react';

import cx from 'classnames';

import { TableContext } from './tableContext';

import styles from './TableHeader.scss';

const TableHeader = ({ headerClassNames }) => {
  const { columnStructure, setColumnStructure, tableHeaderCellProps } =
    useContext(TableContext);

  const headerStyles = cx(styles.headerContainer, headerClassNames);
  return (
    <div className={headerStyles}>
      {columnStructure.map((item) => {
        const headerCellClassNames = cx(
          styles.headerCell,
          item.headerCellClassNames
        );
        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <div
            tabIndex={0}
            role='button'
            key={item.key}
            className={headerCellClassNames}
            onClick={() =>
              item.onHeaderCellClick
                ? item.onHeaderCellClick({
                    item,
                    columnStructure,
                    setColumnStructure,
                  })
                : undefined
            }
            style={{ flexBasis: item.width, minWidth: item.minWidth }}
          >
            {item.customHeaderCell ? (
              <item.customHeaderCell
                cellData={item}
                {...tableHeaderCellProps}
              />
            ) : (
              item.headerCell || item.title
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TableHeader;
