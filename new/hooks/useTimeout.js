import { useEffect, useRef } from 'react';

export const useTimeout = (callback, duration) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.=
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Don't schedule if no delay is specified
    if (duration === null) return;

    const id = setTimeout(() => savedCallback.current(), duration);

    return () => clearTimeout(id);
  }, [duration]);
};
