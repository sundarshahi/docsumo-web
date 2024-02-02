import React from 'react';

import Skeleton from 'new/ui-elements/Skeleton';

const SectionSkeleton = () => {
  return (
    <div>
      {[1, 2, 3].map((_, index) => {
        return (
          <React.Fragment key={String(index)}>
            {index > 0 && <div className='divider my-2' />}
            <div className='py-2 px-4 pr-8'>
              <Skeleton
                width='50%'
                height='24px'
                className='mb-3 border-radius-6'
              />
              <Skeleton
                width='100%'
                height='24px'
                className='mb-3 border-radius-6'
              />
              <Skeleton
                width='100%'
                height='24px'
                className='mb-3 border-radius-6'
              />
              <Skeleton
                width='100%'
                height='24px'
                className='border-radius-6'
              />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SectionSkeleton;
