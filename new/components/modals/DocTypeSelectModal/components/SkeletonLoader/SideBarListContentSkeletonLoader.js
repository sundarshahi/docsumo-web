import React from 'react';

import Skeleton from 'new/ui-elements/Skeleton/Skeleton';

import styles from './SideBarListContentSkeletonLoader.scss';
//TODO add array so that there is no any redundant data
const SkeletonLoader = () => (
  <>
    {Array.from(new Array(2)).map((_, index) => {
      return (
        <div className={styles.card} key={index}>
          <Skeleton width='25%' height='.625rem' className='border-radius-5' />
          <div className={styles.cardRow}>
            <div className={styles.cardCol}>
              <Skeleton
                width='70%'
                height='.625rem'
                className='border-radius-5 mb-2'
              />
              <Skeleton
                width='70%'
                height='.625rem'
                className='border-radius-5'
              />
            </div>
          </div>
        </div>
      );
    })}
  </>
);
export default SkeletonLoader;
