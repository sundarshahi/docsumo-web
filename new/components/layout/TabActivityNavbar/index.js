import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as activityActions } from 'new/redux/activities/actions';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Link, MoneySquare, Notes, Page, User } from 'iconoir-react';
import _ from 'lodash';
import ActivityHeader from 'new/components/layout/ActivityHeader';
import routes from 'new/constants/routes';
import Tabs from 'new/ui-elements/Tabs/Tabs';
import * as utils from 'new/utils';
import PropTypes from 'prop-types';

import styles from './index.scss';
const ACTIVITY_ROUTES = [
  {
    icon: <Notes />,
    header: 'All Activity',
    url: routes.ALL_ACTIVITY,
    gEvent: 'all activity',
    uid: 'all',
    counts: 'all',
    event: 'all_activity_click',
  },
  {
    icon: <Page />,
    header: 'Document',
    url: routes.DOCUMENT,
    gEvent: 'document',
    uid: 'document',
    counts: 'document',
    event: 'all_activity_document_click',
  },
  {
    icon: <User />,
    header: 'User',
    url: routes.USER,
    gEvent: 'user',
    uid: 'user',
    counts: 'user',
    event: 'all_activity_user_click',
  },
  {
    icon: <MoneySquare />,
    header: 'Credit',
    url: routes.CREDIT,
    gEvent: 'credit',
    uid: 'credit',
    counts: 'credit',
    event: 'all_activity_credit_click',
  },
  {
    icon: <Link />,
    header: 'Webhook',
    url: routes.WEBHOOK,
    gEvent: 'webhook',
    uid: 'webhook',
    counts: 'webhook',
    event: 'all_activity_webhook_click',
  },
];

class TabActivityNavbar extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTab: routes.ALL_ACTIVITY,
    };
  }

  componentDidMount() {
    const { history } = this.props;
    this.setActiveTab(history.location);
    this.unlisten = history.listen(this.setActiveTab);
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentDidUpdate(prevProps) {
    const { location: prevLocation } = prevProps;
    const { location, activityActions } = this.props;

    if (location.pathname !== prevLocation.pathname) {
      activityActions.fetchActivityCounts();
    }
  }

  setActiveTab = ({ pathname }) => {
    this.setState({ activeTab: pathname });
  };

  handleTabClick = (url) => {
    const { folder_id } = utils.getValidPageQueryParams(location.search, {
      folder_id: {
        type: 'string',
        default: '',
      },
    });
    if (folder_id) {
      this.props.history.push(`${url}?folder_id=${folder_id}`);
    } else {
      this.props.history.push(url);
    }
  };

  handleBakcToRoot(url) {
    this.props.history.push(url);
  }

  render() {
    const { globalActivityCounts, documents, user } = this.props;
    const { selectedFolderData = {} } = documents;

    const { activeTab } = this.state;

    const activeTabData = ACTIVITY_ROUTES.find(({ url }) => activeTab === url);

    const activityCounts = {};
    ['all', 'document', 'credit', 'user', 'webhook'].forEach((key) => {
      const value = _.get(globalActivityCounts, key);
      activityCounts[key] = _.isNumber(value) ? value : null;
    });

    const tabData = ACTIVITY_ROUTES.map((item) => ({
      ...item,
      count: _.get(globalActivityCounts, item.counts, 0),
    }));

    return (
      <>
        <div className={styles.title}>
          <h2 className='heading-6'>Activity Logs</h2>
        </div>

        <div className={cx(styles.tabs)}>
          <Tabs
            tabHeaders={tabData}
            activeTab={activeTab}
            onTabChange={this.handleTabClick}
          />
        </div>
        <ActivityHeader tab={activeTabData || {}} />
        {this.props.children}
      </>
    );
  }
}

function mapStateToProp({ app, documents, activities }) {
  const { config, user } = app;
  return {
    user: user,
    config: config,
    globalActivityCounts: activities.globalActivityCounts,
    documents,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    activityActions: bindActionCreators(activityActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(TabActivityNavbar)
);
