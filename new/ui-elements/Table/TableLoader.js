import React, { useContext } from 'react';

import cx from 'classnames';
import Skeleton from 'new/ui-elements/Skeleton/Skeleton';

import { TableContext } from './tableContext';

import styles from './TableLoader.scss';

function TableLoader() {
  const { columnStructure } = useContext(TableContext);
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        {columnStructure.map((item, index) => (
          <div
            key={`col--${index}`}
            className={cx(styles.cell)}
            style={{ flexBasis: item.width, minWidth: item.minWidth }}
          >
            <Skeleton
              width='12.5rem'
              height='.625rem'
              className='ml-2 mr-8 mb-2 border-radius-5'
            />
          </div>
        ))}
      </div>
      <div className={styles.row}>
        {columnStructure.map((item, index) => (
          <div
            key={`col--${index}`}
            className={cx(styles.cell)}
            style={{ flexBasis: item.width, minWidth: item.minWidth }}
          >
            <Skeleton
              width='12.5rem'
              height='.625rem'
              className='ml-2 mr-8 mb-2 border-radius-5'
            />
          </div>
        ))}
      </div>
      <div className={styles.row}>
        {columnStructure.map((item, index) => (
          <div
            key={`col--${index}`}
            className={cx(styles.cell)}
            style={{ flexBasis: item.width, minWidth: item.minWidth }}
          >
            <Skeleton
              width='12.5rem'
              height='.625rem'
              className='ml-2 mr-8 mb-2 border-radius-5'
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableLoader;
