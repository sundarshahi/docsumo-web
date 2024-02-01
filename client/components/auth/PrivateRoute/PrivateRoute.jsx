import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

import TabNavbar from 'client/components/layout/TabNavbar';
import Error404Page from 'client/components/pages/error/Error404Page';
import PropTypes from 'prop-types';

import Shell from 'components/layout/Shell';
import TabActivityNavbar from 'components/layout/TabActivityNavbar';

import { restrictedRoutesRegex } from './restrictedRoutes';

class PrivateRoute extends React.Component {
  static propTypes = {
    user: PropTypes.object,
  };

  render() {
    const {
      component: Component,
      tabNav,
      tabActivityNav,
      user,
      withoutShell,
      ...rest
    } = this.props;

    const routesRegex =
      user && user.role ? restrictedRoutesRegex[user.role] : [];

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
  }
}

const mapStateToProps = ({ app }) => {
  return {
    user: app.user,
  };
};

export default connect(mapStateToProps)(PrivateRoute);
