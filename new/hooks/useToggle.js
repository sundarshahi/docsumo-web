import { useCallback, useState } from 'react';

export const useToggle = (initialState = false) => {
  const [state, setState] = useState(initialState);

  const toggle = useCallback((updatedState) => {
    if (updatedState) {
      setState(updatedState);
    } else {
      setState((state) => !state);
    }
  }, []);

  return [state, toggle];
};
