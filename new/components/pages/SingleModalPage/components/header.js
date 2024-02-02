import React from 'react';

import cx from 'classnames';

import styles from './header.scss';

const ListHeader = ({ documentTypesColumnStructure }) => {
  return (
    <div className={styles.headerStyles}>
      {documentTypesColumnStructure().map((item) => {
        const headerCellClassNames = cx(
          styles.headerCell,
          item.headerCellClassNames
        );
        return (
          <div
            tabIndex={0}
            role='button'
            key={item.key}
            className={headerCellClassNames}
            style={{ minWidth: item.minWidth }}
          >
            {item.customHeaderCell ? (
              <item.customHeaderCell cellData={item} />
            ) : (
              item.headerCell || item.title
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ListHeader;
