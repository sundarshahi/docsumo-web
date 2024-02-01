import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as activityActions } from '@redux/activities/actions';
import {
  actions as appActions,
  actionTypes as appActionTypes,
} from '@redux/app/actions';
import { actions as documentActions } from '@redux/documents/actions';
import { isRequestActive } from '@redux/helpers';
import { bindActionCreators } from 'redux';

import cookies from 'browser-cookies';
import { WithDesignContext } from 'client/components/contexts/design';
import { NEW, OLD } from 'client/constants';
import FullPageLoader from 'new/ui-elements/PageLoader/PageLoader';
import PropTypes from 'prop-types';

import { ConfigContextProvider } from 'components/contexts/config';
import { UserContextProvider } from 'components/contexts/user';
import PubNub from 'components/thirdParty/PubNub';

class AppShell extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  componentDidMount() {
    this.bootstrapApp();
  }

  componentDidUpdate(prevProps) {
    /**
     * LOGIC:
     * config and user data don't update simulataneously at a single time,
     * so thats why OR Check is used for comparing previous and current value of config and user instead of AND.
     *
     */
    if (
      (prevProps.config !== this.props.config ||
        prevProps.user !== this.props.user) &&
      this.props.user &&
      this.props.config
    ) {
      this.props.updateUserAndConfig({
        user: this.props.user,
        config: this.props.config,
      });

      /**
       * This code is the single place for redirecting to new design from login page if api uiMode is new
       */
      if (this.props.config?.uiMode === NEW) {
        this.props.changeDesign(NEW);
      }
    }
  }

  bootstrapApp = async () => {
    const { contextUser, contextConfig } = this.props;
    const { setConfig, setUser } = this.props.appActions;

    try {
      const token = cookies.get('token') || '';
      await this.props.appActions.setAuthToken({ token });

      if (contextUser && contextConfig) {
        await setConfig({ config: { ...contextConfig, uiMode: OLD } });
        await setUser({ user: { ...contextUser, uiMode: OLD } });
      }

      await this.props.appActions.setInitializedFlag(true);
    } catch (e) {
      // Do nothing for now
    }
  };

  render() {
    const { user, config, isInitialized, isFetchingUserAndConfig } = this.props;
    const shouldRenderChildren = isInitialized && !isFetchingUserAndConfig;

    return (
      <UserContextProvider user={user}>
        <ConfigContextProvider config={config}>
          <PubNub />
          {shouldRenderChildren ? (
            this.props.children || null
          ) : (
            <FullPageLoader />
          )}
        </ConfigContextProvider>
      </UserContextProvider>
    );
  }
}

function mapStateToProp(state) {
  const { user, config, isInitialized } = state.app;

  const isFetchingUserAndConfig = isRequestActive(
    state,
    appActionTypes.USER_AND_CONFIG_FETCH
  );

  return {
    user,
    config,
    isFetchingUserAndConfig,
    isInitialized,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
    activityActions: bindActionCreators(activityActions, dispatch),
  };
}

export default withRouter(
  WithDesignContext(connect(mapStateToProp, mapDispatchToProps)(AppShell))
);
