import React from 'react';

import Skeleton from 'new/ui-elements/Skeleton/Skeleton';

const FilterSkeleton = () => {
  return (
    <div>
      {Array.from(new Array(2)).map((_, index) => {
        return (
          <div key={index} className='d-flex justify-content-between mb-6'>
            <Skeleton width='30%' className='mr-4 border-radius-4' />
            <Skeleton width='60%' height='35px' className='border-radius-4' />
          </div>
        );
      })}
      {Array.from(new Array(2)).map((_, index) => {
        return (
          <div key={index} className='d-flex justify-content-between mb-8 pl-4'>
            <Skeleton width='30%' className='mr-4 border-radius-6' />
            <Skeleton width='62%' height='35px ' className='border-radius-4' />
          </div>
        );
      })}
      <Skeleton width='20%' className='mb-2' />
      {Array.from(new Array(2)).map((_, index) => {
        return (
          <div key={index} className='d-flex justify-content-between mb-6 pl-4'>
            <Skeleton width='40%' className='mr-4 border-radius-4' />
            <Skeleton width='10%' height='25px' className='border-radius-12' />
          </div>
        );
      })}
    </div>
  );
};

export default FilterSkeleton;
