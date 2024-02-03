import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

export const validateLogin = async ({ type, email, password, idToken }) => {
  const mixpanelProperties = {
    'work email': email,
    type: type,
    step: 'validate',
  };

  let payload = {};
  if (type === 'email') {
    payload = {
      email,
      password,
    };
  } else {
    payload = {
      email,
      id_token: idToken,
    };
  }

  try {
    const response = await api.validateLogin({
      type,
      payload,
    });
    return response;
  } catch (e) {
    const error =
      _.get(e.responsePayload, 'message') || 'Failed to validate login';

    mixpanel.track(MIXPANEL_EVENTS.login_failed, {
      ...mixpanelProperties,
      error,
    });
    return e;
  }
};
