import React from 'react';

import Skeleton from 'new/ui-elements/Skeleton/Skeleton';

import styles from './SkeletonLoader.scss';

const SkeletonLoader = () => (
  <>
    <div>
      {Array.from(new Array(2)).map((_, index) => {
        return (
          <div key={index} className={styles.topRow}>
            <Skeleton
              width='100px'
              height='.625rem'
              className='ml-4 mr-8 mb-2 border-radius-5'
            />
            <div className={styles.topRow__col}>
              <Skeleton
                width='25%'
                height='.625rem'
                className='mb-2 border-radius-5'
              />
              <Skeleton
                width='75%'
                height='.625rem'
                className='border-radius-5'
              />
            </div>
            {Array.from(new Array(2)).map((_, index) => {
              return (
                <div key={index} className={styles.topRow__col}>
                  <Skeleton
                    width='50%'
                    height='.625rem'
                    className='border-radius-5'
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
    <div className='ml-4 mt-8'>
      <Skeleton width='20%' height='20px' className='border-radius-5' />
    </div>
    <div className='mt-4'>
      {Array.from(new Array(3)).map((_, index) => {
        return (
          <div key={index} className={styles.bottomRow}>
            <div className={styles.bottomRow__col}>
              <Skeleton
                width='25%'
                height='.625rem'
                className='mb-2 border-radius-5'
              />
              <Skeleton
                width='75%'
                height='.625rem'
                className='border-radius-5'
              />
            </div>
            <div key={index} className={styles.bottomRow__col}>
              <Skeleton
                width='100%'
                height='.625rem'
                className='border-radius-5'
              />
            </div>
          </div>
        );
      })}
    </div>
  </>
);

export default SkeletonLoader;
