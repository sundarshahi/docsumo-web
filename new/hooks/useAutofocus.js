import React, { useEffect, useRef } from 'react';

export const useAutofocus = () => {
  const inputRef = useRef(null);

  useEffect(() => {
    let focusTimeout;
    if (inputRef?.current) {
      focusTimeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }

    return () => {
      clearTimeout(focusTimeout);
    };
  }, []);

  return inputRef;
};
