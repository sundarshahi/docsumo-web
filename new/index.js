import React from 'react';

import { registerLicense } from '@syncfusion/ej2-base';
import { chameleonInit } from 'new/thirdParty/chameleon';
import { firebaseInit } from 'new/thirdParty/firebase';
//import SentryInit from 'new/thirdParty/sentry';
import { tagMangerInit } from 'new/thirdParty/googleTagManager';
import { HotjarIntegrationInit } from 'new/thirdParty/hotjar';
import { mixpanelInit } from 'new/thirdParty/mixpanel';
import { render } from 'react-dom';

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

render(<App />, document.getElementById('app'));
