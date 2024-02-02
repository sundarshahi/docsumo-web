import React from 'react';

import Skeleton from 'new/ui-elements/Skeleton';

const ChatSkeleton = () => {
  return Array.from(new Array(2)).map((_, index) => (
    <div key={index}>
      <div className='d-flex p-4'>
        <Skeleton
          height='36px'
          width='36px'
          className='mr-2 flex-none visibility-hidden'
        />
        <div className='w-100 mb-2'>
          <Skeleton width='100%' height='60px' />
        </div>
        <Skeleton
          height='36px'
          width='36px'
          className='ml-2 border-radius-full bg-secondary-hover flex-none'
        />
      </div>

      <div className='d-flex bg-gray-200 p-4'>
        <Skeleton
          height='36px'
          width='36px'
          className='mr-2 border-radius-full bg-secondary-hover flex-none'
        />
        <div className='w-100 mb-2'>
          <Skeleton width='100%' height='60px' className='mb-2' />
          <Skeleton width='80%' height='40px' />
        </div>
        <Skeleton
          height='36px'
          width='36px'
          className='ml-2 border-radius-full bg-secondary-hover flex-none'
        />
      </div>
    </div>
  ));
};

export default ChatSkeleton;
