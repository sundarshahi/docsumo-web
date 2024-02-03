import { getStore } from 'new/redux/helpers';

import { get } from 'lodash';
import mixpanel from 'mixpanel-browser';

const store = getStore();

export const customMixpanelTracking = (
  eventName,
  { email = '', ...allParams }
) =>
  mixpanel.track(eventName, {
    'work email': email,
    version: 'new',
    ...allParams,
  });

export const mixpanelTrackingAllEvents = (
  evt,
  { docType: docTypeFromArgs = '', origin = '', ...allParams } = {}
) => {
  const state = store.getState();
  const {
    app: {
      config: { accountType = '', canSwitchToOldMode = true } = {},
      user: { email = '', role = '', companyName = '' } = {},
    },
    documents: { documentsById = {}, reviewTool: { docId = '' } = {} },
  } = state || {};

  const searchParams = new URLSearchParams(location?.search);

  const { type: docTypeFromDocId = '' } = documentsById[docId] || {};

  const docType =
    get(location, 'state.docType') ||
    searchParams?.get('docType') ||
    docTypeFromArgs ||
    docTypeFromDocId;

  customMixpanelTracking(evt, {
    plan: accountType,
    canSwitchUIVersion: canSwitchToOldMode,
    role,
    'doc type': docType,
    email,
    origin: origin,
    companyName,
    ...allParams,
  });
};
