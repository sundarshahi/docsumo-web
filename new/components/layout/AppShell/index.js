import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { actions as activityActions } from 'new/redux/activities/actions';
import {
  actions as appActions,
  actionTypes as appActionTypes,
} from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { getStore, isRequestActive } from 'new/redux/helpers';
import reducers from 'new/redux/reducers';
import { bindActionCreators } from 'redux';

import cookies from 'browser-cookies';
import _ from 'lodash';
import * as api from 'new/api';
import PubNub from 'new/components/thirdParty/PubNub';
import { ALLOWED_QUERY_PARAMS_LOCAL_STORAGE } from 'new/constants';
import routes from 'new/constants/routes';
import FullPageLoader from 'new/ui-elements/PageLoader/PageLoader';
import PropTypes from 'prop-types';
import queryString from 'query-string';

const PUBLIC_ROUTES = [
  routes.LOGIN,
  routes.LOGIN_WITH_SSO,
  routes.SIGNUP,
  routes.RESET_PASSWORD,
  routes.CHANGE_PASSWORD,
  routes.MFA,
];

class AppShell extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  componentDidMount() {
    this.bootstrapApp();
  }

  async getHubspotToken() {
    try {
      const hubspotToken = await api.hubSpotToken();
      const token = _.get(hubspotToken?.responsePayload?.data, 'token');
      window.hsConversationsSettings = {
        identificationEmail: this.props.user?.email,
        identificationToken: token,
      };
      // eslint-disable-next-line no-empty
    } catch (e) {
    } finally {
      window.HubSpotConversations?.widget?.load();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.user?.userId &&
      prevProps?.user?.userId !== this.props.user?.userId
    ) {
      if (this.props.user?.userId) {
        this.loadWidgetScripts();
      } else {
        this.removeWidgetScripts();
      }
    }

    if (
      this.props.user?.email &&
      prevProps.user?.email !== this.props.user?.email
    ) {
      this.getHubspotToken();
    }

    if (
      prevProps?.config?.featureFlags?.tableGridsNewUi !==
        this.props?.config?.featureFlags?.tableGridsNewUi &&
      this.props?.config?.featureFlags?.tableGridsNewUi
    ) {
      getStore().replaceReducer(reducers);
    }
  }

  bootstrapApp = async () => {
    try {
      const token = cookies.get('token') || '';
      await this.props.appActions.setAuthToken({ token });
      await this.props.appActions.fetchUserAndConfig();
      await this.props.appActions.setInitializedFlag(true);
    } catch (e) {
      // Do nothing for now
    }

    this.setQueryParamsInLocalStorage();
  };

  setQueryParamsInLocalStorage = () => {
    const {
      location: { search },
    } = this.props;
    const searchParams = queryString.parse(search);

    for (const [key, value] of Object.entries(searchParams)) {
      if (ALLOWED_QUERY_PARAMS_LOCAL_STORAGE.includes(key))
        localStorage.setItem(key, value);
    }
  };

  loadWidgetScripts = () => {
    const beamerScript = document.getElementById('beamer-script-loader');

    if (!beamerScript) {
      this.loadBeamerWidgetScript();
    }
  };

  removeWidgetScripts = () => {
    const hubSpotScript = document.getElementById('hs-script-loader');
    const beamerScript = document.getElementById('beamer-script-loader');

    if (hubSpotScript && document.body.contains(hubSpotScript)) {
      document.body.removeChild(hubSpotScript);
    }
    if (beamerScript && document.body.contains(beamerScript)) {
      document.body.removeChild(beamerScript);
    }
  };

  loadHubSpotWidgetScript = () => {
    const script = document.createElement('script');
    script.src = '//js.hs-scripts.com/21621167.js';
    script.async = true;
    script.defer = true;
    script.id = 'hs-script-loader';
    document.body.appendChild(script);
  };

  loadBeamerWidgetScript = () => {
    window['beamer_config'] = {
      product_id: 'sNvojVHU56480', //DO NOT CHANGE: This is your product code on Beamer
      selector: '.beamerButton',
      button: false,
      user_id: this.props.user?.userId,
      user_email: this.props.user?.email,
      user_firstname: this.props.user?.fullName,
      onclose: () => {
        //refocus main window from shadow dom
        window.focus();
      },
    };

    const script = document.createElement('script');
    script.src = 'https://app.getbeamer.com/js/beamer-embed.js';
    script.id = 'beamer-script-loader';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };

  render() {
    const { isInitialized, isFetchingUserAndConfig, location, user, config } =
      this.props;

    const shouldRenderChildren = isInitialized && !isFetchingUserAndConfig;

    if (
      _.isEmpty(user) &&
      _.isEmpty(config) &&
      !PUBLIC_ROUTES.includes(location?.pathname)
    ) {
      return (
        <Redirect
          to={{
            pathname: routes.LOGIN,
            state: { from: { ...location } },
          }}
        />
      );
    }

    return (
      <>
        <PubNub />
        {shouldRenderChildren ? (
          this.props.children || null
        ) : (
          <FullPageLoader />
        )}
      </>
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
  connect(mapStateToProp, mapDispatchToProps)(AppShell)
);
