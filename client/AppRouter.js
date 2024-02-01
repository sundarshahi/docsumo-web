import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import getStore from './redux/store';

import ChangePassword from 'client/components/pages/auth/ChangePassword/ChangePassword';
import ResetPassword from 'client/components/pages/auth/ResetPassword/ResetPassword';
import UpdatePassword from 'client/components/pages/auth/UpdatePassword/UpdatePassword';
import OriginalFilePreview from 'client/components/shared/Spreadsheet/components/OriginalFilePreview/index';
import ROUTES from 'client/constants/routes';
import SentryInit from 'client/thirdParty/sentry';
import * as uploadHelper from 'helpers/upload';
import * as uploadCsvHelper from 'helpers/uploadcsv';
import PropTypes from 'prop-types';

import AppShell from 'components/layout/AppShell';
import Modals from 'components/layout/Modals';
import Overlays from 'components/layout/Overlays';
import Error404Page from 'components/pages/error/Error404Page';

import PrivateRoute from './components/auth/PrivateRoute';
import AllActivityPage from './components/pages/AllActivity';
import AllDocumentsPage from './components/pages/AllDocuments';
import APIServicesPage from './components/pages/APIServicesPage';
import Login from './components/pages/auth/Login/Login';
import LoginWithSSO from './components/pages/auth/Login/LoginWithSSO';
import MultiFactorAuthentication from './components/pages/auth/MultiFactorAuthentication';
import SignUp from './components/pages/auth/SignUp/SignUp';
import CompareModelPage from './components/pages/CompareModelPage';
import CreditActivityPage from './components/pages/CreditActivity';
import CSVDocumentPage from './components/pages/CSVDocumentPage';
import DocumentActivityPage from './components/pages/DocumentActivity';
import DocumentsType from './components/pages/DocumentsType';
import ExcelDocumentPage from './components/pages/ExcelDocumentPage';
import ManualClassificationPage from './components/pages/ManualClassificationPage';
import ModelTraining from './components/pages/ModelTraining';
import ProcessedDocumentsPage from './components/pages/ProcessedDocumentsPage';
import ReviewDocumentPage from './components/pages/ReviewDocumentPage';
import ReviewDocumentsPage from './components/pages/ReviewDocumentsPage';
import SettingsPage from './components/pages/SettingsPage';
import SingleModelPage from './components/pages/SingleModelPage';
import SkippedDocumentsPage from './components/pages/SkippedDocumentsPage';
import UserActivityPage from './components/pages/UserActivity';
import WebhookActivity from './components/pages/WebhookActivity';

import 'client/sass/app.mono.scss';

// Initalizing Sentry Tracking Tool
SentryInit();

const store = getStore();
class App extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  };

  componentDidMount() {
    // eslint-disable-next-line no-console
    uploadHelper.subscribeToStoreChanges();
    uploadCsvHelper.subscribeToStoreChanges();
    document.documentElement.setAttribute('data-design', 'old');
  }

  componentWillUnmount() {
    uploadHelper.unsubscribeFromStoreChanges();
    uploadCsvHelper.unsubscribeFromStoreChanges();
  }

  render() {
    return (
      <Provider store={store}>
        {/* AppShell takes care of setting up token from cookie and fetching user information */}
        <AppShell>
          <Overlays />
          <Modals {...this.props} />
          <Switch>
            <Route exact path='/login/' component={Login} />
            <Route
              exact
              path={ROUTES.LOGIN_WITH_SSO}
              component={LoginWithSSO}
            />
            <Route exact path='/signup/' component={SignUp} />
            <Route
              exact
              path={ROUTES.RESET_PASSWORD}
              component={ResetPassword}
            />
            <Route
              exact
              path={ROUTES.CHANGE_PASSWORD}
              component={ChangePassword}
            />
            <Route
              exact
              path={ROUTES.UPDATE_PASSWORD}
              component={UpdatePassword}
            />
            <Route
              exact
              path={ROUTES.MFA}
              component={MultiFactorAuthentication}
            />
            <Route path='/' component={PrivateRouteManager} />
          </Switch>
        </AppShell>
      </Provider>
    );
  }
}

const PrivateRouteManager = () => {
  return (
    <Switch>
      <PrivateRoute exact path={ROUTES.ROOT} component={DocumentsType} />
      <PrivateRoute exact path={ROUTES.MODEL} component={ModelTraining} />
      <PrivateRoute
        exact
        path={ROUTES.MODEL_COMPARE}
        component={CompareModelPage}
      />
      <PrivateRoute exact path='/model/:modelId?' component={SingleModelPage} />
      <PrivateRoute
        exact
        path={ROUTES.ALL}
        component={AllDocumentsPage}
        tabNav={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.REVIEW}
        component={ReviewDocumentsPage}
        tabNav={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.SKIPPED}
        component={SkippedDocumentsPage}
        tabNav={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.PROCESSED}
        component={ProcessedDocumentsPage}
        tabNav={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.ALL_ACTIVITY}
        component={AllActivityPage}
        tabActivityNav={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.DOCUMENT}
        component={DocumentActivityPage}
        tabActivityNav={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.USER}
        component={UserActivityPage}
        tabActivityNav={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.CREDIT}
        component={CreditActivityPage}
        tabActivityNav={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.WEBHOOK}
        component={WebhookActivity}
        tabActivityNav={true}
      />
      <PrivateRoute
        exact
        path='/review-document/:docId?'
        component={ReviewDocumentPage}
        withoutShell={true}
      />
      <PrivateRoute
        exact
        path='/document-spreadsheet/:docId?'
        component={ExcelDocumentPage}
        withoutShell={true}
      />
      <PrivateRoute
        exact
        path='/database-table/:docId?'
        component={CSVDocumentPage}
      />
      <PrivateRoute
        exact
        path={ROUTES.EDIT_FIELD}
        component={ReviewDocumentPage}
        withoutShell={true}
      />
      <PrivateRoute exact path={ROUTES.SETTINGS} component={SettingsPage} />
      <PrivateRoute exact path='/settings/:type' component={SettingsPage} />
      <PrivateRoute exact path={ROUTES.SERVICES} component={APIServicesPage} />
      <PrivateRoute
        exact
        path={ROUTES.ORIGINAL_FILE_PREVIEW}
        component={OriginalFilePreview}
      />
      <PrivateRoute
        exact
        path='/manual-classification/:docId?'
        component={ManualClassificationPage}
      />
      <PrivateRoute component={Error404Page} />
    </Switch>
  );
};

export default App;
