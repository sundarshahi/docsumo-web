import _ from 'lodash';

const SDK_BUNDLE_URL = 'https://cdn.pubnub.com/sdk/javascript/pubnub.7.1.2.js';

let PUBNUB;
let SDK_LOADED = false;

export function preloadSdk() {
  const res = document.createElement('link');
  res.rel = 'preload';
  res.as = 'script';
  res.href = SDK_BUNDLE_URL;
  global.document.head.appendChild(res);
}

export function prefetchSdk() {
  const res = document.createElement('link');
  res.rel = 'prefetch';
  res.as = 'script';
  res.href = SDK_BUNDLE_URL;
  global.document.head.appendChild(res);
}

export function loadSdk({ onLoad = null, onError = null } = {}) {
  if (SDK_LOADED) {
    // Already loaded
    return;
  }

  const s = document.createElement('script');
  s.async = true;
  s.src = SDK_BUNDLE_URL;
  s.charset = 'UTF-8';
  s.onload = () => {
    SDK_LOADED = true;

    if (onLoad && typeof onLoad === 'function') {
      onLoad();
    }
  };
  s.onerror = () => {
    if (onError && typeof onError === 'function') {
      onError();
    }
  };
  s.setAttribute('crossorigin', '*');
  global.document.head.appendChild(s);
}

export function isSdkLoaded() {
  return SDK_LOADED;
}

export function init({
  authKey = null,
  subscribeKey = null,
  userId = null,
} = {}) {
  if (!isSdkLoaded()) {
    throw new Error('PubNub SDK not loaded');
  }

  if (isInitialized()) {
    // Already initialized
    return;
  }

  PUBNUB = new global.PubNub({
    authKey: authKey,
    subscribeKey: subscribeKey,
    ssl: true,
    uuid: userId,
    restore: true,
    logVerbosity: true,
  });
}

export function isInitialized() {
  return PUBNUB ? true : false;
}

function throwErrorIfNotInitialized() {
  if (!isInitialized()) {
    throw new Error('PubNub not initialized');
  }
}

export function setAuthKey({ authKey, reconnect = false }) {
  throwErrorIfNotInitialized();

  PUBNUB.setAuthKey(authKey);
  if (reconnect) {
    PUBNUB.reconnect();
  }
}

export function pubnubReconnect() {
  throwErrorIfNotInitialized();

  PUBNUB.reconnect();
}

export function stop() {
  if (!isInitialized()) return;

  PUBNUB.stop();
}

export function addListener(listener) {
  throwErrorIfNotInitialized();

  if (!listener || _.isEmpty(listener)) {
    throw new Error('No valid listener provided');
  }

  PUBNUB.addListener(listener);
}

export function removeListener(listener) {
  throwErrorIfNotInitialized();

  if (!listener || _.isEmpty(listener)) {
    throw new Error('No valid listener provided');
  }

  PUBNUB.removeListener(listener);
}

export function subscribeChannel(channel) {
  throwErrorIfNotInitialized();

  PUBNUB.subscribe({
    channels: _.isArray(channel) ? channel : [channel],
  });
}

export function unsubscribeChannel(channel) {
  throwErrorIfNotInitialized();

  PUBNUB.unsubscribe({
    channels: _.isArray(channel) ? channel : [channel],
  });
}
