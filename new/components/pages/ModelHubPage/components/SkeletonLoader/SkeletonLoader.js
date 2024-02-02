import React from 'react';

import Skeleton from 'new/ui-elements/Skeleton/Skeleton';

import styles from './SkeletonLoader.scss';

const SkeletonLoader = () => (
  <>
    <div className={styles.topRow}>
      <div className={styles.topRow__col}>
        <Skeleton
          width='25%'
          height='30px'
          className='mb-3 mt-1 border-radius-6'
        />
        <Skeleton
          width='28%'
          height='10px'
          className='mb-3 mt-1 border-radius-6'
        />
        <Skeleton
          width='34%'
          height='28px'
          className='mb-4 mt-1 border-radius-6'
        />
        <div className={styles.topRow__badgeCollection}>
          {Array.from(new Array(6)).map((_, index) => {
            return (
              <div key={index} className={styles.topRow__badge}>
                <Skeleton
                  width='100%'
                  height='20px'
                  className='border-radius-6'
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
    <div className='ml-6 mt-8'>
      <Skeleton width='15%' height='20px' className='border-radius-6' />
    </div>
    <div className={styles.bottomRow}>
      {Array.from(new Array(6)).map((_, index) => {
        return (
          <div key={index} className={styles.bottomRow__card}>
            <div className={styles.bottomRow__cardtitle}>
              <Skeleton
                width='30px'
                height='30px'
                className={'mb-1 mr-3 border-radius-half'}
              />
              <Skeleton width='25%' height='25px' className='border-radius-5' />
            </div>
            <Skeleton width='95%' height='40px' className='border-radius-5' />
            <Skeleton
              width='15%'
              height='20px'
              className={'border-radius-5 d-flex align-self-end'}
            />
          </div>
        );
      })}
      ;
    </div>
  </>
);

export default SkeletonLoader;
