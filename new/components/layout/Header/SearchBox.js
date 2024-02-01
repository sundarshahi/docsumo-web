import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as activityActions } from 'new/redux/activities/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import { Cancel, Search } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import routes from 'new/constants/routes';
import * as documentsHelper from 'new/helpers/documents';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import * as utils from 'new/utils';
import queryString from 'query-string';

import styles from './index.scss';

const searchableRoutes = [
  routes.ALL_ACTIVITY,
  routes.DOCUMENT,
  routes.USER,
  routes.CREDIT,
  routes.WEBHOOK,
];
class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      query: '',
      showClearBtn: false,
    };
    this.textInput = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  setQuery = (location) => {
    const urlQuery = _.get(this.props, 'history.location.search');
    this.setState({
      showClearBtn: !!urlQuery,
    });
    let query = utils.getValidPageQueryParams(
      location ? location.search : undefined || urlQuery,
      {
        q: {
          type: 'string',
          default: '',
        },
        offset: {
          type: 'number',
          default: 0,
        },
      }
    );

    const Searchquery = query.q || '';
    this.setState({
      query: Searchquery,
      searchText: Searchquery,
    });

    return query;
  };

  componentDidMount() {
    const { history } = this.props;
    this.setListner();
    this.setQuery();
    history.listen(this.setQuery);
  }

  handleKeyDown(e) {
    if (e.keyCode === 70 && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();

      this.textInput?.current?.focus();
    }
  }

  setListner() {
    const { searchable } = this.props;
    if (searchable) {
      document.addEventListener('keydown', this.handleKeyDown);
    } else {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  componentDidUpdate(prevProps) {
    this.setListner();

    const { location } = this.props;
    const { location: prevLocation } = prevProps;
    const { q } = utils.getValidPageQueryParams(location.search, {
      q: {
        type: 'string',
        default: '',
      },
    });
    if (
      this.props.activityFetchingStatus &&
      prevProps.activityFetchingStatus &&
      this.props.activityFetchingStatus !== prevProps.activityFetchingStatus
    ) {
      this.setState({
        searchText: '',
        query: '',
        showClearBtn: true,
      });
    }
    if (location.pathname !== prevLocation.pathname) {
      this.setState({
        searchText: q,
        query: '',
        showClearBtn: true,
      });
    }
  }

  componentWillUnmount() {
    this.setListner();
  }

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
        default: ['created_date.desc'],
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
      q: {
        type: 'string',
        default: '',
      },
      user_id: {
        multiple: true,
        default: [],
      },
      folder_id: {
        type: 'string',
        default: '',
      },
      action: {
        multiple: true,
        default: [],
      },
      strict: {
        multiple: true,
        default: [],
      },
    });
  });

  handleSearch = () => {
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'history.location.search')
    );
    const {
      docFetchingStatus,
      documentActions,
      selectedFolderId = undefined,
      activityFetchingStatus,
      activityActions,
    } = this.props;
    if (!searchableRoutes.includes(String(this.props.location.pathname))) {
      const queryParams = {
        ...pageQueryParams,
        view: 'folder',
      };
      if (selectedFolderId) {
        queryParams['folder_id'] = selectedFolderId;
      }
      documentActions[docFetchingStatus || 'allDocumentsFetch']({
        queryParams,
      });
    } else {
      activityActions[activityFetchingStatus || 'allActivityFetch']({
        queryParams: { ...pageQueryParams },
      });
    }
  };

  handleSearchChange = async (query) => {
    const { documentActions, searchQuery, history, user, canSwitchToOldMode } =
      this.props;
    const prevPageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    const currentQueryParams = {
      ...prevPageQueryParams,
      offset: 0,
      q: query ? query : undefined,
    };
    const currentQueryParamString = queryString.stringify(currentQueryParams, {
      encode: false,
    });

    const { location } = history;
    if (searchQuery || query) {
      await documentActions.searchQuery({
        query,
      });
      let pathname = location.pathname;
      mixpanel.track(MIXPANEL_EVENTS.search_value, {
        origin: pathname,
        'work email': user.email,
        value: query,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });
      await history.push({
        pathname,
        search: currentQueryParamString,
      });

      const locationQuery = this.setQuery();
      if (!locationQuery.offset) {
        this.handleSearch();
      }
    }
  };

  render() {
    const { searchable } = this.props;
    const { searchText, query, showClearBtn } = this.state;
    if (searchable) {
      return (
        <div className={styles.searchbox}>
          <Search className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder='Search'
            onChange={(e) => {
              this.setState({
                searchText: e.target.value,
              });
            }}
            title='Search (Ctrl + F)'
            value={searchText || ''}
            ref={this.textInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                this.handleSearchChange(searchText);
              }
            }}
            data-hj-allow
          />
          {showClearBtn ? (
            <div className={styles.closeBtn}>
              <IconButton
                title='Clear Search'
                variant='ghost'
                size='extra-small'
                icon={Cancel}
                onClick={() =>
                  this.setState(
                    {
                      searchText: '',
                    },
                    () => this.handleSearchChange('')
                  )
                }
              >
                <Cancel className={styles.closeIcon} />
              </IconButton>
            </div>
          ) : null}
        </div>
      );
    }
    return '';
  }
}

function mapStateToProp(state) {
  const { searchQuery, docFetchingStatus, selectedFolderId } = state.documents;
  const { activityFetchingStatus } = state.activities;

  return {
    searchQuery,
    docFetchingStatus,
    activityFetchingStatus,
    selectedFolderId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    activityActions: bindActionCreators(activityActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(SearchBox)
);
