import React, { Suspense } from 'react';
import { Router, Switch } from 'react-router-dom';

import history from 'new/history';
import NewAppRouter from 'new/NewAppRouter';
import FullPageLoader from 'new/ui-elements/PageLoader/PageLoader';

const App = () => {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Router history={history}>
        <Switch>
          <NewAppRouter />
        </Switch>
      </Router>
    </Suspense>
  );
};

export default App;
