import React from 'react';

import Skeleton from 'new/ui-elements/Skeleton/Skeleton';

import styles from './SkeletonLoader.scss';

const SkeletonLoader = () => {
  return (
    <>
      {Array.from(new Array(2)).map((_, index) => {
        return (
          <div key={index} className={styles.skeletonRow}>
            <div className={styles.skeletonRow__col}>
              <Skeleton
                width='25%'
                height='.625rem'
                className='border-radius-5 mb-2'
              />
              <Skeleton
                width='45%'
                height='.625rem'
                className='border-radius-5'
              />
            </div>
            <div className={styles.skeletonRow__col}>
              <Skeleton
                width='100%'
                height='.625rem'
                className='border-radius-5'
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default SkeletonLoader;
