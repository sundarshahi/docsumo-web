import React from 'react';

import cx from 'classnames';
import Skeleton from 'new/ui-elements/Skeleton/Skeleton';
import * as storage from 'new/utils/storage';

import styles from './SpreadsheetSkeleton.scss';

function SpreadsheetSkeleton() {
  const summaryBoxInitialWidth =
    JSON.parse(storage.get('summaryBarDraggedWidth')) || '30rem';

  return (
    <div className={styles.waitRoot}>
      <div className={styles.waitRoot_body}>
        <div
          className={styles.waitRoot_summary}
          style={{ width: summaryBoxInitialWidth }}
        >
          <div className={styles.waitRoot_header}>
            <Skeleton
              width='1.5rem'
              height='1.5rem'
              className='mr-4 border-radius-6'
            />
            <Skeleton
              width='100%'
              height='1.5rem'
              className='border-radius-6'
            />
          </div>
          <div className={styles.waitRoot_summaryContent}>
            <div className={styles.cardsContainer}>
              {[...new Array(8)].map((_, idx) => (
                <div key={idx} className={styles.card}>
                  <Skeleton
                    key={idx}
                    width='100%'
                    height='2.5rem'
                    className='border-radius-6'
                  />
                </div>
              ))}
            </div>
            <div className={styles.tableContainer}>
              {[1, 2].map((item) => (
                <table key={item} className={styles.table}>
                  <thead>
                    <tr>
                      <td colSpan={7}></td>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((item) => (
                      <tr key={item}>
                        {[...new Array(7)].map((_, idx) => {
                          return (
                            <td key={idx}>
                              <Skeleton
                                key={idx}
                                width='100%'
                                height='1.25rem'
                                className='border-radius-6'
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
          </div>
          <div className={styles.waitRoot_summaryFooter}>
            <div className={styles['waitRoot_summaryFooter--firstRow']}>
              <Skeleton
                width='10rem'
                height='1.5rem'
                className='border-radius-6 ml-8'
              />
              {[1, 2, 3, 4].map((_, idx) => (
                <>
                  <Skeleton
                    key={idx}
                    width='6rem'
                    height='1.5rem'
                    className='border-radius-6 mb-8 ml-8'
                  />
                </>
              ))}
            </div>
            <div className={styles['waitRoot_summaryFooter--secondRow']}>
              <Skeleton
                width='10rem'
                height='1.5rem'
                className='border-radius-6 ml-8'
              />
            </div>
          </div>
        </div>
        <div
          className={styles.waitRoot_spreadsheet}
          style={{ width: `calc(100% - ${summaryBoxInitialWidth}px)` }}
        >
          <div className={styles.waitRoot_spreadsheetHeader}></div>
          <div className={styles.waitRoot_spreadsheetToolbar}>
            {[...new Array(13)].map((_, idx) => {
              return (
                <Skeleton
                  key={idx}
                  width='2.8125rem'
                  height='1.375rem'
                  className={cx('border-radius-6', 'mr-4', styles.toolItem)}
                />
              );
            })}
          </div>
          <div className={styles.waitRoot_spreadsheetFormula}>
            <div className={styles.cellNumber}>
              <Skeleton
                width='4.5rem'
                height='1.375rem'
                className='border-radius-6 mr-2 ml-2 mt-2 mb-2'
              />
            </div>
            <div className={styles.formulaArea}>
              <Skeleton
                width='80%'
                height='1.375rem'
                className='border-radius-6 mr-2 ml-2 mt-2 mb-2'
              />
            </div>
          </div>
          <div className={styles.waitRoot_spreadsheetContent}>
            <div className={styles.waitRoot_spreadsheetContentLeft}>
              <div key={0} className={styles.number}></div>
              {[...new Array(55)].map((_, idx) => {
                return (
                  <div key={idx + 1} className={styles.number}>
                    {idx + 1}
                  </div>
                );
              })}
            </div>
            <div className={styles.waitRoot_spreadsheetContentRight}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {[...new Array(12)]
                      .map((_, idx) => String.fromCharCode(65 + idx))
                      .map((item) => {
                        return <th key={item}>{item}</th>;
                      })}
                  </tr>
                </thead>
                <tbody>
                  {[...new Array(55)].map((_, idx) => (
                    <tr key={idx}>
                      {[...new Array(12)].map((_, idx) => {
                        return (
                          <td key={idx}>
                            <Skeleton
                              key={idx}
                              width='80%'
                              height='80%'
                              className={cx(
                                'border-radius-3',
                                'ml-1',
                                styles.item
                              )}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.waitRoot_spreadsheetFooter}></div>
        </div>
      </div>
    </div>
  );
}

export default SpreadsheetSkeleton;
