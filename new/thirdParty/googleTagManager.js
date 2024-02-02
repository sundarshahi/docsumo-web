import TagManager from 'react-gtm-module';

const TAG_MANAGER_ARGS = {
  // gtmId: 'GTM-MFX6QH9',
  gtmId: 'GTM-579BKSL',
};

export function tagMangerInit() {
  // const { hostname } = global.window.location;

  // if (hostname === 'app.docsumo.com') {
  TagManager.initialize(TAG_MANAGER_ARGS);
  // }

  return;
}
