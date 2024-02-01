import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as activityActions } from 'client/redux/activities/actions';
import { actions as appActions } from 'client/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import routes from 'client/constants/routes';
//import TitledDropDown from 'client/components/widgets/TitledDropDown';
import * as utils from 'client/utils';
//import { ReactComponent as MailIcon } from 'images/icons/mail-activity.svg';
import { ReactComponent as CreditIcon } from 'images/icons/credit-activity.svg';
import { ReactComponent as DocumentIcon } from 'images/icons/document-activity.svg';
import { ReactComponent as NotificationIcon } from 'images/icons/notification.svg';
import { ReactComponent as UserIcon } from 'images/icons/user-activity.svg';
import { ReactComponent as WebhookIcon } from 'images/icons/webhook.svg';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import PropTypes from 'prop-types';

import ActivityHeader from 'components/layout/ActivityHeader';
//import { PageHeader } from '../page';
import { PageClickTitle } from 'components/widgets/typography';

import styles from './index.scss';
const ACTIVITY_ROUTES = [
  {
    icon: <NotificationIcon />,
    title: 'All Activity',
    url: routes.ALL_ACTIVITY,
    gEvent: 'all activity',
    uid: 'all',
    counts: 'all',
    event: 'all_activity_click',
  },
  {
    icon: <DocumentIcon />,
    title: 'Document',
    url: routes.DOCUMENT,
    gEvent: 'document',
    uid: 'document',
    counts: 'document',
    event: 'all_activity_document_click',
  },
  {
    icon: <UserIcon />,
    title: 'User',
    url: routes.USER,
    gEvent: 'user',
    uid: 'user',
    counts: 'user',
    event: 'all_activity_user_click',
  },
  {
    icon: <CreditIcon />,
    title: 'Credit',
    url: routes.CREDIT,
    gEvent: 'credit',
    uid: 'credit',
    counts: 'credit',
    event: 'all_activity_credit_click',
  },
  {
    icon: <WebhookIcon />,
    title: 'Webhook',
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
    history.listen(this.setActiveTab);
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

  handleTabClick = (e, url) => {
    const { folder_id } = utils.getValidPageQueryParams(location.search, {
      folder_id: {
        type: 'string',
        default: '',
      },
    });
    e.preventDefault();
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
    const { globalActivityCounts, documents, user, config } = this.props;
    const { selectedFolderData = {} } = documents;
    const { canSwitchToOldMode = true } = config;

    const { activeTab } = this.state;

    const activeTabData = ACTIVITY_ROUTES.find(({ url }) => activeTab === url);

    const activityCounts = {};
    ['all', 'document', 'credit', 'user', 'webhook'].forEach((key) => {
      const value = _.get(globalActivityCounts, key);
      activityCounts[key] = _.isNumber(value) ? value : null;
    });

    return (
      <>
        <div className={styles.sub_titlebox}>
          <PageClickTitle
            className={cx(styles.titleNav, {
              [styles.titleActive]: selectedFolderData.folderName,
            })}
            onClick={() => this.handleBakcToRoot(activeTab)}
          >
            Activity
          </PageClickTitle>

          {selectedFolderData.folderName && (
            <>
              <div className={styles.forwardSlash}>
                / {selectedFolderData.folderName}
              </div>
              {/* <TitledDropDown onAction={(type) => this.handleFolderAction(type, selectedFolderData)}>
                                        {selectedFolderData.folderName}
                                    </TitledDropDown>  */}
            </>
          )}
        </div>

        <div className={cx(styles.root)}>
          {ACTIVITY_ROUTES.map(
            ({ icon, title, url, counts, gEvent, event }, i) => (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                role='button'
                tabIndex={i}
                key={i}
                className={cx(styles.tab, {
                  [styles.active]: activeTab === url,
                })}
                onClick={(e) => {
                  this.handleTabClick(e, url, gEvent);
                  mixpanel.track(event, {
                    origin: title || url,
                    'work email': user.email,
                    version: 'old',
                    canSwitchUIVersion: canSwitchToOldMode,
                  });
                }}
              >
                <div className={styles.titleBox}>
                  <div className={styles.iconWrapper}>{icon}</div>
                  <p className={styles.title}>{title}</p>
                </div>
                <p className={styles.count}>
                  {activityCounts[counts] >= 10000
                    ? Math.floor(activityCounts[counts] / 1000) + 'K'
                    : activityCounts[counts] || 0}
                </p>
              </div>
            )
          )}
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
