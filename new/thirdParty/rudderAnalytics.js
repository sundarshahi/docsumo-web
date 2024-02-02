export const RUDDER_ANALYTICS_EVENTS = {
  userRegistered: 'user_registered',
};

export function rudderAnalyticsIdentifyUser(data) {
  const { hostname } = global.window.location;

  if (hostname !== 'app.docsumo.com') return;

  window.rudderanalytics.identify(
    window.rudderanalytics.getAnonymousId(),
    data
  );
}

export function rudderAnalyticsTrackEvent(event, data) {
  const { hostname } = global.window.location;

  if (hostname !== 'app.docsumo.com') return;

  window.rudderanalytics.track(event, data);
}
