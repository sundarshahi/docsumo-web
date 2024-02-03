import _ from 'lodash';

import { actionTypes } from './actions';

function getInitialState() {
  return {};
}

export default function reducer(state = getInitialState(), { type, payload }) {
  const matches =
    /(.*)_(FETCH_FULFILLED|FETCH_REJECTED|FETCH_CANCEL|FETCH)/.exec(type);
  if (matches) {
    const [, requestName, requestState] = matches;

    const isFetching = requestState === 'FETCH';
    const request = {
      isFetching,
      ...(isFetching && _.get(payload, 'showLoader')
        ? { showLoader: true }
        : null),
    };

    return {
      ...state,
      [requestName]: request,
    };
  }

  /* eslint-disable indent */
  switch (type) {
    case actionTypes.ADD_REQUEST: {
      const { name, isFetching = true, showLoader = true } = payload;
      return {
        ...state,
        [name]: {
          isFetching,
          showLoader,
        },
      };
    }

    case actionTypes.UPDATE_REQUEST: {
      const { name, isFetching, showLoader } = payload;

      if (!_.has(state, name)) {
        return state;
      }

      const request = {
        ...state[name],
      };

      if (!_.isUndefined(isFetching)) {
        request.isFetching = isFetching;
      }

      if (!_.isUndefined(showLoader)) {
        request.showLoader = showLoader;
      }

      return {
        ...state,
        [name]: request,
      };
    }

    case actionTypes.REMOVE_REQUEST: {
      const { name } = payload;

      if (!_.has(state, name)) {
        return state;
      }

      return _.omit(state, [name]);
    }

    default: {
      return state;
    }
  }
  /* eslint-enable indent */
}
