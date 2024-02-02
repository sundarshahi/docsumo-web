import React from 'react';

import cx from 'classnames';
import Skeleton from 'new/ui-elements/Skeleton/Skeleton';

import styles from './SkeletonLoader.scss';

const SkeletonLoader = () => {
  return (
    <div className={styles.container}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div className={styles.card} key={item}>
          <div
            className={cx(
              styles.card__header,
              'd-flex',
              'justify-content-space-between'
            )}
          >
            <div className={styles['card__header--title']}>
              <Skeleton width='15.625rem' className='border-radius-6' />
            </div>
            <div className={styles['card__header--actions']}>
              <Skeleton width='1.25rem' className='border-radius-6 mr-2' />
              <Skeleton width='1.25rem' className='border-radius-6 mr-2' />
              <Skeleton width='1.25rem' className='border-radius-6' />
            </div>
          </div>
          <div className={styles.card__separator}></div>
          <div className={styles.card__content}>
            <Skeleton
              height='1.25rem'
              width='6.25rem'
              className='border-radius-6'
            />
            <Skeleton
              height='1.25rem'
              width='9.375rem'
              className='border-radius-6 mt-3'
            />
            <Skeleton
              height='1.25rem'
              width='6.25rem'
              className='border-radius-6 mt-3'
            />
          </div>
          <div className={cx(styles.card__footer, 'd-flex')}>
            <Skeleton
              width='7.75rem'
              height='2.25rem'
              className='border-radius-6 mr-3'
            />
            <Skeleton
              width='7.75rem'
              height='2.25rem'
              className='border-radius-6 mr-3'
            />
            <Skeleton
              width='7.75rem'
              height='2.25rem'
              className='border-radius-6 mr-2'
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
