import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import getStore from './redux/store';

import Modals from 'new/components/layout/Modals';
import Overlays from 'new/components/layout/Overlays';
import Error404Page from 'new/components/pages/error/Error404Page';
import OriginalFilePreview from 'new/components/shared/Spreadsheet/components/OriginalFilePreview/index';
import ROUTES from 'new/constants/routes';
import * as uploadHelper from 'new/helpers/upload';
import * as uploadCsvHelper from 'new/helpers/uploadcsv';
import PropTypes from 'prop-types';

import PrivateRoute from './components/auth/PrivateRoute';
import AppShell from './components/layout/AppShell';
import AllActivityPage from './components/pages/AllActivity';
import AllDocumentsPage from './components/pages/AllDocuments';
import ChangePassword from './components/pages/auth/ChangePassword/ChangePassword';
import Login from './components/pages/auth/Login/Login';
import LoginWithSSO from './components/pages/auth/Login/LoginWithSSO';
import MultiFactorAuthentication from './components/pages/auth/MultiFactorAuthentication';
import ResetPassword from './components/pages/auth/ResetPassword/ResetPassword';
import SignUp from './components/pages/auth/SignUp/SignUp';
import UpdatePassword from './components/pages/auth/UpdatePassword/UpdatePassword';
import CompareModelPage from './components/pages/CompareModelPage';
import CreditActivityPage from './components/pages/CreditActivity';
import CSVDocumentPage from './components/pages/CSVDocumentPage';
import DocumentActivityPage from './components/pages/DocumentActivity';
import DocumentsType from './components/pages/DocumentsType';
import ExcelDocumentPage from './components/pages/ExcelDocumentPage';
import ManualClassificationPage from './components/pages/ManualClassificationPage';
import { ModelHubPage } from './components/pages/ModelHubPage';
import ModelTraining from './components/pages/ModelTraining';
import ProcessedDocumentsPage from './components/pages/ProcessedDocumentsPage';
import ReviewDocumentPage from './components/pages/ReviewDocumentPage';
import ReviewDocumentsPage from './components/pages/ReviewDocumentsPage';
import SettingsPage from './components/pages/SettingsPage';
import SingleModelPage from './components/pages/SingleModelPage';
import SkippedDocumentsPage from './components/pages/SkippedDocumentsPage';
import UserActivityPage from './components/pages/UserActivity';
import WebhookActivity from './components/pages/WebhookActivity';
import ToastContainer from './components/widgets/ToastContainer';

import 'new/assets/sass/app.mono.scss';

const store = getStore();

class App extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  };

  componentDidMount() {
    // eslint-disable-next-line no-console
    uploadHelper.subscribeToStoreChanges();
    uploadCsvHelper.subscribeToStoreChanges();
    document.documentElement.setAttribute('data-design', 'new');
  }

  componentWillUnmount() {
    uploadHelper.unsubscribeFromStoreChanges();
    uploadCsvHelper.unsubscribeFromStoreChanges();
  }

  render() {
    return (
      <Provider store={store}>
        <AppShell>
          <Overlays />
          <ToastContainer />
          <Modals {...this.props} />
          <Switch>
            <Route exact path={ROUTES.LOGIN} component={Login} />
            <Route
              exact
              path={ROUTES.LOGIN_WITH_SSO}
              component={LoginWithSSO}
            />
            <Route exact path={ROUTES.SIGNUP} component={SignUp} />
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
            <Route path={ROUTES.ROOT} component={PrivateRouteManager} />
          </Switch>
        </AppShell>
      </Provider>
    );
  }
}

const PrivateRouteManager = () => (
  <>
    <Switch>
      <PrivateRoute exact path={ROUTES.ROOT} component={DocumentsType} />
      <PrivateRoute exact path={ROUTES.MODEL} component={ModelTraining} />
      <PrivateRoute
        exact
        path={ROUTES.MODEL_COMPARE}
        component={CompareModelPage}
      />
      <PrivateRoute exact path={ROUTES.MODEL_ID} component={SingleModelPage} />
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
        path={ROUTES.REVIEW_DOCUMENT_DOC_ID}
        component={ReviewDocumentPage}
        withoutShell={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.DOCUMENT_SPREADSHEET_DOC_ID}
        component={ExcelDocumentPage}
        withoutShell={true}
      />
      <PrivateRoute
        exact
        path={ROUTES.DATABASE_TABLE_DOC_ID}
        component={CSVDocumentPage}
      />
      <PrivateRoute
        exact
        path={ROUTES.EDIT_FIELD_DOC_ID}
        component={ReviewDocumentPage}
        withoutShell={true}
      />
      <PrivateRoute exact path={ROUTES.SETTINGS} component={SettingsPage} />
      <PrivateRoute
        exact
        path={ROUTES.SETTINGS_TYPE}
        component={SettingsPage}
      />
      <PrivateRoute exact path={ROUTES.SERVICES} component={ModelHubPage} />
      <PrivateRoute exact path={ROUTES.MODELHUB} component={ModelHubPage} />
      <PrivateRoute
        exact
        path={ROUTES.ORIGINAL_FILE_PREVIEW}
        component={OriginalFilePreview}
      />
      <PrivateRoute
        exact
        path={ROUTES.MANUAL_CLASSIFICATION_DOC_ID}
        component={ManualClassificationPage}
      />
      <PrivateRoute component={Error404Page} />
    </Switch>
  </>
);

export default App;
