import { actionTypes as appActionTypes } from '@redux/app/actions';
import * as reduxHelper from 'client/redux/helpers';

import axios from 'axios';
import * as utils from 'client/utils';
import _ from 'lodash';
import queryString from 'query-string';

// eslint-disable-next-line compat/compat
const parsedUrl = new URL(window.location.href);
const tokenKey = parsedUrl.searchParams.get('token');
if (tokenKey) {
  sessionStorage.setItem('tempToken', tokenKey);
} else {
  sessionStorage.clear();
}
//todo- change back to previous

function getAuthToken() {
  return (
    sessionStorage.getItem('tempToken') ||
    reduxHelper.getValueFromPath('app.token') ||
    ''
  );
}

function updateAuthToken(token) {
  reduxHelper.dispatchAction({
    type: appActionTypes.SET_AUTH_TOKEN,
    payload: {
      token,
    },
  });
}

function setAuthTokenExpiredFlag() {
  reduxHelper.dispatchAction({
    type: appActionTypes.SET_AUTH_TOKEN_EXPIRED_FLAG_FROM_API_CLIENT,
  });
}

export function getCancelTokenSource() {
  return axios.CancelToken.source();
}

const GET = 'get';
const POST = 'post';
const POST_MULTIPART = 'postMultipart';
const POST_JSON = 'postJSON';
const PATCH = 'patch';
const PATCH_JSON = 'patchJSON';
const DELETE = 'delete';

const METHOD_MAPPING = {
  [GET]: 'get',
  [POST]: 'post',
  [POST_MULTIPART]: 'post',
  [POST_JSON]: 'post',
  [PATCH]: 'patch',
  [PATCH_JSON]: 'patch',
  [DELETE]: 'delete',
};

let cache = [];
const cancel = [];

function generateClientMethod(method) {
  return async function (options = {}) {
    const {
      url,
      queryParams,
      disableRefetch,
      disableCCase,
      payload,
      headers,
      ...otherOptions
    } = options;
    if (disableRefetch) {
      if (cache.indexOf(url) !== -1) {
        const controller = cancel.filter((i) => i.url === url);
        await controller.map((item) => item.c());
      } else {
        await cache.push(url);
      }
    }
    const axiosParams = {
      timeout: 30000, // Change later to 30000 for production
      url: queryParams
        ? url + `?${queryString.stringify(queryParams, { encode: false })}`
        : url,
      method: METHOD_MAPPING[method],
      headers: {
        token: getAuthToken(),
        ...headers,
      },
      ...otherOptions,
    };

    if ([GET, POST_JSON].includes(method) && disableRefetch) {
      axiosParams.cancelToken = new axios.CancelToken(async (c) => {
        await cancel.push({ url, c });
      });
    }

    if ([POST, POST_MULTIPART, PATCH].includes(method)) {
      if ([POST, PATCH].includes(method)) {
        axiosParams.headers['Content-Type'] =
          'application/x-www-form-urlencoded';
      }

      if (method === POST_MULTIPART) {
        axiosParams.headers['Content-Type'] = 'multipart/form-data';
      }

      if (payload) {
        axiosParams.data =
          payload instanceof FormData
            ? payload
            : utils.objectToFormData(payload);
      }
    }

    if ([POST_JSON, PATCH_JSON, DELETE].includes(method)) {
      axiosParams.headers['Content-Type'] = 'application/json';
      if (payload) {
        axiosParams.data = payload;
      }
    }

    return new Promise(function (resolve, reject) {
      axios(axiosParams)
        .then(({ data, status, statusText, headers }) => {
          const responsePayload = disableCCase ? data : utils.camelCase(data);

          const newToken = _.get(responsePayload, 'data.token');
          if (newToken) {
            updateAuthToken(newToken);
          }

          resolve({
            responsePayload,
            statusCode: status,
            statusText,
            headers,
            options,
          });
        })
        .catch((error) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const { data, status, statusText, headers } = error.response;

            const responsePayload =
              data && _.isObject(data) ? utils.camelCase(data) : null;

            if (status === 401) {
              // Token has expired
              setAuthTokenExpiredFlag();
            }

            reject({
              error,
              responsePayload,
              statusCode: status,
              statusText,
              headers,
              options,
              isCancel: axios.isCancel(error),
            });
          }

          if (error.request) {
            // The request was made but no response was received
            reject({
              error,
              options,
              isCancel: axios.isCancel(error),
            });
          }

          // Something happened in setting up the request that triggered an Error
          reject({
            error,
            options,
            isCancel: axios.isCancel(error),
          });
        });
    });
  };
}

const apiClient = {
  [GET]: generateClientMethod(GET),
  [POST]: generateClientMethod(POST),
  [POST_MULTIPART]: generateClientMethod(POST_MULTIPART),
  [POST_JSON]: generateClientMethod(POST_JSON),
  [PATCH]: generateClientMethod(PATCH),
  [PATCH_JSON]: generateClientMethod(PATCH_JSON),
  [DELETE]: generateClientMethod(DELETE),
  all: function (requestPromises = []) {
    return axios.all(requestPromises);
  },
};

export default apiClient;
