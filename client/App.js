import React, { Suspense } from 'react';
import { Route, Router, Switch } from 'react-router-dom';

import NewAppRouter from 'new/NewAppRouter';
import FullPageLoader from 'new/ui-elements/PageLoader/PageLoader';

import { useDesignContext } from './components/contexts/design';
import AppRouter from './AppRouter';
import { NEW, OLD } from './constants';
import history from './history';

// const NewAppRouter = lazyWithRetry(() =>
//   import(/* webpackChunkName: "new" */ '/new/NewAppRouter')
// );

// const AppRouter = lazyWithRetry(() =>
//   import(/* webpackChunkName: "old" */ './AppRouter')
// );

const App = () => {
  const { design } = useDesignContext();

  return (
    <Suspense fallback={<FullPageLoader />}>
      <Router history={history}>
        <Switch>
          <Route
            path='/'
            render={() =>
              design === NEW ? (
                <NewAppRouter history={history} />
              ) : design === OLD ? (
                <AppRouter history={history} />
              ) : (
                <FullPageLoader />
              )
            }
          />
        </Switch>
      </Router>
    </Suspense>
  );
};

export default App;
