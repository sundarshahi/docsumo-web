import React from 'react';

import Skeleton from 'new/ui-elements/Skeleton/Skeleton';

import styles from './SideBarSkeletonLoader.scss';

const SkeletonLoader = () => (
  <div className={styles.cardContainer}>
    {Array.from(new Array(3)).map((_, index) => {
      return (
        <div className={styles.card} key={index}>
          <div className={styles.cardRow}>
            <div className={styles.cardCol}>
              <Skeleton
                width='100%'
                height='.625rem'
                className='border-radius-5 mb-4'
              />
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
export default SkeletonLoader;
