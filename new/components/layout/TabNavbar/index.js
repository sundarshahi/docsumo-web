import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import DocumentsHeader from 'new/components/layout/DocumentsHeader';
import routes from 'new/constants/routes';
import * as documentsHelper from 'new/helpers/documents';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import * as utils from 'new/utils';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import NavSection from './components/NavSection/NavSection';
import TabsSection from './components/TabsSection/TabsSection';
import { DOCUMENTS_ROUTES } from './constants';

class TabNavbar extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTab: routes.ALL,
    };
  }

  componentDidMount() {
    const { history } = this.props;
    this.setActiveTab(history.location);
    history.listen(this.setActiveTab);
  }

  setActiveTab = ({ pathname }) => {
    this.setState({ activeTab: pathname });
  };

  getValidPageQueryParams = _.memoize((locationSearch) => {
    const dateFilterRanges = documentsHelper.generateDateFilterRanges();
    const [defaultDateRange] = dateFilterRanges;
    return utils.getValidPageQueryParams(locationSearch, {
      offset: {
        type: 'number',
        default: 0,
      },
      sort_by: {
        multiple: true,
        default: ['created_date.desc', 'modified_date.desc'],
      },
      q: {
        type: 'string',
        default: '',
      },
      created_date: {
        multiple: true,
        default: defaultDateRange.queryParamValue,
      },
      doc_type: {
        multiple: true,
        default: [],
      },
      status: {
        multiple: true,
        default: [],
      },
      user_id: {
        multiple: true,
        default: [],
      },
      folder_id: {
        type: 'string',
        default: '',
      },
      strict: {
        multiple: true,
        default: [],
      },
    });
  });

  handleTabClick = (url) => {
    let validQueryParams = this.getValidPageQueryParams(location.search);
    validQueryParams = {
      ...validQueryParams,
      offset: 0,
      sort_by: [],
    };
    const query = queryString.stringify(validQueryParams, {
      encode: false,
    });

    switch (url) {
      case routes.ALL:
        mixpanelTrackingAllEvents(MIXPANEL_EVENTS.documents_tab_click_all, {
          origin: 'My Documents',
        });
        break;
      case routes.REVIEW:
        mixpanelTrackingAllEvents(MIXPANEL_EVENTS.documents_tab_click_review, {
          origin: 'My Documents',
        });
        break;
      case routes.PROCESSED:
        mixpanelTrackingAllEvents(
          MIXPANEL_EVENTS.documents_tab_click_processed,
          { origin: 'My Documents' }
        );
        break;
      case routes.SKIPPED:
        mixpanelTrackingAllEvents(MIXPANEL_EVENTS.documents_tab_click_skipped, {
          origin: 'My Documents',
        });
        break;

      default:
        break;
    }
    url = `${url}?${query}`;

    this.props.history.push(url);
  };

  handleBackToRoot = (path) => {
    const { history } = this.props;
    history.push(path);
  };

  render() {
    const { globalDocumentCounts, documents, usersList } = this.props;
    const { selectedFolderData } = documents;

    const { activeTab } = this.state;

    const currentUser =
      usersList && usersList.length
        ? usersList.find((item) => item.default)
        : null;

    if (
      (!globalDocumentCounts || !globalDocumentCounts.all) &&
      currentUser &&
      (!currentUser.authorizedDocTypes ||
        !currentUser.authorizedDocTypes.length)
    ) {
      return (
        <>
          <NavSection
            activeTab={activeTab}
            selectedFolderData={selectedFolderData}
            onRootNavClick={null}
          />
          {this.props.children}
        </>
      );
    }

    const activeTabData = DOCUMENTS_ROUTES.find(({ url }) => activeTab === url);

    const documentCounts = {};
    ['all', 'review', 'skipped', 'processed'].forEach((key) => {
      const value = _.get(globalDocumentCounts, key);
      documentCounts[key] = _.isNumber(value) ? value : null;
    });

    return (
      <>
        <NavSection
          activeTab={activeTab}
          selectedFolderData={selectedFolderData}
          onRootNavClick={this.handleBackToRoot}
        />
        <TabsSection
          activeTab={activeTab}
          documentCounts={documentCounts}
          onTabChange={this.handleTabClick}
        />
        <DocumentsHeader tab={activeTabData || {}} />
        {this.props.children}
      </>
    );
  }
}

function mapStateToProp({ app, documents, users: { usersPage } }) {
  const { config, user } = app;
  const { users } = usersPage;

  return {
    user: user,
    config: config,
    usersList: users,
    globalDocumentCounts: documents.globalDocumentCounts,
    documents,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(TabNavbar)
);
