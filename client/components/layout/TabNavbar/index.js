import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'client/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import routes from 'client/constants/routes';
//import TitledDropDown from 'client/components/widgets/TitledDropDown';
import * as utils from 'client/utils';
import * as documentsHelper from 'helpers/documents';
import _ from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import DocumentsHeader from 'components/layout/DocumentsHeader';
//import { PageHeader } from '../page';
import { PageClickTitle } from 'components/widgets/typography';

import { DOCUMENTS_ROUTES } from './constants';

import styles from './index.scss';

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

  handleTabClick = (e, url) => {
    let validQueryParams = this.getValidPageQueryParams(location.search);
    validQueryParams = {
      ...validQueryParams,
      offset: 0,
      sort_by: [],
    };
    const query = queryString.stringify(validQueryParams, {
      encode: false,
    });
    url = `${url}?${query}`;
    e.preventDefault();
    this.props.history.push(url);
  };

  handleBakcToRoot(url) {
    this.props.history.push(url);
  }

  render() {
    const { globalDocumentCounts, documents, usersList } = this.props;
    const { selectedFolderData = {} } = documents;

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
      return <>{this.props.children}</>;
    }

    const activeTabData = DOCUMENTS_ROUTES.find(({ url }) => activeTab === url);

    const documentCounts = {};
    ['all', 'review', 'skipped', 'processed'].forEach((key) => {
      const value = _.get(globalDocumentCounts, key);
      documentCounts[key] = _.isNumber(value) ? value : null;
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
            My Documents
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
          {DOCUMENTS_ROUTES.map(({ icon, title, counts, url, gEvent }, i) => (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              role='button'
              tabIndex={i}
              key={i}
              className={cx(
                styles.tab,
                { [styles.active]: activeTab === url },
                title === 'Processed' ? 'UFTooltipProcessed' : ''
              )}
              onClick={(e) => this.handleTabClick(e, url, gEvent)}
            >
              <div className={styles.titleBox}>
                <div className={styles.iconWrapper}>{icon}</div>
                <p className={styles.title}>{title}</p>
              </div>
              <p className={styles.count}>
                {documentCounts[counts] >= 10000
                  ? Math.floor(documentCounts[counts] / 1000) + 'K'
                  : documentCounts[counts] || 0}
              </p>
            </div>
          ))}
        </div>
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
