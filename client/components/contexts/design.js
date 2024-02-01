import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from 'react';

import * as api from 'client/api';
import { NEW } from 'client/constants'; //import OLD

const DesignContext = createContext();

const initialState = {
  design: null,
  user: null,
  config: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_DESIGN':
      return { ...state, design: action.design };

    case 'UPDATE_USER_CONFIG':
      return { ...state, user: action.user, config: action.config };

    case 'RESET_USER_CONFIG':
      return { ...state, user: null, config: null };

    default:
      return state;
  }
};

function DesignProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchUserandConfig = async () => {
      try {
        const [userResponse, configResponse] = await api.apiClient.all([
          api.getUser(),
          api.getConfig(),
        ]);

        const userData = userResponse?.responsePayload?.data?.user;
        const configData = configResponse?.responsePayload?.data;

        dispatch({
          type: 'UPDATE_USER_CONFIG',
          user: userData,
          config: configData,
        });
        changeDesign(configData?.uiMode || NEW); //Opens new ui by default, change to OLD to open old by default
      } catch (err) {
        dispatch({ type: 'RESET_USER_CONFIG' });
        dispatch({ type: 'UPDATE_DESIGN', design: NEW }); //Opens new ui by default, change to OLD to open old by default
      }
    };

    fetchUserandConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeDesign = useCallback((selectedDesign) => {
    dispatch({ type: 'UPDATE_DESIGN', design: selectedDesign });
  }, []);

  const updateUserAndConfig = useCallback(({ user, config }) => {
    dispatch({ type: 'UPDATE_USER_CONFIG', user: user, config: config });
  }, []);

  return (
    <DesignContext.Provider
      value={{
        design: state.design,
        contextConfig: state.config,
        contextUser: state.user,
        changeDesign,
        updateUserAndConfig,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
}

export function WithDesignContext(Component) {
  return function (props) {
    return (
      <DesignContext.Consumer>
        {(context) => {
          if (context === undefined) {
            throw new Error(
              'DesginContext must be used within a DesignProvider'
            );
          }
          return <Component {...props} {...context} />;
        }}
      </DesignContext.Consumer>
    );
  };
}

function useDesignContext() {
  const context = React.useContext(DesignContext);

  if (context === undefined) {
    throw new Error('useDesignContext must be used within a DesignProvider');
  }
  return context;
}

export { DesignProvider, useDesignContext };
