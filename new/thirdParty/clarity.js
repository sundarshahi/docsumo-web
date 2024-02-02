export const CLARITY_CUSTOM_KEYS = {
  userId: 'User ID',
  orgId: 'Org ID',
  docType: 'APIs enabled',
  company: 'Company',
  planType: 'Plan type',
};

export function clarityCustomIdentifyUser(userId) {
  const { hostname } = global.window.location;

  if (hostname !== 'app.docsumo.com') return;

  window.clarity('identify', userId);
}

export function clarityAddCustomTags(tag, value) {
  const { hostname } = global.window.location;

  if (hostname !== 'app.docsumo.com') return;

  window.clarity('set', tag, value);
}
