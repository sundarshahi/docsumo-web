import React, { useEffect, useRef } from 'react';

import { isEmpty } from 'lodash';

import Spinner from '../Spinner/Spinner';

const InfiniteScroll = ({
  fetchData = null,
  children,
  isLoading,
  error = {},
  ref = null,
}) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchData();
        }
      },
      {
        threshold: 0,
        root: ref?.current || null,
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, ref]);

  return (
    <>
      {children}

      {!isEmpty(error) ? <p>Error: {error.message}</p> : ''}
      {isLoading ? (
        <div className={'w-100 d-flex justify-content-center my-4'}>
          <Spinner />
        </div>
      ) : (
        ''
      )}
      <div ref={observerTarget} style={{ height: '10px' }}></div>
    </>
  );
};

export default InfiniteScroll;
