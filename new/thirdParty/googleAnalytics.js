import _ from 'lodash';

let PROPERTY_ID;
let ENABLE_LOGGING = false;

function isProductionWebsite() {
  return global.window.location.hostname === 'app.docsumo.com';
}

function isAvailable() {
  return typeof global.window.gtag !== 'undefined' && PROPERTY_ID;
}

function isLoggingEnabled() {
  return ENABLE_LOGGING;
}

export function init() {
  const isProdWebsite = isProductionWebsite();
  PROPERTY_ID = isProdWebsite ? 'UA-127999029-1' : 'UA-127999029-2';
  // ENABLE_LOGGING = !isProdWebsite;
  ENABLE_LOGGING = false;

  global.window.dataLayer = global.window.dataLayer || [];
  global.window.gtag = function gtag() {
    global.window.dataLayer.push(arguments);
  };
  global.window.gtag('js', new Date());
  global.window.gtag('config', PROPERTY_ID, { send_page_view: false });

  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    js.async = true;
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', `gtag-${PROPERTY_ID}`);
}

export function trackPageView({ title, path } = {}) {
  const loggingEnabled = isLoggingEnabled();
  const gaAvailable = isAvailable();

  const params = {
    page_path: path || global.window.location.pathname,
    page_title: title || global.window.document.title,
  };

  if (loggingEnabled) {
    /* eslint-disable no-console */
    // console.groupCollapsed(`GA page view`);
    console.group('GA page view');
    Object.keys(params).forEach((key) => {
      console.log(`${key}: ${params[key]}`);
    });
    console.groupEnd();
    /* eslint-enable no-console */
  }

  if (!gaAvailable) {
    return;
  }

  global.window.gtag('config', PROPERTY_ID, params);
}

export function trackEvent(action, { category, label, value } = {}) {
  const loggingEnabled = isLoggingEnabled();
  const gaAvailable = isAvailable();
  const properties = {};

  if (!action) {
    if (loggingEnabled) {
      /* eslint-disable-next-line no-console */
      console.warn('GA event action not provided');
    }
    return;
  }

  if (!_.isUndefined(category)) {
    properties['event_category'] = category;
  }

  if (!_.isUndefined(label)) {
    properties['event_label'] = label;
  }

  if (!_.isUndefined(value)) {
    if (_.isInteger(value) && value >= 0) {
      properties['value'] = value;
    } else {
      if (loggingEnabled) {
        /* eslint-disable-next-line no-console */
        console.warn('GA event value needs to be a non-negative integer');
      }
    }
  }

  if (loggingEnabled) {
    /* eslint-disable no-console */
    // console.groupCollapsed(`GA event: ${action}`);
    console.group('GA event');
    console.log(`action: ${action}`);
    Object.keys(properties).forEach((key) => {
      console.log(`${key}: ${properties[key]}`);
    });
    console.groupEnd();
    /* eslint-enable no-console */
  }

  if (!gaAvailable) {
    return;
  }

  global.window.gtag('event', action, properties);
}
