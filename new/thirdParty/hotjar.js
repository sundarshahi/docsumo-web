import Hotjar from '@hotjar/browser';

const { HOTJAR_SITE_ID_TESTING, HOTJAR_SITE_ID_PRODUCTION } = process.env;

const HOTJAR_INTEGRATION = {
  EMAIL: 'email',
  NAME: 'name',
  PROD: 'app.docsumo.com',
  ORG: 'orgId',
  ACCOUNT: 'accountType',
};

const HotjarIntegrationInit = () => {
  const { hostname } = global.window.location;
  const siteId =
    hostname === HOTJAR_INTEGRATION.PROD
      ? HOTJAR_SITE_ID_PRODUCTION
      : HOTJAR_SITE_ID_TESTING;

  const hotjarVersion = 6;
  Hotjar.init(siteId, hotjarVersion);
};

const HotjarIdentifyUser = (user, config) => {
  Hotjar.identify(user?.userId, {
    [HOTJAR_INTEGRATION.NAME]: user?.fullName,
    [HOTJAR_INTEGRATION.EMAIL]: user?.email,
    [HOTJAR_INTEGRATION.ORG]: user?.orgId,
    [HOTJAR_INTEGRATION.ACCOUNT]: config?.accountType,
  });
};

export { HotjarIdentifyUser, HotjarIntegrationInit };
