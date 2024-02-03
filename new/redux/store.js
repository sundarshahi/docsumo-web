import { applyMiddleware, compose, createStore } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import reduxPromise from 'redux-promise';

import logics from './logics';
import { oldReducers } from './reducers';

let store;

export default function getStore(preloadedState = null) {
  if (store) return store;

  const composeEnhancer =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const logicMiddleware = createLogicMiddleware(logics, {});

  if (preloadedState) {
    store = createStore(
      oldReducers,
      preloadedState,
      composeEnhancer(applyMiddleware(reduxPromise, logicMiddleware))
    );
  } else {
    store = createStore(
      oldReducers,
      composeEnhancer(applyMiddleware(reduxPromise, logicMiddleware))
    );
  }

  return store;
}
