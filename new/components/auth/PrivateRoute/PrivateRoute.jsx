import React from 'react';
import { useSelector } from 'react-redux';
import { Route } from 'react-router-dom';

import Shell from 'new/components/layout/Shell';
import TabActivityNavbar from 'new/components/layout/TabActivityNavbar';
import TabNavbar from 'new/components/layout/TabNavbar';
import Error404Page from 'new/components/pages/error/Error404Page';

import { restrictedRoutesRegex } from './restrictedRoutes';

const PrivateRoute = ({
  component: Component,
  tabNav,
  tabActivityNav,
  withoutShell,
  ...rest
}) => {
  const user = useSelector((state) => state.app?.user);

  const routesRegex = user && user.role ? restrictedRoutesRegex[user.role] : [];

  const isRouteRestricted = !!routesRegex.find((routeRegex) =>
    routeRegex.test(rest.location.pathname)
  );

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isRouteRestricted) {
          return (
            <Shell>
              <Error404Page {...props} />
            </Shell>
          );
        }

        if (tabNav)
          return (
            <Shell>
              <TabNavbar>
                <Component {...props} />
              </TabNavbar>
            </Shell>
          );

        if (tabActivityNav)
          return (
            <Shell>
              <TabActivityNavbar>
                <Component {...props} />
              </TabActivityNavbar>
            </Shell>
          );

        if (withoutShell) return <Component {...props} />;

        return (
          <Shell>
            <Component {...props} />
          </Shell>
        );
      }}
    />
  );
};

export default PrivateRoute;
