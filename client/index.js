import React from 'react';
import getStore from './redux/store';
import getNewStore from 'new/redux/store';

import { registerLicense } from '@syncfusion/ej2-base';
import { firebaseInit } from 'client/thirdParty/firebase';
import { mixpanelInit } from 'client/thirdParty/mixpanel';
import { chameleonInit } from 'new/thirdParty/chameleon';
import { render } from 'react-dom';

import { DesignProvider } from './components/contexts/design';
//import SentryInit from 'client/thirdParty/sentry';
import { tagMangerInit } from './thirdParty/googleTagManager';
import { HotjarIntegrationInit } from './thirdParty/hotjar';
import App from './App';

//Syncfusion license initialization
registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

// Initalizing Sentry Tracking Tool
//SentryInit();

mixpanelInit();

tagMangerInit();

// firebase initialization globally
firebaseInit();

// Initialize chameleon
chameleonInit();

// Hotjar Integrtion Plugin
HotjarIntegrationInit();

const store = getStore();
const newStore = getNewStore();

render(
  <DesignProvider>
    <App />
  </DesignProvider>,
  document.getElementById('app')
);

if (module.hot) {
  module.hot.accept('./redux/reducers', () => {
    const nextRootReducer = require('./redux/reducers').default;
    store.replaceReducer(nextRootReducer);
  });

  module.hot.accept('new/redux/reducers', () => {
    const nextRootReducer = require('new/redux/reducers').default;
    newStore.replaceReducer(nextRootReducer);
  });

  module.hot.accept();
}
